import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AddTransaction } from './pages/AddTransaction';
import { Inventory } from './pages/Inventory';
import { Parties } from './pages/Parties';
import { PrivacyProvider } from './context/PrivacyContext';
import { BusinessProvider } from './context/BusinessContext';

function App() {
  return (
    <PrivacyProvider>
      <BusinessProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="parties" element={<Parties />} />
              <Route path="history" element={<History />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/add" element={<AddTransaction />} />
          </Routes>
        </BrowserRouter>
      </BusinessProvider>
    </PrivacyProvider>
  );
}

export default App;
