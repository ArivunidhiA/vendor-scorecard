import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './pages/Dashboard';
import VendorDetail from './pages/VendorDetail';
import ShareView from './components/ShareView';
import MistBackground from './components/ui/MistBackground';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App relative">
        <MistBackground />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendor/:id" element={<VendorDetail />} />
          <Route path="/share/:shareId" element={<ShareView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
