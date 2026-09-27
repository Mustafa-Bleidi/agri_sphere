import React, { useState } from 'react';
import Footer from '../../../components/common/Footer/Footer';
import {Clock,Check,MessageSquare,Video,AlertTriangle,User,X,} from 'lucide-react';
import './consultation.css';
const ConsultationStats = ({ pendingRequests, scheduled, totalToday }) => (
  <div className="stats-consultation">
    <div className="stat-item-consultation">
      <div className="stat-content-consultation">
        <h3 className="stat-label-consultation">Pending Requests</h3>
        <p className="stat-value-consultation">{pendingRequests}</p>
      </div>
      <Clock className="icon-orange" size={24} />
    </div>
    <div className="stat-item-consultation">
      <div className="stat-content-consultation">
        <h3 className="stat-label-consultation">Scheduled</h3>
        <p className="stat-value-consultation">{scheduled}</p>
      </div>
      <Check className="icon-green" size={24} />
    </div>
    <div className="stat-item-consultation">
      <div className="stat-content-consultation">
        <h3 className="stat-label-consultation">Total Today</h3>
        <p className="stat-value-consultation">{totalToday}</p>
      </div>
      <MessageSquare className="icon-blue" size={24} />
    </div>
  </div>
);
const TypeFilters = ({ selectedType, setSelectedType }) => (
  <div className="filters-consultation">
    {['all', 'text', 'video', 'pest'].map((type) => (
      <button
        key={type}
        onClick={() => setSelectedType(type)}
        className={`filter-btn-consultation ${
          selectedType === type ? `active-${type}-consultation` : ''
        }`}
      >
        {type === 'all' && 'All Types'}
        {type === 'text' && (
          <>
            <MessageSquare className="inline-icon-consultation" size={16} /> Text
          </>
        )}
        {type === 'video' && (
          <>
            <Video className="inline-icon-consultation" size={16} /> Video
          </>
        )}
        {type === 'pest' && (
          <>
            <AlertTriangle className="inline-icon-consultation" size={16} /> Pest Report
          </>
        )}
      </button>
    ))}
  </div>
);

const ConsultationList = ({ consultations, handleAccept, handleReject, handleOpenChat }) => (
  <div className="list-consultation">
    {consultations.map((consultation) => (
      <div key={consultation.id} className="item-consultation">
        <div className="header-consultation">
          <div className="farmer-info-consultation">
            <User className="user-icon-consultation" size={20} />
            <div>
              <p className="farmer-name-consultation">Farmer {consultation.farmer}</p>
              <span
                className={`type-badge-consultation ${
                  consultation.type === 'video'
                    ? 'video-type-consultation'
                    : consultation.type === 'text'
                    ? 'text-type-consultation'
                    : 'pest-type-consultation'
                }`}
              >
                {consultation.category}
              </span>
            </div>
          </div>
          <h4 className="topic-consultation">{consultation.topic}</h4>
          <p className="content-consultation">{consultation.content}</p>
          <div className="time-consultation">
            <Clock className="clock-icon-consultation" size={16} />
            <span>{consultation.date}</span>
          </div>
        </div>

        <div className="actions-consultation">
          {consultation.status === 'pending' && (
            <>
              <button
                onClick={() => handleAccept(consultation.id)}
                className="accept-btn-consultation"
              >
                <Check size={18} /> Accept & Schedule
              </button>
              <button
                onClick={() => handleReject(consultation)}
                className="decline-btn-consultation"
              >
                <X size={18} /> Decline
              </button>
            </>
          )}
          {consultation.status === 'scheduled' && (
            <button
              onClick={() => handleOpenChat(consultation.farmer)}
              className="chat-btn-consultation"
            >
              <MessageSquare size={18} /> Open Chat
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);

const ConsultationsPage = ({
  consultations,
  setConsultations,
  handleOpenChat,
  setUpcomingCalls,
  setAlerts, 
}) => {
  const [selectedType, setSelectedType] = useState('all');
  const filteredConsultations =
    selectedType === 'all'
      ? consultations
      : consultations.filter((c) => c.type === selectedType);

  const pendingRequests = consultations.filter(
    (c) => c.status === 'pending'
  ).length;
  const scheduled = consultations.filter(
    (c) => c.status === 'scheduled'
  ).length;
  const totalToday = consultations.filter((c) =>
    c.date.startsWith('2025-11-28')
  ).length;

  const handleAccept = (id) => {
    const consultationToAccept = consultations.find((c) => c.id === id);
    if (!consultationToAccept) return;

    if (consultationToAccept.type === 'video') {
      const newVideoCall = {
        id: Date.now(),
        farmer: consultationToAccept.farmer,
        topic: consultationToAccept.topic,
        date: 'Today at 2:00 PM',
        duration: '30 min',
      };
      setUpcomingCalls((prev) => [...prev, newVideoCall]);
      setConsultations(consultations.filter((c) => c.id !== id));
    } else {
      setConsultations(
        consultations.map((c) =>
          c.id === id ? { ...c, status: 'scheduled' } : c
        )
      );

      if (consultationToAccept.type === 'pest') {
        setAlerts(prevAlerts =>
          prevAlerts.filter(alert =>
            !(alert.type === 'pest' && alert.message.includes(consultationToAccept.farmer))
          )
        );
      }
    }
  };

  const handleReject = (consultation) => {
    setConsultations(consultations.filter((c) => c.id !== consultation.id));
    
    if (consultation.type === 'pest') {
      setAlerts(prevAlerts =>
        prevAlerts.filter(alert =>
          !(alert.type === 'pest' && alert.message.includes(consultation.farmer))
        )
      );
    }
  };

  return (
    <div className="page-consultation">
      <ConsultationStats
        pendingRequests={pendingRequests}
        scheduled={scheduled}
        totalToday={totalToday}
      />
      <TypeFilters
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
      <ConsultationList
        consultations={filteredConsultations}
        handleAccept={handleAccept}
        handleReject={handleReject}
        handleOpenChat={handleOpenChat}
      />
      <Footer/>
    </div>
  );
};

export default ConsultationsPage;