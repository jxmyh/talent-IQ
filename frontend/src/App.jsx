import {
  SignedIn,
  SignedOut,
  SignOutButton,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import { Navigate, Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import ProblemsPage from './pages/ProblemsPage';
import { Toaster } from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';

function App() {
  const { isSignedIn, isLoaded } = useUser();
  // this will get rid of the flickering effect 这将消除闪烁效果
  if (!isLoaded) return null;
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to={'/dashboard'} />}
        />
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to={'/'} />}
        />
      </Routes>
      <div>
        <Toaster />
      </div>
    </>
  );
}

export default App;

// tw,  daisyui , react-router react-hot-toast

// todo: react-query aka, tanstack query ,axios
