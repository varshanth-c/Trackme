import React, { useState, useEffect } from 'react';
// 1. Import useNavigate
import { useParams, Link, useNavigate } from 'react-router-dom';

const VerificationPage = () => {
  const { token } = useParams();
  // 2. Initialize useNavigate
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('Verifying your email, please wait...');

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setMessage('No verification token found. The link is invalid.');
        setIsError(true);
        setIsLoading(false);
        return;
      }

      try {
        const apiUrl = `https://trackme-yeae.onrender.com/api/auth/verify-email/${token}`;
        
        const response = await fetch(apiUrl);
        
        // FIX: Read the body once as text
        const responseText = await response.text();
        
        // Then, parse the text into a JSON object
        const data = JSON.parse(responseText);

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed.');
        }

        // On success, set the message
        setMessage(data.message);
        setIsError(false);

        // 3. Redirect to the dashboard after a 2-second delay
        setTimeout(() => {
          window.location.href = '/'; // Or navigate to '/login' if you prefer
        }, 2000);

      } catch (error) {
        setMessage(error.message || 'An error occurred. The link may be expired.');
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailToken();
  }, [token, navigate]); // Add navigate to the dependency array

  // Render the UI
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
            
            {/* Show login button only on success, as user will be redirected */}
            {!isError && (
              <p>Redirecting you to the dashboard...</p>
            )}
            
            {/* Show resend button only on error */}
            {isError && (
              <Link to="/resend-verification" style={styles.button}>
                Resend Verification Link
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ... your styles object ...
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