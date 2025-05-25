import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://192.168.1.61:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

export default instance;
