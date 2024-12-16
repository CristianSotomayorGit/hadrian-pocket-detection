import React from 'react';
import './DetectButton.css';

interface DetectButtonProps {
  isActive: boolean;
  onClick: () => void;
}

const DetectButton: React.FC<DetectButtonProps> = ({ isActive, onClick }) => {
  return (
    <button onClick={onClick} className="detect-button">
      {isActive ? 'Hide Pockets' : 'Find Pockets'}
    </button>
  );
};

export default DetectButton;
