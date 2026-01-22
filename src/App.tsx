import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AddTransaction } from './pages/AddTransaction';
import { PrivacyProvider } from './context/PrivacyContext';

function App() {
  return (
    <PrivacyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="history" element={<History />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/add" element={<AddTransaction />} />
        </Routes>
      </BrowserRouter>
    </PrivacyProvider>
  );
}

export default App;
