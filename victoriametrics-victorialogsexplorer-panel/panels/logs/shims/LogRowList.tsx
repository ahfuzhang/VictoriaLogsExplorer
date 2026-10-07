import React, { useEffect, useMemo, useState } from 'react';

import type { SimpleLogRow } from './logsModel';

type Props = {
  rows?: SimpleLogRow[];
  showTime?: boolean;
  wrapLogMessage?: boolean;
  expandAll?: boolean;
  highlightTerm?: string;
  wrapTags?: boolean;
  logFontSize?: number;
  onTagFilter?: (tagName: string, tagValue: string) => void;
  onTagExclude?: (tagName: string, tagValue: string) => void;
  onTagHide?: (tagName: string, tagValue: string) => void;
};

const buildHighlightParts = (text: string, term: string) => {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) {
    return text;
  }
  const normalizedText = text.toLowerCase();
  let start = 0;
  let index = normalizedText.indexOf(normalizedTerm, start);
  if (index === -1) {
    return text;
  }
  const parts: React.ReactNode[] = [];
  let matchIndex = 0;
  while (index !== -1) {
    if (index > start) {
      parts.push(text.slice(start, index));
    }
    const matchText = text.slice(index, index + normalizedTerm.length);
    parts.push(
      <span key={`m-${matchIndex}`} style={{ backgroundColor: 'rgba(255, 214, 102, 0.35)' }}>
        {matchText}
      </span>
    );
    matchIndex += 1;
    start = index + normalizedTerm.length;
    index = normalizedText.indexOf(normalizedTerm, start);
  }
  if (start < text.length) {
    parts.push(text.slice(start));
  }
  return parts;
};

const getLogLevelColor = (labels: Record<string, string>): string | undefined => {
  const entry = Object.entries(labels).find(([key]) => {
    const normalizedKey = key.toLowerCase();
    return normalizedKey === 'level' || normalizedKey === 'loglevel';
  });
  if (!entry) {
    return undefined;
  }
  const rawValue = entry[1];
  const normalizedValue = rawValue.trim().toLowerCase();
  if (!normalizedValue) {
    return undefined;
  }
  const token = normalizedValue.split(/[^a-z0-9]+/)[0] || normalizedValue;
  if (token === 'panic' || token === 'fatal') {
    return '#b277ff';
  }
  if (token === 'error' || token === 'err') {
    return '#ff6b6b';
  }
  if (token === 'warning' || token === 'warn' || token === 'wrn' || token === 'wanring') {
    return '#f2c94c';
  }
  if (token === 'info' || token === 'information') {
    return '#6fcf97';
  }
  return undefined;
};

