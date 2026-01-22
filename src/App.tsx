import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AddTransaction } from './pages/AddTransaction';
import { Inventory } from './pages/Inventory';
import { Parties } from './pages/Parties';
import { Staff } from './pages/Staff';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { PrivacyProvider } from './context/PrivacyContext';
import { BusinessProvider } from './context/BusinessContext';
import { AuthProvider } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <PrivacyProvider>
          <BusinessProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="parties" element={<Parties />} />
                    <Route path="staff" element={<Staff />} />
                    <Route path="history" element={<History />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  <Route path="/add" element={<AddTransaction />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </BusinessProvider>
        </PrivacyProvider>
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;
