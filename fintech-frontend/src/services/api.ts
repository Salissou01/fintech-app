import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.67:8000/api', // Ton backend Laravel
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export default API;
