import { useState, useEffect, useCallback } from 'react';

// The base URL of your backend API
const API_BASE_URL = 'https://trackme-yeae.onrender.com/api';

/**
 * A custom hook to manage user authentication with your Express backend.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * On initial load, check localStorage for an existing session.
   * This keeps the user logged in across page reloads.
   */
  const checkUserSession = useCallback(() => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // If stored data is corrupted, clear it
      console.error("Failed to parse user session from localStorage", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  /**
   * Handles the sign-in logic by calling the backend.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   */
  const signIn = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed.');
    }

    // On successful login, store token and user data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  /**
   * Handles the sign-up logic by sending all user details to the backend.
   * @param {object} details - An object containing all user sign-up data.
   */
  const signUp = async (details) => {
    // The payload now includes all possible fields from your backend.
    // The frontend form will provide the 'details' object.
    const payload = {
      full_name: details.fullName,
      email: details.email,
      password: details.password,
      role: details.role || 'vendor', // Default role to 'vendor' if not provided
      specialty: details.specialty,
      phone_number: details.phoneNumber,
      avatar_url: details.avatarUrl,
      business_name: details.businessName,
      business_type: details.businessType,
      business_address: details.businessAddress,
      preferred_language: details.preferredLanguage,
    };

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sign-up failed.');
    }

    // After signup, we don't log the user in automatically.
    // They need to verify their email first.
    return data;
  };

  /**
   * Signs the user out by clearing state and localStorage.
   */
  const signOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    setToken(null);
  };

  return {
    user,
    token, // Exposing the token is useful for other API calls
    loading,
    signIn,
    signUp,
    signOut,
  };
}
