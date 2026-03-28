import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    // Exemplo: checar autenticação no backend REST
    const checkAuth = async () => {
      setIsLoadingAuth(true);
      setAuthError(null);
      try {
        // Supondo endpoint GET /me retorna usuário autenticado ou 401
        const userData = await apiClient.get('/me');
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
