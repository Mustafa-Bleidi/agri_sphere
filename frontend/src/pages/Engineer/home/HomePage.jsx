import React from 'react';
import { MessageSquare, Video, AlertTriangle, ShoppingCart, Star, Package } from 'lucide-react';
import './home.css';
import Footer from '../../../components/common/Footer/Footer';
const HomePageStats = ({
  pendingConsultations,
  videoCallsScheduled,
  activeAlerts,
  pestReports,
  purchaseRequests,
  averageRating,
  productsSold,
  feedback,
}) => (
  <>
    <div className="stats-section">
      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-text">
            <h3 className="stat-label">Pending Consultations</h3>
            <p className="stat-value">{pendingConsultations}</p>
            <p className="stat-note positive">+3 today</p>
          </div>
          <MessageSquare className="icon--primary" size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-text">
            <h3 className="stat-label">Video Calls Scheduled</h3>
            <p className="stat-value">{videoCallsScheduled}</p>
            <p className="stat-note upcoming">2 upcoming</p>
          </div>
          <Video className="icon--call" size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-text">
            <h3 className="stat-label">Active Alerts</h3>
            <p className="stat-value">{activeAlerts}</p>
            <p className="stat-note critical">{pestReports} pest reports</p>
          </div>
          <AlertTriangle className="icon--warning" size={24} />
        </div>
      </div>
    </div>

    <div className="stats-section">
      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-text">
            <h3 className="stat-label">Purchase Requests</h3>
            <p className="stat-value">{purchaseRequests}</p>
          </div>
          <ShoppingCart className="icon--order" size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-text">
            <h3 className="stat-label">Average Rating</h3>
            <p className="stat-value">{averageRating}</p>
            <p className="stat-note muted">From {feedback.length} reviews</p>
          </div>
          <Star className="icon--rating" size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-text">
            <h3 className="stat-label">Products Sold</h3>
            <p className="stat-value">{productsSold}</p>
            <p className="stat-note muted">This month</p>
          </div>
          <Package className="icon--neutral" size={24} />
        </div>
      </div>
    </div>
  </>
);

const RecentActivity = ({ recentActivity }) => (
  <div className="activity-card">
    <div className="activity-header">
      <h3 className="activity-title">Recent Activity</h3>
      <button className="view-all-button">View All</button>
    </div>
    <div>
      {recentActivity.map(activity => (
        <div key={activity.id} className="activity-item">
          <div className="activity-icon">
            {activity.type === 'consultation' && <MessageSquare className="icon--primary" size={20} />}
            {activity.type === 'alert' && <AlertTriangle className="icon--warning" size={20} />}
            {activity.type === 'purchase' && <ShoppingCart className="icon--order" size={20} />}
            {activity.type === 'rating' && <Star className="icon--rating" size={20} />}
          </div>
          <div className="activity-details">
            <p className="farmer-name">Farmer {activity.farmer}</p>
            <p className="action-description">{activity.action}</p>
            <p className="timestamp">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActions = ({ setCurrentPage, consultationsThisMonth, productsSold, totalRevenue }) => (
  <div className="actions-panel">
    <h3 className="panel-title">Quick Actions</h3>
    <div>
      <button onClick={() => setCurrentPage('videocall')} className="action-button">
        <Video className="icon--call" size={20} /><span>Start Video Call</span>
      </button>
      <button onClick={() => setCurrentPage('consultations')} className="action-button">
        <AlertTriangle className="icon--warning" size={20} /><span>View Alerts</span>
      </button>
      <button onClick={() => setCurrentPage('marketplace')} className="action-button">
        <ShoppingCart className="icon--order" size={20} /><span>Manage Store</span>
      </button>
      <button onClick={() => setCurrentPage('feedback')} className="action-button">
        <Star className="icon--rating" size={20} /><span>Check Feedback</span>
      </button>
    </div>
    <div className="monthly-summary">
      <h4>This Month</h4>
      <div className="summary-row">
        <span className="summary-label">Consultations</span>
        <span className="summary-value">{consultationsThisMonth}</span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Products Sold</span>
        <span className="summary-value">{productsSold}</span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Revenue</span>
        <span className="summary-value">{totalRevenue.toLocaleString()}{" "}SYP</span>
      </div>
    </div>
  </div>
);

const HomePage = ({ consultations, upcomingCalls, orders, feedback, setCurrentPage }) => {
  const pendingConsultations = consultations.filter(consultation => consultation.status === 'pending').length;
  const videoCallsScheduled = upcomingCalls.length;
  
  const activeAlerts = consultations.filter(consultation => consultation.type === 'pest' && consultation.status === 'pending').length;
  
  const pestReports = activeAlerts; 
  const purchaseRequests = orders.filter(order => order.status === 'pending').length;
  const averageRating = feedback.length > 0 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) 
    : '0.0';

  const productsSold = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, o) => sum + o.quantity, 0);

  const totalRevenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const consultationsThisMonth = consultations.length;

  const recentActivity = [
    { id: 1, farmer: 'Ahmed Hassan', action: 'Requested video consultation', time: '5 min ago', type: 'consultation' },
    { id: 2, farmer: 'Fatima', action: 'Reported tomato blight disease', time: '12 min ago', type: 'alert' },
    { id: 3, farmer: 'Khalid', action: 'Purchased organic fertilizer (25kg)', time: '25 min ago', type: 'purchase' },
    { id: 4, farmer: 'Sara', action: 'Gave you 5 stars for consultation', time: '1 hour ago', type: 'rating' },
    { id: 5, farmer: 'Omar', action: 'Requested pest control advice', time: '2 hours ago', type: 'consultation' }
  ];

  return (
    <div className="dashboard">
      <HomePageStats
        pendingConsultations={pendingConsultations}
        videoCallsScheduled={videoCallsScheduled}
        activeAlerts={activeAlerts}
        pestReports={pestReports}
        purchaseRequests={purchaseRequests}
        averageRating={averageRating}
        productsSold={productsSold}
        feedback={feedback}
      />
      <div className="main-content">
        <RecentActivity recentActivity={recentActivity} />
        <QuickActions
          setCurrentPage={setCurrentPage}
          consultationsThisMonth={consultationsThisMonth}
          productsSold={productsSold}
          totalRevenue={totalRevenue}
        />
      </div>
      <Footer/>
    </div>
  );
};

export default HomePage;