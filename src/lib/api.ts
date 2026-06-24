import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "https://spark-the-finance-app.fly.dev";

export const api = axios.create({
    baseURL: apiBaseUrl,
});

// Request interceptor: ensure Authorization header is attached from localStorage when available
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers = config.headers || {};
                if (!(config.headers as Record<string, any>).Authorization) {
                    (config.headers as Record<string, any>).Authorization = `Bearer ${token}`;
                }
            }
        } catch {
            // localStorage may be unavailable in some environments
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 centrally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        try {
            if (error?.response?.status === 401) {
                localStorage.removeItem("token");
                delete api.defaults.headers.common.Authorization;
                try {
                    window.dispatchEvent(
                        new CustomEvent("auth:unauthorized", {
                            detail: { message: "Authentication required. Please login again." },
                        })
                    );
                } catch {
                    // ignore in non-browser environments
                }
            }
        } catch {
            // swallow
        }
        return Promise.reject(error);
    }
);

export const setApiAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
    }

    delete api.defaults.headers.common.Authorization;
};
