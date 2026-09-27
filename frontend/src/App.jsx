import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// public
import Home from './pages/public/home/Home';
import FQA from './pages/public/fqa/FQA';
import Farmer from './pages/public/farmer/Farmer';
import Engineer from './pages/public/engineer/Engineer';
import Equipment from './pages/public/equipment/Equipment';
import Contact from './pages/public/contact/Contact';

// dashboards
import EngineerDashboard from './pages/Engineer/EngineerDashboard';
import DealerDashboard from './pages/Dealer/DealerDashboard';

function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <BrowserRouter>
          <Routes>
            {/* Public marketing pages */}
            <Route path='/' element={<Home />} />
            <Route path='/fqa' element={<FQA />} />
            <Route path='/farmer' element={<Farmer />} />
            <Route path='/engineer' element={<Engineer />} />
            <Route path='/equipment' element={<Equipment />} />
            <Route path='/contact' element={<Contact />} />

            {/* Engineer dashboard (protected) */}
            <Route
              path='/engineer/*'
              element={
                <ProtectedRoute role='engineer'>
                  <EngineerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Dealer dashboard (protected) */}
            <Route
              path='/dealer/*'
              element={
                <ProtectedRoute role='dealer'>
                  <DealerDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthModalProvider>
    </AuthProvider>
  );
};

export default App;
