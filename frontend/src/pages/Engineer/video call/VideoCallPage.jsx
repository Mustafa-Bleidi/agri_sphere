import React from 'react';
import { Clock, Camera, Users, Video, X, Check } from 'lucide-react';
import './videocall.css';
import Footer from '../../../components/common/Footer/Footer';
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

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="modal-overlay">
          <div className="download-modal">
            <button className="close-modal-button" onClick={() => setShowDownloadModal(false)}>
              <X size={24} />
            </button>
            <div 
              className="modal-image"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDL8RSN4EwFRixxC6b_YW29G79kD1TmKGCAPy9WNelPzxVFtQBZdTTrPITl31EfwHptWhJ85vKJs6JGVDbnp4xBr1vz7whVhd80E2WyEjPOo31bhJZKbnGsDYwCdLY2cT9831dUrz52R2b919QADIrAVqi7x6hyy6vb2mYdyBR85F_pgoqqJXfGQOneRZAmahUY-B8FDEqICp3JXzZcB900cnmBtOcAiHzvUSAgFyEDvVS8k8F3w_E5DSTrPPURxWexCMAwDZj2h7E')" }}
            ></div>
            <div className="modal-content">
              <div className="badge-container">
                <div className="badge-icon"><Video size={20} /></div>
                <span className="badge-text">Live Assistance</span>
              </div>
              <h2 className="modal-main-title">Engineer: Enhance Farmer Support with Our Mobile App</h2>
              <p className="modal-description">
              Download our mobile app to connect directly with farmers via 
              video calls. Provide real-time visual assistance and empower them with 
              instant solutions. Streamline your support and resolve issues faster with 
              immediate, on-site communication.</p>
              <div className="divider"></div>
              <div className="download-options">
                <div className="qr-section">
                  <img 
                    alt="QR Code" 
                    className="qr-image" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1-A7gyUm3c6XIY16VyLQRHDeroWh9FzZ424Rokd0t2TNa-fAiWr_hzWhVZtQXsFvrc8VpEbd1qU1z3iNFM6_JEiCARVkyFTRfhDIiKCrBOnB3aEMPRSAM3tqoOH36iDJJHi-6l7g3h01e7ElZjzMO8FDoDK54E1Xg3W1DVfHgf0OXaT6Xj92mOIkr7TjTaEd4bOIwkFbFMNALp01LgmT3fMmwRap_zTv_ypCG0SYSzV7b8Gh6i21nA2njoNPDmV_Ege920Pov95w" 
                  />
                  <span className="qr-label">Scan to Get App</span>
                </div>
                <div className="Donwload_Div">
                  <p className="method-label">Preferred method?</p>
                  <button className="download-app-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="bi bi-download"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></svg>
                    <span>Download Mobile App</span>
                  </button>
                  <div></div>
                  <button className="email-link-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="bi bi-envelope"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 1 13h14a1 1 0 0 0 0-1"/></svg>
                    <span>Email me the link instead</span>
                  </button>
                </div>
              </div>
              <div className="footer-info">
              </div>
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
      <Footer/>
    </div>
  );
};
export default VideoCallPage;