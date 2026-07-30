import client from './client';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await client.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // { url, publicId, mimeType }
};

export const submitReport = async (reportData) => {
  const { data } = await client.post('/reports', reportData);
  return data; // { report, message }
};
