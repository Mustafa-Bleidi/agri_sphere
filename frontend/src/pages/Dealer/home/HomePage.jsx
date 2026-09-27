import React from 'react';
import { Wrench, AlertTriangle, Star, TrendingUp } from "lucide-react";
import './home.css';
const DashboardStatsCard = ({ title, value, subtitle, icon }) => (
  <div className="Home_Dealer_DashboardStatsCard">
    <div className="Home_Dealer_StatHeader">
      <div>
        <h3 className="Home_Dealer_StatTitle">{title}</h3>
        <p className="Home_Dealer_StatValue">{value}</p>
      </div>
      <div className="Home_Dealer_StatIcon">{icon}</div>
    </div>
    <p className="Home_Dealer_StatSubtitle">{subtitle}</p>
  </div>
);

const RecentActivityItem = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'star':
        return <Star className="Home_Dealer_Icon_Star" />;
      case 'wrench':
        return <Wrench className="Home_Dealer_Icon_Wrench" />;
      case 'alert':
        return <AlertTriangle className="Home_Dealer_Icon_Alert" />;
      case 'trend':
        return <TrendingUp className="Home_Dealer_Icon_Trend" />;
      default:
        return null;
    }
  };

  return (
    <div className="Home_Dealer_ActivityItem">
      <div className="Home_Dealer_ActivityIconWrapper">{getIcon()}</div>
      <div className="Home_Dealer_ActivityContent">
        <p className="Home_Dealer_ActivityText">{activity.text}</p>
        <p className="Home_Dealer_ActivityTime">
          <svg className="Home_Dealer_ClockIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {activity.time}
        </p>
      </div>
    </div>
  );
};

const StatsSection = ({ title, stats }) => (
  <div className="Home_Dealer_StatsSection">
    <h3 className="Home_Dealer_SectionTitle">{title}</h3>
    <div className="Home_Dealer_StatsList">
      {stats.map((stat, index) => (
        <div key={index} className="Home_Dealer_StatRow">
          <span className="Home_Dealer_StatLabel">{stat.label}</span>
          <span className={`Home_Dealer_StatValueInline ${stat.className || ''}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const HomePage = ({
  dashboardStats,
  recentActivity,
  thisWeekStats,
  equipmentUtilization
}) => {
  return (
    <div className="Home_Dealer_Container">
      <main className="Home_Dealer_MainContent">
        <div className="Home_Dealer_StatsGrid">
          {dashboardStats.map((stat, index) => (
            <DashboardStatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="Home_Dealer_RecentActivityCard">
          <h2 className="Home_Dealer_RecentActivityTitle">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="dashboard-page__state">No recent activity yet — list a product to get started.</p>
          ) : (
            <div className="Home_Dealer_ActivityList">
              {recentActivity.map((activity, index) => (
                <RecentActivityItem key={index} activity={activity} />
              ))}
            </div>
          )}
        </div>

        <div className="Home_Dealer_BottomGrid">
          <StatsSection
            title="This Week"
            stats={[
              { label: 'New Rentals', value: thisWeekStats.newRentals },
              { label: 'Completed', value: thisWeekStats.completed },
              { label: 'Revenue', value: thisWeekStats.revenue, className: 'Home_Dealer_RevenueHighlight' }
            ]}
          />
          <StatsSection
            title="Equipment Utilization"
            stats={equipmentUtilization.map(item => ({
              label: item.status,
              value: (
                <span className="Home_Dealer_StatusBadge">
                  {item.count}
                </span>
              )
            }))}
          />
        </div>
      </main>
    </div>
  );
};

export default HomePage;