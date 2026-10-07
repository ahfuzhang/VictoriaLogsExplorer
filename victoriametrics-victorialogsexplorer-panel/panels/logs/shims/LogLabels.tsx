import React from 'react';

export const LogLabels: React.FC<{ labels?: Record<string, string>; emptyMessage?: string }> = ({
  labels,
  emptyMessage,
}) => {
  if (!labels || Object.keys(labels).length === 0) {
    return <span>{emptyMessage ?? ''}</span>;
  }
  return (
    <span>
      {Object.entries(labels).map(([k, v]) => (
        <span key={k}>
          {k}={v}{' '}
        </span>
      ))}
    </span>
  );
};
