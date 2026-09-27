import apiClient from './client';

export function getOrders() {
    return apiClient.get('/get-orders').then((res) => res.data?.data ?? []);
}

export function getOrderDetails(id) {
    return apiClient.get(`/get-order-details/${id}`).then((res) => res.data?.data);
}

export function savePurchasedOrder(payload) {
    return apiClient.post('/save-purchased-order', payload).then((res) => res.data);
}

export function saveRentalOrder(payload) {
    return apiClient.post('/save-rental-order', payload).then((res) => res.data);
}
