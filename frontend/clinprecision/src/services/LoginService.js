// src/services/LoginService.js
import axios from "axios";
import { API_BASE_URL } from "../config.js";

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json'
  }
});

export const LoginService = {
  /**
   * Authenticates a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise with login response data
   */
  login: async (email, password) => {
    try {
      const loginResponse = await axiosInstance.post(
        `/users-ws/users/login`,
        { email, password }
      );
      
      if (loginResponse.status !== 200) {
        throw new Error("Invalid credentials");
      }
      
      // Extract authentication data from headers
      const token = loginResponse.headers.token;
      const userId = loginResponse.headers.userid;

      console.log("Response headers:", loginResponse.headers);
      
      if (!token || !userId) {
        throw new Error("Authentication successful but token or userId is missing");
      }
      
      // Save authentication data to local storage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
      
      // Optionally, store expiration time if needed
      const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const expirationTime = new Date().getTime() + expiresIn;
      localStorage.setItem('tokenExpiration', expirationTime.toString());
      
      // Get complete user information with the token
      const userResponse = await axiosInstance.get(
        `/users-ws/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Store user data in local storage (optional)
      localStorage.setItem('userData', JSON.stringify(userResponse.data));
      
      // Combine authentication and user data
      return {
        success: true,
        userData: userResponse.data,
        authData: {
          token,
          userId
        }
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  /**
   * Logs out the current user
   * @returns {Promise} - Promise indicating logout success
   */
  logout: async () => {
    try {
      // Clear all authentication data from local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('tokenExpiration');
      localStorage.removeItem('userData');
      
      // Optional: API call for server-side logout
      // await axiosInstance.post(`/users-ws/users/logout`);
      
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
  
  // Check if the user is authenticated (token exists and is not expired)
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !expiration) {
      return false;
    }
    
    // Check if token is expired
    return new Date().getTime() < parseInt(expiration);
  },
  
  // Get the current authentication token
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  // Get the current user ID
  getUserId: () => {
    return localStorage.getItem('userId');
  },
  
  // Get the stored user data
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};

export default LoginService;