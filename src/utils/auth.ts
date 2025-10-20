const AUTH_KEYS = {
  ROLL_NUMBER: 'studentRollNumber',
  NAME: 'studentName',
  IS_AUTHENTICATED: 'isAuthenticated',
  LOGIN_TIMESTAMP: 'loginTimestamp'
};

export const authService = {
  login(rollNumber: string, name: string) {
    try {
      localStorage.setItem(AUTH_KEYS.ROLL_NUMBER, rollNumber);
      localStorage.setItem(AUTH_KEYS.NAME, name);
      localStorage.setItem(AUTH_KEYS.IS_AUTHENTICATED, 'true');
      localStorage.setItem(AUTH_KEYS.LOGIN_TIMESTAMP, Date.now().toString());
      console.log('Auth: Login successful', { rollNumber, name });
      return true;
    } catch (error) {
      console.error('Auth: Login failed:', error);
      return false;
    }
  },

  isAuthenticated(): boolean {
    try {
      const isAuth = localStorage.getItem(AUTH_KEYS.IS_AUTHENTICATED);
      const rollNumber = localStorage.getItem(AUTH_KEYS.ROLL_NUMBER);
      const result = isAuth === 'true' && !!rollNumber;
      console.log('Auth: Check authentication', { isAuth, rollNumber, result });
      return result;
    } catch {
      return false;
    }
  },

  getUser() {
    return {
      rollNumber: localStorage.getItem(AUTH_KEYS.ROLL_NUMBER),
      name: localStorage.getItem(AUTH_KEYS.NAME),
    };
  },

  logout() {
    localStorage.clear();
    console.log('Auth: Logged out');
  },

  getRollNumber(): string | null {
    return localStorage.getItem(AUTH_KEYS.ROLL_NUMBER);
  },

  getName(): string | null {
    return localStorage.getItem(AUTH_KEYS.NAME);
  }
};

// Mobile: Persist auth across tab suspension
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Force re-read from localStorage when tab becomes visible
      const roll = localStorage.getItem('studentRollNumber');
      const name = localStorage.getItem('studentName');
      if (roll && name) {
        console.log('Auth: Mobile tab resumed, auth still valid');
      }
    }
  });
}
