import React from 'react';
import { Star, TrendingUp, User } from "lucide-react";
import './feedback.css';
const StarRating = ({ rating }) => (
  <div className="Feedback_Dealer__star-rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`Feedback_Dealer__star ${
          star <= rating ? 'Feedback_Dealer__star--filled' : 'Feedback_Dealer__star--empty'
        }`}
      >
        ★
      </span>
    ))}
  </div>
);
const FeedbackPage = ({ 
  feedbackStats = {}, 
  ratingDistribution = [], 
  equipmentFeedback = [] 
}) => {
  const stats = {
    averageRating: feedbackStats.averageRating || 0,
    oneStarReviews: feedbackStats.oneStarReviews || 0,
    fiveStarReviews: feedbackStats.fiveStarReviews || 0,
    thisMonthChange: feedbackStats.thisMonthChange || '+0'
  };

  return (
    <div className="Feedback_Dealer">
      <main className="Feedback_Dealer__main-content">
        {/* Stats Cards */}
        <div className="Feedback_Dealer__stats-grid">
          <div className="Feedback_Dealer__stats-card">
            <div className="Feedback_Dealer__card-header">
              <div className="Feedback_Dealer__card-content">
                <h3 className="Feedback_Dealer__card-title">Average Rating</h3>
                <p className="Feedback_Dealer__card-value">{stats.averageRating}</p>
                <StarRating rating={Math.round(stats.averageRating)} />
              </div>
              <div className="Feedback_Dealer__icon-wrapper">
                <Star className="Feedback_Dealer__icon-star" />
              </div>
            </div>
          </div>

          <div className="Feedback_Dealer__stats-card">
            <div className="Feedback_Dealer__card-header">
              <div className="Feedback_Dealer__card-content">
                <h3 className="Feedback_Dealer__card-title">1 Star Reviews</h3>
                <p className="Feedback_Dealer__card-value">{stats.oneStarReviews}</p>
              </div>
              <div className="Feedback_Dealer__icon-wrapper">
                <svg
                  className="Feedback_Dealer__icon-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="Feedback_Dealer__stats-card">
            <div className="Feedback_Dealer__card-header">
              <div className="Feedback_Dealer__card-content">
                <h3 className="Feedback_Dealer__card-title">5 Star Reviews</h3>
                <p className="Feedback_Dealer__card-value">{stats.fiveStarReviews}</p>
              </div>
              <div className="Feedback_Dealer__icon-wrapper">
                <svg
                  className="Feedback_Dealer__icon-check"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="Feedback_Dealer__stats-card">
            <div className="Feedback_Dealer__card-header">
              <div className="Feedback_Dealer__card-content">
                <h3 className="Feedback_Dealer__card-title">This Month</h3>
                <p className="Feedback_Dealer__card-value">{stats.thisMonthChange}</p>
              </div>
              <div className="Feedback_Dealer__icon-wrapper">
                <TrendingUp className="Feedback_Dealer__icon-trend" />
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="Feedback_Dealer__rating-section">
          <h2 className="Feedback_Dealer__section-title">Rating Distribution</h2>
          <div className="Feedback_Dealer__rating-bars">
            {ratingDistribution.length > 0 ? (
              ratingDistribution.map((item, index) => (
                <div key={index} className="Feedback_Dealer__rating-row">
                  <div className="Feedback_Dealer__rating-label">
                    <span className="Feedback_Dealer__star-icon">★</span>
                    <span className="Feedback_Dealer__rating-number">{item.stars}</span>
                  </div>
                  <div className="Feedback_Dealer__bar-container">
                    <div
                      className="Feedback_Dealer__bar-fill"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="Feedback_Dealer__percentage">{item.percentage}%</span>
                </div>
              ))
            ) : (
              <div className="Feedback_Dealer__no-data">
                <p>No rating data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Equipment Feedback */}
        <div className="Feedback_Dealer__feedback-list-section">
          <h2 className="Feedback_Dealer__section-title">
            Your Equipment Feedback ({equipmentFeedback.length})
          </h2>
          <div className="Feedback_Dealer__feedback-items">
            {equipmentFeedback.length > 0 ? (
              equipmentFeedback.map((feedback, index) => (
                <div
                  key={index}
                  className={`Feedback_Dealer__feedback-item ${
                    index < equipmentFeedback.length - 1
                      ? 'Feedback_Dealer__feedback-item--bordered'
                      : ''
                  }`}
                >
                  <div className="Feedback_Dealer__feedback-user">
                    <div className="Feedback_Dealer__user-avatar">
                      <User className="Feedback_Dealer__user-icon" />
                    </div>
                    <div className="Feedback_Dealer__user-info">
                      <p className="Feedback_Dealer__farmer-name">{feedback.farmer}</p>
                      <p className="Feedback_Dealer__equipment-name">{feedback.equipment}</p>
                      <p className="Feedback_Dealer__feedback-time">{feedback.time}</p>
                    </div>
                  </div>
                  <div className="Feedback_Dealer__feedback-rating">
                    <StarRating rating={feedback.rating} />
                  </div>
                </div>
              ))
            ) : (
              <div className="Feedback_Dealer__no-data">
                <p>No feedback available yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;