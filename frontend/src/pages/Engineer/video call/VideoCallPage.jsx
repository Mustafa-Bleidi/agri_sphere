import React from 'react';
import { Clock, Camera, Users, Video, X, Mic, PhoneOff } from 'lucide-react';
import './videocall.css';
const VideoCallStats = ({ upcomingCalls, completedCalls }) => (
  <div className="call-stats-section">
    <div className="stat-card">
      <div className="stat-content">
        <div className="stat-text-inside">
          <h3>Upcoming Calls</h3>
          <p>{upcomingCalls.length}</p>
        </div>
        <Clock className="icon--schedule" size={24} />
      </div>
    </div>
    <div className="stat-card">
      <div className="stat-content">
        <div className="stat-text-inside">
          <h3>Completed Today</h3>
          <p>{completedCalls.filter(call => call.date.includes('Yesterday')).length}</p>
        </div>
        <Camera className="icon--completed" size={24} />
      </div>
    </div>
    <div className="stat-card">
      <div className="stat-content">
        <div className="stat-text-inside">
          <h3>Total This Week</h3>
          <p>15</p>
        </div>
        <Users className="icon--total" size={24} />
      </div>
    </div>
  </div>
);

const UpcomingCalls = ({ upcomingCalls, setShowDownloadModal, handleReschedule }) => (
  <div className="upcoming-calls-section">
    <h3 className="section-title">Upcoming Video Calls</h3>
    <div>
      {upcomingCalls.map(call => (
        <div key={call.id} className="upcoming-call-card">
          <div className="call-header">
            <div className="call-farmer-info">
              <Users className="icon--user" size={20} />
              <div>
                <p className="call-farmer-name">Farmer {call.farmer}</p>
                <p className="call-topic">{call.topic}</p>
              </div>
            </div>
            <div className="call-actions">
              <button className="join-call-button" onClick={() => setShowDownloadModal(true)}>
                <Video size={16} /> Join Call
              </button>
              <button className="reschedule-button" onClick={() => handleReschedule(call.id)}>
                Reschedule
              </button>
            </div>
          </div>
          <div className="call-time">
            <Clock className="icon--user" size={16} />
            <span>{call.date} • Duration: {call.duration}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CompletedCalls = ({ completedCalls }) => (
  <div className="completed-calls-section">
    <h3 className="section-title">Recent Completed Calls</h3>
    <div>
      {completedCalls.map(call => (
        <div key={call.id} className="completed-call-item">
          <Users className="icon--user-completed" size={20} />
          <div className="completed-call-info">
            <p className="completed-call-farmer">Farmer {call.farmer}</p>
            <p className="completed-call-topic">{call.topic}</p>
            <div className="call-time">
              <Clock className="icon--user" size={16} />
              <span>{call.date} • Duration: {call.duration}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const VideoCallPage = ({
  upcomingCalls, setUpcomingCalls, completedCalls,
  setShowDownloadModal, showDownloadModal,
  setShowRescheduleModal, selectedCallId, setSelectedCallId,
  newDate, setNewDate, newTime, setNewTime, showRescheduleModal
}) => {
  const handleReschedule = (callId) => {
    setSelectedCallId(callId);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewDate(tomorrow.toISOString().split('T')[0]);
    setNewTime('10:00');
    setShowRescheduleModal(true);
  };

  const saveReschedule = () => {
    if (!newDate || !newTime) {
      alert('Please select both date and time');
      return;
    }

    const [year, month, day] = newDate.split('-');
    const [hours, minutes] = newTime.split(':');
    const date = new Date(year, month - 1, day, hours, minutes);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[date.getMonth()];
    const dayOfMonth = date.getDate();
    const formattedHours = date.getHours() % 12 || 12;
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const formattedTime = `${formattedHours}:${date.getMinutes().toString().padStart(2, '0')} ${ampm}`;

    let formattedDate;
    const today = new Date();
    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) formattedDate = `Today at ${formattedTime}`;
    else if (date.toDateString() === tomorrowDate.toDateString()) formattedDate = `Tomorrow at ${formattedTime}`;
    else formattedDate = `${monthName} ${dayOfMonth} at ${formattedTime}`;

    setUpcomingCalls(upcomingCalls.map(call => call.id === selectedCallId ? { ...call, date: formattedDate } : call));
    setShowRescheduleModal(false);
    setSelectedCallId(null);
    setNewDate('');
    setNewTime('');
  };

  return (
    <div className="video-call-page">
      <div className="hero-banner">
        <div className="hero-content">
          <div>
            <h2 className="hero-title">Ready to Start a Video Call?</h2>
            <p className="hero-subtitle">Connect with farmers instantly for consultations</p>
          </div>
          <button className="start-call-button" onClick={() => setShowDownloadModal(true)}>
            <Video size={16} /> Start Instant Call
          </button>
        </div>
      </div>

      <VideoCallStats upcomingCalls={upcomingCalls} completedCalls={completedCalls} />
      <UpcomingCalls upcomingCalls={upcomingCalls} setShowDownloadModal={setShowDownloadModal} handleReschedule={handleReschedule} />
      <CompletedCalls completedCalls={completedCalls} />

      {/* Call placeholder — this project has no live video/WebRTC backend yet */}
      {showDownloadModal && (
        <div className="modal-overlay">
          <div className="call-connect-modal">
            <button className="close-modal-button" onClick={() => setShowDownloadModal(false)}>
              <X size={24} />
            </button>
            <div className="call-connect-icon">
              <Video size={32} />
            </div>
            <h2 className="call-connect-title">Connecting your call…</h2>
            <p className="call-connect-description">
              Live video calling isn't wired up in this build yet. Once it is, this is
              where the call would start.
            </p>
            <div className="call-connect-controls">
              <button className="call-connect-control" disabled>
                <Mic size={18} />
              </button>
              <button className="call-connect-control call-connect-control--end" onClick={() => setShowDownloadModal(false)}>
                <PhoneOff size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-overlay">
          <div className="reschedule-modal">
            <h3 className="reschedule-title">Reschedule Video Call</h3>
            <div>
              <div className="form-group">
                <label className="form-label">Select New Date</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={(e) => setNewDate(e.target.value)} 
                  className="form-input" 
                  min={new Date().toISOString().split('T')[0]} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Select New Time</label>
                <input 
                  type="time" 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)} 
                  className="form-input" 
                />
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={saveReschedule} className="full-width-button save-button">Save Changes</button>
              <button 
                onClick={() => { 
                  setShowRescheduleModal(false); 
                  setSelectedCallId(null); 
                  setNewDate(''); 
                  setNewTime(''); 
                }} 
                className="full-width-button cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default VideoCallPage;