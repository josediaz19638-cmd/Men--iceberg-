import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClientView from './pages/ClientView';
import AdminView from './pages/AdminView';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientView />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
