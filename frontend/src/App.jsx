import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import IncidentDetail from './pages/IncidentDetail';
import SubmitReport from './pages/SubmitReport';
import IntelligenceMap from './pages/IntelligenceMap';
import IncidentFeed from './pages/IncidentFeed';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents/:id" element={<IncidentDetail />} />
          <Route path="/map" element={<IntelligenceMap />} />
          <Route path="/feed" element={<IncidentFeed />} />
        </Route>
        {/* Submit is full-screen — no sidebar layout */}
        <Route path="/submit" element={<SubmitReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
