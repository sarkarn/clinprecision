const API_GATEWAY_HOST = process.env.REACT_APP_API_GATEWAY_HOST || "localhost";
const API_GATEWAY_PORT = process.env.REACT_APP_API_GATEWAY_PORT || "8083";

export const API_BASE_URL = `http://${API_GATEWAY_HOST}:${API_GATEWAY_PORT}`;