import apiClient from './client';

export function getProfile() {
    return apiClient.get('/get-profile-details').then((res) => res.data?.data);
}

export function updateProfile(payload) {
    return apiClient.post('/update-profile', payload).then((res) => res.data);
}
