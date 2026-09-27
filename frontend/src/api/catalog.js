import apiClient from './client';

export function getCategories() {
    return apiClient.get('/get-categories').then((res) => res.data?.data ?? []);
}

export function getBrands() {
    return apiClient.get('/get-brands').then((res) => res.data?.data ?? []);
}
