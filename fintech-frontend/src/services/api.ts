import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.61:8000/api', 
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export default API;
