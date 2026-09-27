import React, { useEffect, useState } from 'react';
import { Bell, CloudRain, Droplets, Bug, Loader2, RefreshCw } from 'lucide-react';

import { getSmartAlerts, generateSmartAlerts, markAlertRead } from '../../../api/alerts';
import './farmerAlerts.css';

const ICON_BY_TYPE = {
    irrigation: Droplets,
    weather: CloudRain,
    pest: Bug,
};

const AlertIcon = ({ type }) => {
    const Icon = ICON_BY_TYPE[type] ?? Bell;
    return <Icon size={20} className={`fa-icon fa-icon-${type ?? 'system'}`} />;
};

const FarmerAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');

    const [city, setCity] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState('');

    const loadAlerts = () => {
        setLoading(true);
        setListError('');

        getSmartAlerts()
            .then((data) => setAlerts(data.alerts ?? []))
            .catch(() => setListError('Could not load your alerts.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        setGenerateError('');

        try {
            const created = await generateSmartAlerts(city.trim() || undefined);
            setAlerts((prev) => [...created, ...prev]);
        } catch (err) {
            setGenerateError(
                err.response?.data?.message || 'Could not generate alerts right now. Please try again later.'
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleMarkRead = (alert) => {
        if (alert.is_read) return;

        setAlerts((prev) =>
            prev.map((item) => (item.alert_id === alert.alert_id ? { ...item, is_read: true } : item))
        );

        markAlertRead(alert.alert_id).catch(() => {
            setAlerts((prev) =>
                prev.map((item) => (item.alert_id === alert.alert_id ? { ...item, is_read: false } : item))
            );
        });
    };

    return (
        <div className="fa-page">
            <h2 className="fa-title">Smart Alerts</h2>
            <p className="fa-subtitle">
                AI-assisted weather and irrigation alerts for your farm — like the best time to
                irrigate, or a heads-up before heavy rain.
            </p>

            <div className="fa-generate-bar">
                <input
                    type="text"
                    className="fa-city-input"
                    placeholder="City (e.g. Damascus)"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                />
                <button type="button" className="fa-generate-btn" onClick={handleGenerate} disabled={generating}>
                    {generating ? (
                        <><Loader2 size={16} className="fa-spin" /> Checking forecast…</>
                    ) : (
                        <><RefreshCw size={16} /> Generate Alerts</>
                    )}
                </button>
            </div>

            {generateError && <p className="auth__error-message">{generateError}</p>}

            {loading ? (
                <p className="fa-state">Loading your alerts…</p>
            ) : listError ? (
                <p className="fa-state">{listError}</p>
            ) : alerts.length === 0 ? (
                <p className="fa-state">No alerts yet — generate your first smart alert above.</p>
            ) : (
                <div className="fa-list">
                    {alerts.map((alert) => (
                        <div
                            key={alert.alert_id}
                            className={`fa-item fa-severity-${alert.severity}${alert.is_read ? '' : ' fa-unread'}`}
                            onClick={() => handleMarkRead(alert)}
                        >
                            <AlertIcon type={alert.type} />
                            <div className="fa-item-body">
                                <div className="fa-item-header">
                                    <h4 className="fa-item-title">{alert.title}</h4>
                                    {!alert.is_read && <span className="fa-unread-dot" aria-label="Unread" />}
                                </div>
                                <p className="fa-item-message">{alert.message}</p>
                                <p className="fa-item-meta">
                                    {alert.city ? `${alert.city} · ` : ''}
                                    {new Date(alert.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FarmerAlerts;
