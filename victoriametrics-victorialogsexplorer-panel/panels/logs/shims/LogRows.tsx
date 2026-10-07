import React from 'react';

import { LogRowList } from './LogRowList';
import type { SimpleLogRow } from './logsModel';

export const LogRows: React.FC<{
  logRows?: SimpleLogRow[];
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
  logRows,
  showTime,
  wrapLogMessage,
  expandAll,
  highlightTerm,
  wrapTags,
  logFontSize,
  onTagFilter,
  onTagExclude,
  onTagHide,
  children,
}) => {
  return (
    <div>
      <LogRowList
        rows={logRows}
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
