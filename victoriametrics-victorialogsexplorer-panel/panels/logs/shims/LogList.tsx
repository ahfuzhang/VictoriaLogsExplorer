import React from 'react';

import { LogRowList } from './LogRowList';
import type { SimpleLogRow } from './logsModel';

export const LogList: React.FC<{
  logs?: SimpleLogRow[];
  showTime?: boolean;
  wrapLogMessage?: boolean;
  expandAll?: boolean;
  highlightTerm?: string;
  wrapTags?: boolean;
  logFontSize?: number;
  onTagFilter?: (tagName: string, tagValue: string) => void;
  onTagExclude?: (tagName: string, tagValue: string) => void;
  onTagHide?: (tagName: string, tagValue: string) => void;
  children?: React.ReactNode;
}> = ({
  children,
  logs,
  showTime,
  wrapLogMessage,
  expandAll,
  highlightTerm,
  wrapTags,
  logFontSize,
  onTagFilter,
  onTagExclude,
  onTagHide,
}) => {
  if (!logs || logs.length === 0) {
    return null;
  }
  return (
    <div>
      <LogRowList
        rows={logs}
        showTime={showTime}
        wrapLogMessage={wrapLogMessage}
        expandAll={expandAll}
        highlightTerm={highlightTerm}
        wrapTags={wrapTags}
        logFontSize={logFontSize}
        onTagFilter={onTagFilter}
        onTagExclude={onTagExclude}
        onTagHide={onTagHide}
      />
      {children}
    </div>
  );
};
