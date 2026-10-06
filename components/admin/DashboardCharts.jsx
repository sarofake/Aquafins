'use client';

import { useState } from 'react';
import { LineChart, PieChart, Layers, Package, FolderTree, TrendingUp, CheckCircle2, Info } from 'lucide-react';

const PALETTE = [
  { bar: 'bg-gradient-to-t from-cyan-600 to-cyan-400', hex: '#0891b2', bgLight: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  { bar: 'bg-gradient-to-t from-emerald-600 to-emerald-400', hex: '#059669', bgLight: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bar: 'bg-gradient-to-t from-violet-600 to-violet-400', hex: '#7c3aed', bgLight: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  { bar: 'bg-gradient-to-t from-amber-500 to-amber-300', hex: '#d97706', bgLight: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { bar: 'bg-gradient-to-t from-blue-600 to-blue-400', hex: '#2563eb', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { bar: 'bg-gradient-to-t from-pink-600 to-pink-400', hex: '#db2777', bgLight: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  { bar: 'bg-gradient-to-t from-teal-600 to-teal-400', hex: '#0d9488', bgLight: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  { bar: 'bg-gradient-to-t from-indigo-600 to-indigo-400', hex: '#4f46e5', bgLight: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
];

export default function DashboardCharts({ stats, categoryBreakdown = [] }) {
  const [activeTab, setActiveTab] = useState('line'); // 'line' | 'donut' | 'summary'
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const totalProducts = stats.products || 0;
  const totalCategories = stats.categories || 0;
  const availableProducts = stats.availableProducts || 0;
  const outOfStockProducts = stats.outOfStockProducts || 0;

  const categories = categoryBreakdown.length > 0 ? categoryBreakdown : [];
  const maxCount = Math.max(...categories.map((c) => c.count || 0), 1);

  const categoriesWithProductsCount = categories.filter((c) => (c.count || 0) > 0).length;
  const avgProductsPerCategory = totalCategories > 0 ? (totalProducts / totalCategories).toFixed(1) : 0;
  const inStockPercentage = totalProducts > 0 ? Math.round((availableProducts / totalProducts) * 100) : 100;

  // Calculate SVG Line & Area coordinates
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingLeft = 50;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 25;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const linePoints = categories.map((cat, idx) => {
    const x =
      categories.length > 1
        ? paddingLeft + (idx / (categories.length - 1)) * chartWidth
        : paddingLeft + chartWidth / 2;
    const y = paddingTop + chartHeight - ((cat.count || 0) / maxCount) * chartHeight;
    return { ...cat, x, y, idx };
  });

  // Build SVG path strings
  let pathD = '';
  let areaD = '';
  if (linePoints.length > 0) {
    pathD = `M ${linePoints[0].x} ${linePoints[0].y}`;
    for (let i = 1; i < linePoints.length; i++) {
      const prev = linePoints[i - 1];
      const curr = linePoints[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }

    const firstX = linePoints[0].x;
    const lastX = linePoints[linePoints.length - 1].x;
    const bottomY = paddingTop + chartHeight;
    areaD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  // Calculate SVG Donut Chart Slices
  let cumulativeAngle = 0;
  const totalCategoryProducts = categories.reduce((sum, c) => sum + (c.count || 0), 0) || 1;
  const donutSlices = categories.map((cat, idx) => {
    const colorObj = PALETTE[idx % PALETTE.length];
    const percentage = (cat.count || 0) / totalCategoryProducts;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    const x1 = 50 + 40 * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = 50 + 40 * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = 50 + 40 * Math.cos((Math.PI * (startAngle + angle - 90)) / 180);
    const y2 = 50 + 40 * Math.sin((Math.PI * (startAngle + angle - 90)) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData =
      angle >= 359.9
        ? 'M 50 10 A 40 40 0 1 1 49.99 10 Z'
        : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      ...cat,
      colorObj,
      angle,
      percentage: Math.round(percentage * 100),
      pathData,
    };
  });

  return (
    <div className="mb-8 space-y-6">
      {/* MAIN CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Total Products & Category Trends</h3>
              <span className="bg-cyan-100 text-cyan-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Interactive Line Chart
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visual curve mapping total products distributed across categories
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'line'
                  ? 'bg-white text-cyan-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChart className="w-4 h-4" /> Line Graph
            </button>
            <button
              onClick={() => setActiveTab('donut')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'donut'
                  ? 'bg-white text-cyan-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-4 h-4" /> Distribution
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-white text-cyan-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" /> Ratio Stats
            </button>
          </div>
        </div>

        {/* SUMMARY KPI QUICK STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <Package className="w-3.5 h-3.5 text-cyan-600" /> Total Products
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalProducts}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {availableProducts} In Stock
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <FolderTree className="w-3.5 h-3.5 text-emerald-600" /> Total Categories
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalCategories}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {categoriesWithProductsCount} active with items
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-violet-600" /> Products / Category
            </div>
            <div className="text-2xl font-bold text-slate-900">{avgProductsPerCategory}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Average density</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <Info className="w-3.5 h-3.5 text-amber-600" /> Stock Availability
            </div>
            <div className="text-2xl font-bold text-slate-900">{inStockPercentage}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {outOfStockProducts > 0 ? `${outOfStockProducts} out of stock` : 'All items available'}
            </div>
          </div>
        </div>

        {/* TAB 1: LINE GRAPH (DEFAULT) */}
        {activeTab === 'line' && (
          <div>
            {categories.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No category data available to plot line graph.
              </div>
            ) : (
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 relative">
                {/* SVG LINE CHART */}
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px] relative">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0891b2" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="lineStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#0891b2" />
                          <stop offset="50%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>

                      {/* Y-Axis Horizontal Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const yVal = paddingTop + chartHeight * (1 - ratio);
                        const labelVal = Math.round(maxCount * ratio);
                        return (
                          <g key={i}>
                            <line
                              x1={paddingLeft}
                              y1={yVal}
                              x2={svgWidth - paddingRight}
                              y2={yVal}
                              stroke="#e2e8f0"
                              strokeDasharray={i === 0 || i === 4 ? '' : '4 4'}
                            />
                            <text
                              x={paddingLeft - 10}
                              y={yVal + 4}
                              textAnchor="end"
                              className="text-[10px] fill-slate-400 font-medium"
                            >
                              {labelVal}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fill */}
                      {areaD && <path d={areaD} fill="url(#areaGradient)" />}

                      {/* Smooth Line Curve */}
                      {pathD && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="url(#lineStrokeGradient)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Data Nodes & Vertical Hover Lines */}
                      {linePoints.map((pt) => {
                        const isHovered = hoveredCategory === pt.id;
                        const colorObj = PALETTE[pt.idx % PALETTE.length];

                        return (
                          <g key={pt.id || pt.idx}>
                            {/* Vertical Guide Line on Hover */}
                            {isHovered && (
                              <line
                                x1={pt.x}
                                y1={paddingTop}
                                x2={pt.x}
                                y2={paddingTop + chartHeight}
                                stroke="#0891b2"
                                strokeDasharray="3 3"
                                strokeWidth="1.5"
                              />
                            )}

                            {/* Node Outer Halo Circle */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? '9' : '5'}
                              fill={isHovered ? colorObj.hex : '#ffffff'}
                              stroke={colorObj.hex}
                              strokeWidth="2.5"
                              className="transition-all duration-200 cursor-pointer"
                              onMouseEnter={() => setHoveredCategory(pt.id)}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />

                            {/* Node Core Dot */}
                            {isHovered && (
                              <circle cx={pt.x} cy={pt.y} r="3.5" fill="#ffffff" className="pointer-events-none" />
                            )}

                            {/* Value Label above node (shown on hover or when few points) */}
                            {(isHovered || linePoints.length <= 8) && (
                              <text
                                x={pt.x}
                                y={pt.y - 10}
                                textAnchor="middle"
                                className={`text-[10px] font-bold transition-all pointer-events-none ${
                                  isHovered ? 'fill-slate-900 text-xs' : 'fill-slate-500'
                                }`}
                              >
                                {pt.count || 0}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    {/* Tooltip Overlay */}
                    {hoveredCategory && (
                      <div className="absolute top-2 right-4 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg border border-slate-700 pointer-events-none animate-in fade-in duration-150 z-20">
                        {(() => {
                          const item = categories.find((c) => c.id === hoveredCategory);
                          if (!item) return null;
                          return (
                            <div>
                              <div className="font-bold text-cyan-300">{item.name}</div>
                              <div className="text-slate-200 font-semibold mt-0.5">
                                {item.count || 0} Products ({item.percentage}% of total)
                              </div>
                              <div className="text-[10px] text-slate-400">
                                In Stock: {item.availableCount || 0} items
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DONUT CHART */}
        {activeTab === 'donut' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4">
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div className="w-64 h-64 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {donutSlices.map((slice, idx) => (
                    <path
                      key={slice.id || idx}
                      d={slice.pathData}
                      fill={slice.colorObj.hex}
                      onMouseEnter={() => setHoveredCategory(slice.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`transition-all duration-200 cursor-pointer ${
                        hoveredCategory === slice.id ? 'opacity-100 scale-105 transform origin-center' : 'opacity-90 hover:opacity-100'
                      }`}
                    />
                  ))}
                  <circle cx="50" cy="50" r="26" fill="#ffffff" />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-slate-900">{totalProducts}</span>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Total Items
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-2 max-h-80 overflow-y-auto pr-1">
              {donutSlices.map((cat) => (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                    hoveredCategory === cat.id
                      ? `${cat.colorObj.bgLight} ${cat.colorObj.border} shadow-sm font-semibold`
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.colorObj.hex }}
                    />
                    <div>
                      <div className="font-semibold text-slate-800">{cat.name}</div>
                      <div className="text-[10px] text-slate-400">
                        In stock: {cat.availableCount || 0}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{cat.count || 0} items</div>
                    <div className="text-[11px] text-slate-500">{cat.percentage}% of total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SUMMARY & RATIOS */}
        {activeTab === 'summary' && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-600" /> Catalog Distribution Ratio
                </h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  On average, each category contains <strong className="text-cyan-700">{avgProductsPerCategory}</strong> products.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-700 font-semibold mb-1">
                      <span>Categories populated with products</span>
                      <span>{categoriesWithProductsCount} / {totalCategories}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${totalCategories > 0 ? (categoriesWithProductsCount / totalCategories) * 100 : 0}%`,
                        }}
                        className="bg-emerald-500 h-full rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 font-semibold mb-1">
                      <span>In-Stock Availability Ratio</span>
                      <span>{inStockPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${inStockPercentage}%` }}
                        className="bg-cyan-600 h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-emerald-600" /> Total Count Comparison
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-lg">
                    <span className="font-semibold text-slate-700">Total Products</span>
                    <span className="font-bold text-cyan-700 text-sm">{totalProducts}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-lg">
                    <span className="font-semibold text-slate-700">Total Categories</span>
                    <span className="font-bold text-emerald-700 text-sm">{totalCategories}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-lg">
                    <span className="font-semibold text-slate-700">Available / Active Items</span>
                    <span className="font-bold text-blue-700 text-sm">{availableProducts}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-lg">
                    <span className="font-semibold text-slate-700">Carousel Banner Slides</span>
                    <span className="font-bold text-amber-700 text-sm">{stats.slides || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
