import React from 'react';

export const LogRowContextModal: React.FC<{
  open?: boolean;
  onClose?: () => void;
}> = ({ open, onClose }) => {
  if (!open) {
    return null;
  }
  return <div onClick={onClose}>Log context not available in this build.</div>;
};
