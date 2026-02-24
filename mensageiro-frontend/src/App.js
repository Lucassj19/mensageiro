import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import SendEmail from './pages/SendEmail';
import History from './pages/History';
import './styles.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#111118', color: '#e8e8f0', border: '1px solid #1e1e2e', fontFamily: "'DM Sans', sans-serif" },
          success: { iconTheme: { primary: '#e8ff5a', secondary: '#0a0a0f' } },
        }}/>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
          <Route path="/templates" element={<PrivateRoute><Templates/></PrivateRoute>}/>
          <Route path="/send" element={<PrivateRoute><SendEmail/></PrivateRoute>}/>
          <Route path="/history" element={<PrivateRoute><History/></PrivateRoute>}/>
          <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}