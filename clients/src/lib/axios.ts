import axios from "axios";



const URL = process.env.VITE_API_URL
// Create Axios Instance
const api = axios.create({
  baseURL: URL  || "http://localhost:5000/api",
  withCredentials: true, // if using cookies
});

// Request Interceptor (Attach JWT Automatically)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or wherever you store JWT

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;