import apiClient from './client';

export function getPurchasedProducts() {
    return apiClient.get('/get-purhcased-products').then((res) => res.data?.data ?? []);
}

export function getRentalProducts() {
    return apiClient.get('/get-rental-products').then((res) => res.data?.data ?? []);
}

export function getProduct(id) {
    return apiClient.get(`/get-product/${id}`).then((res) => res.data?.data);
}
