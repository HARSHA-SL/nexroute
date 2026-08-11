import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired/invalid JWT
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;