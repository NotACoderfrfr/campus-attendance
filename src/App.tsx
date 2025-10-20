import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Login from "./pages/attendance/Login";
import Dashboard from "./pages/attendance/Dashboard";
import Subjects from "./pages/attendance/Subjects";
import { authService } from "./utils/auth";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/attendance/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/attendance/login" replace />} />
          <Route path="/attendance/login" element={<Login />} />
          <Route
            path="/attendance/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/subjects"
            element={
              <ProtectedRoute>
                <Subjects />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ConvexProvider>
  );
}

export default App;
