import React, { useEffect, useState } from 'react';
import { Bell, Package, Loader2, RefreshCw } from 'lucide-react';

import { getSmartAlerts, generateInventoryAlerts, markAlertRead } from '../../../api/alerts';
import './engineerAlerts.css';

const ICON_BY_TYPE = {
    inventory: Package,
};

const AlertIcon = ({ type }) => {
    const Icon = ICON_BY_TYPE[type] ?? Bell;
    return <Icon size={20} className={`ea-icon ea-icon-${type ?? 'system'}`} />;
};

const EngineerAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');

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
            const created = await generateInventoryAlerts();
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
        <div className="ea-page">
            <h2 className="ea-title">Smart Alerts</h2>
            <p className="ea-subtitle">
                AI-assisted inventory alerts for your storefront — a heads-up when items are
                running low or out of stock.
            </p>

            <button type="button" className="ea-generate-btn" onClick={handleGenerate} disabled={generating}>
                {generating ? (
                    <><Loader2 size={16} className="ea-spin" /> Checking inventory…</>
                ) : (
                    <><RefreshCw size={16} /> Generate Alerts</>
                )}
            </button>

            {generateError && <p className="auth__error-message">{generateError}</p>}

            {loading ? (
                <p className="ea-state">Loading your alerts…</p>
            ) : listError ? (
                <p className="ea-state">{listError}</p>
            ) : alerts.length === 0 ? (
                <p className="ea-state">No alerts yet — generate your first smart alert above.</p>
            ) : (
                <div className="ea-list">
                    {alerts.map((alert) => (
                        <div
                            key={alert.alert_id}
                            className={`ea-item ea-severity-${alert.severity}${alert.is_read ? '' : ' ea-unread'}`}
                            onClick={() => handleMarkRead(alert)}
                        >
                            <AlertIcon type={alert.type} />
                            <div className="ea-item-body">
                                <div className="ea-item-header">
                                    <h4 className="ea-item-title">{alert.title}</h4>
                                    {!alert.is_read && <span className="ea-unread-dot" aria-label="Unread" />}
                                </div>
                                <p className="ea-item-message">{alert.message}</p>
                                <p className="ea-item-meta">{new Date(alert.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EngineerAlerts;
