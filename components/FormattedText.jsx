'use client';

import React from 'react';

/**
 * Helper to parse inline bold syntax (**text**, <b>text</b>, <strong>text</strong>)
 */
function renderInlineFormatting(str) {
  if (!str) return null;

  // Replace <b> and <strong> tags with ** markdown equivalent for uniform parsing
  let normalized = str
    .replace(/<\/?(b|strong)>/gi, '**');

  // Split by ** delimiters
  const parts = normalized.split(/\*\*/g);

  if (parts.length === 1) {
    return str;
  }

  return parts.map((part, i) => {
    // Odd index parts were wrapped in ** ... **
    if (i % 2 === 1) {
      return (
        <strong key={i} className="font-bold">
          {part}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Checks if line is a bullet item (e.g. "• item", "- item", "* item", "▪ item", "1. item")
 */
function getBulletMatch(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Check bullet symbols
  const bulletSymbolMatch = trimmed.match(/^([•\-\*▪▫⁃‣])\s+(.*)$/);
  if (bulletSymbolMatch) {
    return { type: 'unordered', content: bulletSymbolMatch[2] };
  }

  // Check numbered list items like "1. ", "2) "
  const numberMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
  if (numberMatch) {
    return { type: 'ordered', number: numberMatch[1], content: numberMatch[2] };
  }

  // Check lines starting with a standalone bullet without space e.g. "•item"
  const tightBulletMatch = trimmed.match(/^([•▪▫⁃‣])(.*)$/);
  if (tightBulletMatch) {
    return { type: 'unordered', content: tightBulletMatch[2].trim() };
  }

  return null;
}

export default function FormattedText({ text, className = '', clamp = '' }) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const rawLines = text.split(/\r?\n/);
  const elements = [];

  let currentList = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'unordered') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-inside my-1 space-y-1 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="text-inherit leading-relaxed">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
      } else if (currentList.type === 'ordered') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal list-inside my-1 space-y-1 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="text-inherit leading-relaxed">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  rawLines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const bulletMatch = getBulletMatch(line);

    if (bulletMatch) {
      if (!currentList || currentList.type !== bulletMatch.type) {
        flushList();
        currentList = { type: bulletMatch.type, items: [] };
      }
      currentList.items.push(bulletMatch.content);
    } else {
      flushList();
      elements.push(
        <p key={`p-${lineIdx}`} className="my-0.5 leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  });

  flushList();

  return (
    <div className={`${clamp} ${className}`}>
      {elements}
    </div>
  );
}
