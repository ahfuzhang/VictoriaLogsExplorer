import React from 'react';

export const PanelDataErrorView: React.FC<{ data?: any }> = ({ data }) => {
  if (!data) {
    return <div>No data</div>;
  }
  return null;
};
