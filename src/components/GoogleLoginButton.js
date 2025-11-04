import React, { useEffect } from 'react';

/**
 * Google Login Button Component
 * Handles Google OAuth flow using Google Identity Services
 */
function GoogleLoginButton({ onSuccess, onError, clientId }) {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      }
    };

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId]);

  const handleCredentialResponse = (response) => {
    if (response.credential) {
      // response.credential is the JWT ID token
      onSuccess(response.credential);
    } else {
      onError(new Error('No credential received from Google'));
    }
  };

  return (
    <div>
      <div id="googleSignInButton"></div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Click the button above to sign in with your Google account
      </p>
    </div>
  );
}

export default GoogleLoginButton;

