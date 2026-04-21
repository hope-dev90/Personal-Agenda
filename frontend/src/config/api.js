const DEFAULT_API_BASE_URL = "https://personal-agenda-17.onrender.com";

const rawApiBaseUrl = process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL;

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const apiUrl = (path) => `${API_BASE_URL}${path}`;
