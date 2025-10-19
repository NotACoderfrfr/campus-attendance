// Persistent authentication utilities

const AUTH_KEYS = {
  ROLL_NUMBER: 'studentRollNumber',
  NAME: 'studentName',
  IS_AUTHENTICATED: 'isAuthenticated',
  LOGIN_TIMESTAMP: 'loginTimestamp'
};

export const authService = {
  // Login and persist
  login(rollNumber: string, name: string) {
    try {
      localStorage.setItem(AUTH_KEYS.ROLL_NUMBER, rollNumber);
      localStorage.setItem(AUTH_KEYS.NAME, name);
      localStorage.setItem(AUTH_KEYS.IS_AUTHENTICATED, 'true');
      localStorage.setItem(AUTH_KEYS.LOGIN_TIMESTAMP, Date.now().toString());
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    try {
      const isAuth = localStorage.getItem(AUTH_KEYS.IS_AUTHENTICATED);
      const rollNumber = localStorage.getItem(AUTH_KEYS.ROLL_NUMBER);
      return isAuth === 'true' && !!rollNumber;
    } catch {
      return false;
    }
  },

  // Get current user data
  getUser() {
    try {
      return {
        rollNumber: localStorage.getItem(AUTH_KEYS.ROLL_NUMBER),
        name: localStorage.getItem(AUTH_KEYS.NAME),
        loginTimestamp: localStorage.getItem(AUTH_KEYS.LOGIN_TIMESTAMP)
      };
    } catch {
      return null;
    }
  },

  // Logout
  logout() {
    try {
      localStorage.removeItem(AUTH_KEYS.ROLL_NUMBER);
      localStorage.removeItem(AUTH_KEYS.NAME);
      localStorage.removeItem(AUTH_KEYS.IS_AUTHENTICATED);
      localStorage.removeItem(AUTH_KEYS.LOGIN_TIMESTAMP);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  // Get roll number
  getRollNumber(): string | null {
    return localStorage.getItem(AUTH_KEYS.ROLL_NUMBER);
  },

  // Get name
  getName(): string | null {
    return localStorage.getItem(AUTH_KEYS.NAME);
  }
};
