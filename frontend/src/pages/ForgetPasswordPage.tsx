import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const apiUrl = 'https://trackme-yeae.onrender.com/api/auth/forgot-password';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // The backend always sends a success-like message to prevent email enumeration.
      // So, we just display the message from the server.
      setMessage(data.message);
      setIsError(false); // Always treat it as a non-error state for the UI

    } catch (error) {
      setMessage('An error occurred. Please try again later.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Forgot Your Password?</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleRequestReset}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: '20px', color: isError ? 'red' : 'green', fontWeight: 'bold' }}>
            {message}
          </p>
        )}

        <div style={{ marginTop: '20px' }}>
          <Link to="/login" style={styles.link}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

// Reusable styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
  },
  card: {
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    textAlign: 'center',
    width: '90%',
    maxWidth: '450px',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    boxSizing: 'border-box', // Ensures padding doesn't affect width
  },
  button: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  }
};

export default ForgotPasswordPage;