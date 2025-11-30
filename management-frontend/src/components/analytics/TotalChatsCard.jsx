import React from 'react';

const TotalChatsCard = ({ count = 0 }) => {
  return (
    <div className="analytics-card">
      <div className="analytics-card-row">
        <div className="analytics-card-content">
          <h3 className="analytics-card-title">Total Chats</h3>
          <p className="analytics-card-description">
            This metric Shows the total number of chats for all Channels for the selected the selected period
          </p>
        </div>
        <div className="analytics-metric">
          <span className="analytics-metric-value" style={{ color: '#00D907' }}>{count} Chats</span>
        </div>
      </div>
    </div>
  );
};

export default TotalChatsCard;