import { apiClient, AuthResponse, User, handleApiError } from './api';

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private listeners: Array<(state: AuthState) => void> = [];
  private state: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAuth();
    }
  }

  private initializeAuth() {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.setState({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Verify token is still valid
        this.verifyToken();
      } catch (error) {
        this.clearAuth();
      }
    } else {
      this.setState({ ...this.state, isLoading: false });
    }
  }

  private async verifyToken() {
    try {
      const user = await apiClient.getUserProfile();
      this.setState({
        ...this.state,
        user,
        isLoading: false,
      });
    } catch (error) {
      // Token is invalid, try to refresh
      if (this.state.refreshToken) {
        await this.refreshAuthToken();
      } else {
        this.clearAuth();
      }
    }
  }

  private async refreshAuthToken() {
    try {
      if (!this.state.refreshToken) {
        throw new Error('No refresh token available');
      }

      const { accessToken } = await apiClient.refreshToken(this.state.refreshToken);
      
      localStorage.setItem('authToken', accessToken);
      this.setState({
        ...this.state,
        token: accessToken,
        isLoading: false,
      });
    } catch (error) {
      this.clearAuth();
    }
  }

  private setState(newState: AuthState) {
    this.state = newState;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): AuthState {
    return this.state;
  }

  async login(email: string, password: string): Promise<void> {
    this.setState({ ...this.state, isLoading: true });

    try {
      const authData = await apiClient.login(email, password);
      
      // Store auth data
      localStorage.setItem('authToken', authData.tokens.accessToken);
      localStorage.setItem('refreshToken', authData.tokens.refreshToken);
      localStorage.setItem('userData', JSON.stringify(authData.user));

      this.setState({
        user: authData.user,
        token: authData.tokens.accessToken,
        refreshToken: authData.tokens.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      this.setState({ ...this.state, isLoading: false });
      throw new Error(handleApiError(error));
    }
  }

  async signup(userData: {
    email: string;
    password: string;
    cPassword: string;
    userName: string;
    phone: string;
  }): Promise<string> {
    try {
      const result = await apiClient.signup(userData);
      return result.message || 'Account created successfully. Please check your email for verification.';
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async confirmEmail(email: string, code: string): Promise<string> {
    try {
      const result = await apiClient.confirmEmail(email, code);
      return result.message || 'Email confirmed successfully. You can now login.';
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.state.isAuthenticated) {
        await apiClient.logout();
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  private clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    this.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }

  isAdmin(): boolean {
    return this.state.user?.role === 'admin' || this.state.user?.role === 'superAdmin';
  }

  requireAuth(): void {
    if (!this.state.isAuthenticated) {
      throw new Error('Authentication required');
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// React hook for auth state
export function useAuth() {
  const [authState, setAuthState] = React.useState<AuthState>(authService.getState());

  React.useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    login: authService.login.bind(authService),
    signup: authService.signup.bind(authService),
    confirmEmail: authService.confirmEmail.bind(authService),
    logout: authService.logout.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    requireAuth: authService.requireAuth.bind(authService),
  };
}

// Add React import for the hook
import React from 'react';