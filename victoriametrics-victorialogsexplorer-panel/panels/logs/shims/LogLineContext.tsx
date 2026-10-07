import React from 'react';

export const LogLineContext: React.FC<{
  open?: boolean;
  onClose?: () => void;
}> = ({ open, onClose }) => {
  if (!open) {
    return null;
  }
  return <div onClick={onClose}>Log line context not available in this build.</div>;
};
