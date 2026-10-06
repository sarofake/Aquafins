/**
 * Pure WebGL Interactive Water Ripples Engine
 * Zero external dependencies, 60FPS GPU hardware acceleration
 */
export class WaterRipples {
  constructor(canvas, imageSrc, options = {}) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!this.gl) return;

    this.options = {
      resolution: options.resolution || 384,
      dropRadius: options.dropRadius || 18,
      perturbance: options.perturbance || 0.08,
      damping: options.damping || 0.85,
      ...options,
    };

    this.width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth;
    this.height = canvas.parentElement ? canvas.parentElement.offsetHeight : 600;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.cols = this.options.resolution;
    this.rows = Math.floor(this.cols * (this.height / this.width));

    this.bufferSize = this.cols * this.rows;
    this.buffer1 = new Float32Array(this.bufferSize);
    this.buffer2 = new Float32Array(this.bufferSize);

    this.initShaders();
    this.initTextures();
    if (imageSrc) {
      this.loadImage(imageSrc);
    }

    this.bindEvents();
    this.animate();
  }

  initShaders() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        v_uv.y = 1.0 - v_uv.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      uniform sampler2D u_displacement;
      uniform vec2 u_resolution;
      uniform float u_perturbance;
      uniform bool u_hasTexture;
      varying vec2 v_uv;

      void main() {
        vec2 step = 1.0 / u_resolution;
        float left = texture2D(u_displacement, v_uv - vec2(step.x, 0.0)).r;
        float right = texture2D(u_displacement, v_uv + vec2(step.x, 0.0)).r;
        float top = texture2D(u_displacement, v_uv - vec2(0.0, step.y)).r;
        float bottom = texture2D(u_displacement, v_uv + vec2(0.0, step.y)).r;

        vec2 duv = vec2(left - right, top - bottom) * u_perturbance;
        vec2 refractedUV = clamp(v_uv + duv, 0.0, 1.0);

        vec4 color = u_hasTexture ? texture2D(u_texture, refractedUV) : vec4(0.02, 0.06, 0.14, 1.0);

        // Caustic specular highlight on wave crests
        float spec = clamp((left - right + top - bottom) * 4.5, 0.0, 0.75);
        color.rgb += vec3(spec * 0.85, spec * 0.95, spec);

        gl_FragColor = color;
      }
    `;

    const compile = (src, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compile(vsSource, gl.VERTEX_SHADER));
    gl.attachShader(program, compile(fsSource, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    this.program = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    this.attribPosition = gl.getAttribLocation(program, 'a_position');
    this.uniformTexture = gl.getUniformLocation(program, 'u_texture');
    this.uniformDisplacement = gl.getUniformLocation(program, 'u_displacement');
    this.uniformResolution = gl.getUniformLocation(program, 'u_resolution');
    this.uniformPerturbance = gl.getUniformLocation(program, 'u_perturbance');
    this.uniformHasTexture = gl.getUniformLocation(program, 'u_hasTexture');
  }

  initTextures() {
    const gl = this.gl;

    this.bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.dispTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.dispTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  setImage(src) {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (this.isDestroyed) return;
      const gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      this.hasTexture = true;
    };
    img.src = src;
  }

  loadImage(src) {
    this.setImage(src);
  }

  drop(x, y, radius, strength) {
    const gx = Math.floor((x / this.width) * this.cols);
    const gy = Math.floor((y / this.height) * this.rows);
    const r = Math.floor((radius / this.width) * this.cols);

    for (let i = -r; i <= r; i++) {
      const cy = gy + i;
      if (cy < 1 || cy >= this.rows - 1) continue;
      for (let j = -r; j <= r; j++) {
        const cx = gx + j;
        if (cx < 1 || cx >= this.cols - 1) continue;
        if (j * j + i * i <= r * r) {
          const factor = Math.cos((Math.sqrt(j * j + i * i) / r) * (Math.PI / 2));
          this.buffer1[cy * this.cols + cx] += strength * factor;
        }
      }
    }
  }

  stepSimulation() {
    const damping = this.options.damping;
    for (let y = 1; y < this.rows - 1; y++) {
      let idx = y * this.cols + 1;
      for (let x = 1; x < this.cols - 1; x++, idx++) {
        this.buffer2[idx] =
          (this.buffer1[idx - 1] +
            this.buffer1[idx + 1] +
            this.buffer1[idx - this.cols] +
            this.buffer1[idx + this.cols]) *
            0.5 -
          this.buffer2[idx];
        this.buffer2[idx] *= damping;
      }
    }

    const temp = this.buffer1;
    this.buffer1 = this.buffer2;
    this.buffer2 = temp;
  }

  uploadDisplacement() {
    const gl = this.gl;
    const pixels = new Uint8Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      pixels[i] = Math.min(255, Math.max(0, (this.buffer1[i] + 1.0) * 127.5));
    }

    gl.bindTexture(gl.TEXTURE_2D, this.dispTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      this.cols,
      this.rows,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      pixels
    );
  }

  bindEvents() {
    const section = this.canvas.parentElement;
    if (!section) return;

    let lastPoint = null;

    const getPos = (e) => {
      const rect = section.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    this.onMove = (e) => {
      const pos = getPos(e);
      if (!lastPoint) {
        this.drop(pos.x, pos.y, 16, 45);
        lastPoint = pos;
        return;
      }
      const dx = pos.x - lastPoint.x;
      const dy = pos.y - lastPoint.y;
      if (Math.hypot(dx, dy) > 4) {
        this.drop(pos.x, pos.y, 14, 40);
        lastPoint = pos;
      }
    };

    this.onClick = (e) => {
      const pos = getPos(e);
      this.drop(pos.x, pos.y, 28, 95);
    };

    section.addEventListener('pointermove', this.onMove);
    section.addEventListener('click', this.onClick);
  }

  animate() {
    if (this.isDestroyed) return;

    this.stepSimulation();
    this.uploadDisplacement();

    const gl = this.gl;
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.program);

    gl.enableVertexAttribArray(this.attribPosition);
    gl.vertexAttribPointer(this.attribPosition, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
    gl.uniform1i(this.uniformTexture, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.dispTexture);
    gl.uniform1i(this.uniformDisplacement, 1);

    gl.uniform2f(this.uniformResolution, this.cols, this.rows);
    gl.uniform1f(this.uniformPerturbance, this.options.perturbance);
    gl.uniform1i(this.uniformHasTexture, this.hasTexture ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.animId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.isDestroyed = true;
    if (this.animId) cancelAnimationFrame(this.animId);
    const section = this.canvas.parentElement;
    if (section) {
      section.removeEventListener('pointermove', this.onMove);
      section.removeEventListener('click', this.onClick);
    }
  }
}
