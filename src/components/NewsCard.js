import React from 'react';
import './NewsCard.css';

const NewsCard = ({ title, description, category }) => {
  return (
    <div className="news-card">
      <div className="news-card-header">
        <span className="news-badge">{category}</span>
      </div>
      <div className="news-card-body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="news-card-footer">
        <button className="read-more-btn">Read More →</button>
      </div>
    </div>
  );
};

export default NewsCard;
