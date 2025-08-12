import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      return;
    }
    if (!password) {
      setMessage('Password cannot be empty.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const apiUrl = `https://trackme-yeae.onrender.com/api/auth/reset-password/${token}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setMessage(data.message + ' Redirecting to login...');
      setIsError(false);

      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href='/';
      }, 3000);

    } catch (error) {
      setMessage(error.message || 'Invalid or expired link. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Set a New Password</h1>
        
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            style={styles.input}
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: '20px', color: isError ? 'red' : 'green', fontWeight: 'bold' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Reusable styles (same as before)
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
        boxSizing: 'border-box',
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
};

export default ResetPasswordPage;