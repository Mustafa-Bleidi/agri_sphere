import apiClient from './client';

export function getSmartAlerts() {
    return apiClient
        .get('/get-smart-alerts')
        .then((res) => res.data?.data ?? { alerts: [], unread_count: 0 });
}

export function generateSmartAlerts(city) {
    return apiClient
        .post('/generate-smart-alerts', city ? { city } : {})
        .then((res) => res.data?.data ?? []);
}

export function markAlertRead(id) {
    return apiClient.post(`/mark-alert-read/${id}`).then((res) => res.data?.data);
}

export function markAllAlertsRead() {
    return apiClient.post('/mark-all-alerts-read').then((res) => res.data);
}
