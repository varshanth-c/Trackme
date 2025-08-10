import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const VerificationPage = () => {
  // 1. Get the token from the URL using useParams hook
  const { token } = useParams();

  // 2. State variables to manage the UI
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('Verifying your email, please wait...');

  // 3. useEffect to run the verification logic when the component mounts
  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setMessage('No verification token found. The link is invalid.');
        setIsError(true);
        setIsLoading(false);
        return;
      }

      try {
        // IMPORTANT: Use an environment variable for your API URL
        const apiUrl = `https://trackme-yeae.onrender.com/api/auth/verify-email/${token}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
          // Throw an error if the server response is not successful (e.g., 4xx, 5xx)
          throw new Error(data.message || 'Verification failed.');
        }

        // On success
        setMessage(data.message);
        setIsError(false);

      } catch (error) {
        // On failure (network error or error thrown from above)
        setMessage(error.message || 'An error occurred. The link may be expired.');
        setIsError(true);
      } finally {
        // This runs regardless of success or failure
        setIsLoading(false);
      }
    };

    verifyEmailToken();
  }, [token]); // The effect re-runs if the token in the URL changes

  // 4. Render the UI based on the state
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Email Verification</h1>
        
        {isLoading && <p>Loading...</p>}
        
        {!isLoading && (
          <div>
            <p style={{ color: isError ? 'red' : 'green', fontWeight: 'bold' }}>
              {message}
            </p>
            
            {isError ? (
              <Link to="/resend-verification" style={styles.button}>
                Resend Verification Link
              </Link>
            ) : (
              <Link to="/login" style={styles.button}>
                Go to Login
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Basic styles for the component
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
  button: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '16px',
  }
};

export default VerificationPage;