import { useState } from "react";
import Landing from "./Landing";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

type Page = 'landing' | 'login' | 'signup' | 'dashboard';

interface User {
  name: string;
  email: string;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setCurrentPage('dashboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setCurrentPage('dashboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  if (currentPage === 'landing') {
    return (
      <Landing
        onNavigateToLogin={() => setCurrentPage('login')}
        onNavigateToSignup={() => setCurrentPage('signup')}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onNavigateToSignup={() => setCurrentPage('signup')}
        onNavigateToLanding={() => setCurrentPage('landing')}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <Signup
        onSignup={handleSignup}
        onNavigateToLogin={() => setCurrentPage('login')}
        onNavigateToLanding={() => setCurrentPage('landing')}
      />
    );
  }

  if (currentPage === 'dashboard' && user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Fallback
  return <Landing onNavigateToLogin={() => setCurrentPage('login')} onNavigateToSignup={() => setCurrentPage('signup')} />;
};

export default Index;
