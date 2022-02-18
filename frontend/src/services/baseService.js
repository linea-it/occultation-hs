import axios from "axios";
import { accessToken }  from "../contexts/auth";

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

api.interceptors.request.use(async config => {
  const token = accessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default api;

