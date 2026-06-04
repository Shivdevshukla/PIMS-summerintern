import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateEntry from './pages/CreateEntry';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);

  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route
          index
          element={<Dashboard />}
        />

        <Route
          path="create-entry"
          element={<CreateEntry />}
        />

      </Route>

    </Routes>
  );
}