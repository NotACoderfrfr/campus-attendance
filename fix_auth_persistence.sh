#!/bin/bash

# This script fixes the authentication persistence issue

# Update the auth service to be more robust
cat > src/utils/auth.ts << 'AUTH_END'
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
AUTH_END

echo "✅ Auth service updated with persistence"

# Deploy
git add .
git commit -m "Fix: Auth persistence with better logging"
git push origin main
npx convex deploy
vercel --prod

echo "✅ Deployed! Check browser console for 'Auth:' logs to debug"
