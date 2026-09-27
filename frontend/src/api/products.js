import apiClient from './client';

// The engineer and dealer product APIs are identical in shape, they only
// differ by the `role` segment in their URLs (see backend/routes/api.php).
function createProductApi(role) {
    return {
        list: () => apiClient.get(`/get-${role}-products`).then((res) => res.data?.data ?? []),

        get: (id) => apiClient.get(`/get-${role}-product/${id}`).then((res) => res.data?.data),

        create: (payload) =>
            apiClient.post(`/save-${role}-product`, payload).then((res) => res.data),

        update: (id, payload) =>
            apiClient.put(`/update-${role}-product/${id}`, payload).then((res) => res.data),

        remove: (id) =>
            apiClient.delete(`/delete-${role}-product/${id}`).then((res) => res.data),
    };
}

export const engineerProductApi = createProductApi('engineer');
export const dealerProductApi = createProductApi('dealer');
