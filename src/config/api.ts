const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // For local development, use port 5000
        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.')
        ) {
            return `http://${hostname}:5000`;
        }
        // For production (Vercel), use relative paths
        return "";
    }

    return "http://localhost:5000";
};

export const API_URL = getApiUrl();