export const LogRowList: React.FC<Props> = ({
  rows,
  showTime = true,
  wrapLogMessage = true,
  expandAll = false,
  highlightTerm = '',
  wrapTags = true,
  logFontSize,
  onTagFilter,
  onTagExclude,
  onTagHide,
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const messageFontSize = logFontSize ?? 12;
  const tagFontSize = logFontSize ?? 12;
  const iconButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: '2px',
    color: 'rgba(255, 255, 255, 0.85)',
    cursor: 'pointer',
    opacity: 0.75,
    borderRadius: '3px',
  };
  const onIconEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.opacity = '1';
    event.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
  };
  const onIconLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.opacity = '0.75';
    event.currentTarget.style.backgroundColor = 'transparent';
  };

  useEffect(() => {
    setExpandedRows({});
  }, [rows]);
  useEffect(() => {
    setExpandedRows({});
  }, [expandAll]);

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => {
      const currentOverride = prev[rowId];
      const currentExpanded = expandAll ? currentOverride !== false : currentOverride === true;
      const nextExpanded = !currentExpanded;
      if (expandAll) {
        if (nextExpanded) {
          const { [rowId]: _removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [rowId]: false };
      }
      if (nextExpanded) {
        return { ...prev, [rowId]: true };
      }
      const { [rowId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const sortedRows = useMemo(() => {
    const list = rows ? [...rows] : [];
    list.sort((a, b) => b.timeMs - a.timeMs);
    return list;
  }, [rows]);

  if (!sortedRows.length) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sortedRows.map((row) => {
        const override = expandedRows[row.id];
        const isExpanded = expandAll ? override !== false : override === true;
        const labels = Object.entries(row.labels);
        const maxTagLength = labels.reduce((max, [key]) => Math.max(max, key.length), 0);
        const timeColor = getLogLevelColor(row.labels);
        return (
          <div
            key={row.id}
            style={{
              padding: '0 8px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
              {showTime && (
                <span
                  style={{
                    fontSize: `${messageFontSize}px`,
                    color: timeColor ?? 'rgba(255, 255, 255, 0.75)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.timeText}
                </span>
              )}
              <span
                role="button"
                tabIndex={0}
                onClick={() => toggleRow(row.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleRow(row.id);
                  }
                }}
                style={{
                  fontFamily: 'monospace',
                  fontSize: `${messageFontSize}px`,
                  whiteSpace: wrapLogMessage ? 'pre-wrap' : 'pre',
                  wordBreak: 'break-word',
                  cursor: 'pointer',
                }}
              >
                {buildHighlightParts(row.message, highlightTerm)}
              </span>
            </div>
            {isExpanded && labels.length > 0 && (
              <div
                style={{
                  marginTop: '6px',
                  display: 'flex',
                  flexDirection: wrapTags ? 'column' : 'row',
                  flexWrap: wrapTags ? 'nowrap' : 'wrap',
                  gap: '0',
                  paddingLeft: '10px',
                }}
              >
                {labels.map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      fontSize: `${tagFontSize}px`,
                      color: 'rgba(255, 255, 255, 0.75)',
                      lineHeight: 1,
                      whiteSpace: wrapTags ? 'normal' : 'nowrap',
                    }}
                  >
                    {wrapTags && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginRight: '6px',
                        }}
                      >
                        <button
                          aria-label="Filter for value"
                          title="filter by this line"
                          type="button"
                          tabIndex={0}
                          style={iconButtonStyle}
                          onMouseEnter={onIconEnter}
                          onMouseLeave={onIconLeave}
                          onClick={() => onTagFilter?.(key, value)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="#fff">
                            <path d="M15,10H12V7a1,1,0,0,0-2,0v3H7a1,1,0,0,0,0,2h3v3a1,1,0,0,0,2,0V12h3a1,1,0,0,0,0-2Zm6.71,10.29L18,16.61A9,9,0,1,0,16.61,18l3.68,3.68a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,20.29ZM11,18a7,7,0,1,1,7-7A7,7,0,0,1,11,18Z"></path>
                          </svg>
                        </button>
                        <button
                          aria-label="Filter out value"
                          title="exclude by this line"
                          type="button"
                          tabIndex={0}
                          style={iconButtonStyle}
                          onMouseEnter={onIconEnter}
                          onMouseLeave={onIconLeave}
                          onClick={() => onTagExclude?.(key, value)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="#fff">
                            <path d="M21.71,20.29,18,16.61A9,9,0,1,0,16.61,18l3.68,3.68a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,20.29ZM11,18a7,7,0,1,1,7-7A7,7,0,0,1,11,18Zm4-8H7a1,1,0,0,0,0,2h8a1,1,0,0,0,0-2Z"></path>
                          </svg>
                        </button>
                        <button
                          aria-label="Show this field instead of the message"
                          title="hide this field"
                          type="button"
                          tabIndex={0}
                          style={iconButtonStyle}
                          onMouseEnter={onIconEnter}
                          onMouseLeave={onIconLeave}
                          onClick={() => onTagHide?.(key, value)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="#fff">
                            <path d="M21.92,11.6C19.9,6.91,16.1,4,12,4S4.1,6.91,2.08,11.6a1,1,0,0,0,0,.8C4.1,17.09,7.9,20,12,20s7.9-2.91,9.92-7.6A1,1,0,0,0,21.92,11.6ZM12,18c-3.17,0-6.17-2.29-7.9-6C5.83,8.29,8.83,6,12,6s6.17,2.29,7.9,6C18.17,15.71,15.17,18,12,18ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14Z"></path>
                          </svg>
                        </button>
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.88)',
                        display: wrapTags ? 'inline-block' : 'inline',
                        width: wrapTags && maxTagLength > 0 ? `${maxTagLength}ch` : undefined,
                        marginRight: '6px',
                      }}
                    >
                      {buildHighlightParts(key, highlightTerm)}
                    </span>:&nbsp;&nbsp;
                    <span style={{ fontFamily: 'monospace' }}>{buildHighlightParts(value, highlightTerm)}</span>
                    {!wrapTags ? <span style={{ marginRight: '8px' }}>,</span> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
