import apiClient from './client';

export function diagnosePlantImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient
        .post('/diagnose-plant-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => res.data?.data);
}
