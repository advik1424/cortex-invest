import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cortex_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [googleClientReady, setGoogleClientReady] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Initialize official Google Identity Services if client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    function initGoogleClient() {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setGoogleClientReady(true);
        } catch (err) {
          console.warn('Google Identity initialization error:', err);
        }
      }
    }

    if (window.google?.accounts?.id) {
      initGoogleClient();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogleClient();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [googleClientId]);

  // Decode JWT payload returned from official Google OAuth
  const handleGoogleCredentialResponse = (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const googleUser = {
        name: payload.name || payload.given_name || 'Google User',
        email: payload.email,
        avatar: payload.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        provider: 'google',
        verified: payload.email_verified ?? true,
        sub: payload.sub,
        loginTime: new Date().toLocaleTimeString(),
      };

      setUser(googleUser);
      localStorage.setItem('cortex_user', JSON.stringify(googleUser));
      setAuthModalOpen(false);
    } catch (e) {
      console.error('Failed to parse Google credential:', e);
    }
  };

  const loginWithGoogle = (customEmail, customName) => {
    // If official Google Client ID is configured and GIS is available, trigger official prompt
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    // Seamless instant demo login or custom email/name
    const newUser = {
      name: customName || 'Aditya Sharma',
      email: customEmail || 'aditya.sharma.invest@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      provider: 'google',
      verified: true,
      loginTime: new Date().toLocaleTimeString(),
    };
    setUser(newUser);
    localStorage.setItem('cortex_user', JSON.stringify(newUser));
    setAuthModalOpen(false);
  };

  const logout = () => {
    if (window.google?.accounts?.id && user?.email) {
      try {
        window.google.accounts.id.revoke(user.email, () => {});
      } catch (e) {
        console.warn('Revoke failed:', e);
      }
    }
    setUser(null);
    localStorage.removeItem('cortex_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, authModalOpen, setAuthModalOpen, googleClientId, googleClientReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
