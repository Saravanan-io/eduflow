import React from 'react';

const ProgressBar = ({ progress, height = '8px', color = 'var(--primary)', showText = true }) => {
  return (
    <div className="progress-container" style={{ width: '100%', marginBottom: '1rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
        {showText && <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Progress</span>}
        {showText && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{progress}%</span>}
      </div>
      <div 
        className="progress-track" 
        style={{ 
          height, 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '10px', 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div 
          className="progress-fill" 
          style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: color,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 12px ${color}`
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
