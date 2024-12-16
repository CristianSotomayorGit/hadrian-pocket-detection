import React from 'react';
import './PocketInfo.css'

interface PocketInfoProps {
  selectedPocket: number;
}

const PocketInfo: React.FC<PocketInfoProps> = ({ selectedPocket }) => (
  <div className="pocket-info">
    <h3>Selected Pocket: {selectedPocket}</h3>
  </div>
);

export default PocketInfo;
