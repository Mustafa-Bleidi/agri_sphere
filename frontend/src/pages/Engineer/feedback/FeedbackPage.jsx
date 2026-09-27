import React, { useState } from 'react';
import { Star, TrendingUp, User } from 'lucide-react';
import './feedback.css';
const FeedbackStats = ({ averageRating, oneStarReviews, fiveStarReviews, thisMonthIncrease }) => (
  <div className="feedback-stats-grid">
    <div className="feedback-card">
      <div className="stats-card">
        <div className="stats-card-content">
          <h3>Average Rating</h3>
          <div className="stats-value">{averageRating}</div>
          <div className="stars-container">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={20} 
                className={`star-icon ${i < Math.floor(Number(averageRating)) ? 'star-filled' : 'star-empty'}`} 
              />
            ))}
          </div>
        </div>
        <Star className="icon-yellow" size={24} />
      </div>
    </div>
    
    <div className="feedback-card">
      <div className="stats-card">
        <div className="stats-card-content">
          <h3>1 Star Reviews</h3>
          <div className="stats-value">{oneStarReviews}</div>
        </div>
        <svg 
          className="icon-red" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M16 17h6v-6" />
          <path d="m22 17-8.5-8.5-5 5L2 7" />
        </svg>
      </div>
    </div>
    
    <div className="feedback-card">
      <div className="stats-card">
        <div className="stats-card-content">
          <h3>5 Star Reviews</h3>
          <div className="stats-value">{fiveStarReviews}</div>
        </div>
        <Star className="icon-yellow star-filled" size={24} />
      </div>
    </div>
    
    <div className="feedback-card">
      <div className="stats-card">
        <div className="stats-card-content">
          <h3>This Month</h3>
          <div className="stats-value">+{thisMonthIncrease}</div>
        </div>
        <TrendingUp className="icon-purple" size={24} />
      </div>
    </div>
  </div>
);

const RatingDistribution = ({ ratingDistribution }) => (
  <div className="feedback-card rating-distribution">
    <h3>Rating Distribution</h3>
    <div>
      {[5, 4, 3, 2, 1].map(rating => (
        <div key={rating} className="rating-item">
          <div className="rating-label">
            <Star className="icon-yellow" size={16} />
            <span>{rating}</span>
          </div>
          <div className="rating-bar-container">
            <div 
              className="rating-bar" 
              style={{ width: `${ratingDistribution[rating] || 0}%` }}
            ></div>
          </div>
          <span className="rating-percentage">{ratingDistribution[rating] || 0}%</span>
        </div>
      ))}
    </div>
  </div>
);

const CategoryFilters = ({ selectedCategory, setSelectedCategory }) => (
  <div className="category-filters">
    {['all', 'consultation', 'product', 'pest'].map(cat => (
      <button
        key={cat}
        onClick={() => setSelectedCategory(cat)}
        className={`category-button ${selectedCategory === cat ? 'active' : ''}`}
      >
        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    ))}
  </div>
);

const FeedbackList = ({ filteredFeedback, getCategoryBadgeColor, getCategoryLabel }) => (
  <div className="feedback-card feedback-list-card">
    <h3>Farmer Feedback ({filteredFeedback.length})</h3>
    <div className="feedback-items">
      {filteredFeedback.length > 0 ? (
        filteredFeedback.map(fb => (
          <div key={fb.id} className="feedback-item">
            <div className="feedback-item-content">
              <div className="feedback-user">
                <User className="feedback-user-icon" size={20} />
                <div className="feedback-user-info">
                  <p>Farmer {fb.farmer}</p>
                  <p>{fb.date}</p>
                </div>
              </div>
              <div className="category-badge-container">
                <span className={`category-badge ${getCategoryBadgeColor(fb.type)}`}>
                  {getCategoryLabel(fb.type)}
                </span>
              </div>
            </div>
            <div className="stars-container">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  className={i < fb.rating ? 'icon-yellow star-filled' : 'star-empty'} 
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="no-feedback">No feedback found for the selected category.</div>
      )}
    </div>
  </div>
);

const FeedbackPage = ({ feedback }) => {
  const averageRating = feedback.length > 0 ? 
    (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : '0.0';
  
  const oneStarReviews = feedback.filter(f => f.rating === 1).length;
  const fiveStarReviews = feedback.filter(f => f.rating === 5).length;
  const thisMonthIncrease = 4;

  const ratingCounts = {
    5: feedback.filter(f => f.rating === 5).length,
    4: feedback.filter(f => f.rating === 4).length,
    3: feedback.filter(f => f.rating === 3).length,
    2: feedback.filter(f => f.rating === 2).length,
    1: feedback.filter(f => f.rating === 1).length
  };
  
  const totalReviews = feedback.length;
  const ratingDistribution = {};
  
  for (let rating = 5; rating >= 1; rating--) {
    ratingDistribution[rating] = totalReviews > 0 ? 
      Math.round((ratingCounts[rating] / totalReviews) * 100) : 0;
  }

  const [selectedCategory, setSelectedCategory] = useState('all');
  const filteredFeedback = selectedCategory === 'all' ? 
    feedback : feedback.filter(f => f.type === selectedCategory);

  const getCategoryBadgeColor = (type) => {
    switch(type) {
      case 'consultation': return 'category-consultation';
      case 'product': return 'category-product';
      case 'pest': return 'category-pest';
      default: return '';
    }
  };

  const getCategoryLabel = (type) => {
    switch(type) {
      case 'consultation': return 'Consultation';
      case 'product': return 'Products';
      case 'pest': return 'Pest Control';
      default: return 'Other';
    }
  };

  return (
    <div className="feedback-container space-y-6">
      <FeedbackStats
        averageRating={averageRating}
        oneStarReviews={oneStarReviews}
        fiveStarReviews={fiveStarReviews}
        thisMonthIncrease={thisMonthIncrease}
      />
      <RatingDistribution ratingDistribution={ratingDistribution} />
      <CategoryFilters 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
      />
      <FeedbackList
        filteredFeedback={filteredFeedback}
        getCategoryBadgeColor={getCategoryBadgeColor}
        getCategoryLabel={getCategoryLabel}
      />
    </div>
  );
};
export default FeedbackPage;