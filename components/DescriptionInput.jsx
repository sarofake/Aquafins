'use client';

import React, { useState, useRef } from 'react';
import { Bold, List, ListOrdered, Eye, Edit3, HelpCircle } from 'lucide-react';
import FormattedText from './FormattedText';

export default function DescriptionInput({
  label = 'Description',
  value = '',
  onChange,
  placeholder = 'Enter or paste product details...',
  rows = 4,
  required = false,
  className = '',
}) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  const handleBold = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = selected ? `**${selected}**` : '**bold text**';
    const nextValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextValue);

    setTimeout(() => {
      el.focus();
      if (selected) {
        el.setSelectionRange(start, start + replacement.length);
      } else {
        el.setSelectionRange(start + 2, start + 11);
      }
    }, 10);
  };

  const handleBulletList = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);

    let replacement = '';
    if (selected.trim()) {
      replacement = selected
        .split('\n')
        .map((line) => (line.trim().startsWith('•') ? line : `• ${line.trim()}`))
        .join('\n');
    } else {
      const prefix = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
      replacement = `${prefix}• Item 1\n• Item 2`;
    }

    const nextValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextValue);

    setTimeout(() => {
      el.focus();
    }, 10);
  };

  const handleNumberedList = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);

    let replacement = '';
    if (selected.trim()) {
      replacement = selected
        .split('\n')
        .map((line, i) => `${i + 1}. ${line.replace(/^([•\-\*▪▫\d+[\.\)]])\s*/, '').trim()}`)
        .join('\n');
    } else {
      const prefix = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
      replacement = `${prefix}1. Item 1\n2. Item 2`;
    }

    const nextValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextValue);

    setTimeout(() => {
      el.focus();
    }, 10);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label & Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-cyan-600">*</span>}
        </label>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={handleBold}
            title="Add Bold (**text**)"
            className="p-1 text-slate-600 hover:text-cyan-700 hover:bg-white rounded transition-colors cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleBulletList}
            title="Add Bullet List (• item)"
            className="p-1 text-slate-600 hover:text-cyan-700 hover:bg-white rounded transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNumberedList}
            title="Add Numbered List (1. item)"
            className="p-1 text-slate-600 hover:text-cyan-700 hover:bg-white rounded transition-colors cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-slate-300 mx-0.5" />
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
              showPreview
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            title="Toggle Live Preview"
          >
            {showPreview ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showPreview ? 'Edit' : 'Preview'}</span>
          </button>
        </div>
      </div>

      {/* Editor / Preview Area */}
      {showPreview ? (
        <div className="w-full bg-slate-50 border border-cyan-300 rounded-xl p-3 text-xs text-slate-800 min-h-[5rem] overflow-y-auto">
          {value.trim() ? (
            <FormattedText text={value} />
          ) : (
            <p className="text-slate-400 italic text-[11px]">No text entered yet. Switch to edit mode to type or paste text.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white transition-all font-mono leading-relaxed"
        />
      )}

      {/* Formatting tip hint */}
      <p className="text-[10px] text-slate-400 flex items-center gap-1">
        <HelpCircle className="w-3 h-3 shrink-0 text-slate-400" />
        <span>Pasted bullets (•, -, *), numbered lists, &amp; bold (**text**) are formatted automatically.</span>
      </p>
    </div>
  );
}
