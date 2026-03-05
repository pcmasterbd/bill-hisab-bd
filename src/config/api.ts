const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // If we're on localhost or an IP, use the same host for API
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:5000`;
    }

    return "http://localhost:5000";
};

export const API_URL = getApiUrl();

