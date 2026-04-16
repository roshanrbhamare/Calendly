import axios from 'axios';

// Mock auth identifier for the backend logic
export const MOCK_USER_ID = "demo-user-1";

// Get API URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'x-user-id': MOCK_USER_ID,
        'Content-Type': 'application/json'
    }
});

export default api;
