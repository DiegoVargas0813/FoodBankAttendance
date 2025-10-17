// @ts-ignore
import { useState } from 'react'
// @ts-ignore
import reactLogo from './assets/react.svg'
// @ts-ignore
import viteLogo from '/vite.svg'
// @ts-ignore
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

//Pages Import
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import Driver from './pages/driver';
import ConfirmEmail from './pages/confirmEmail';
import FormPage from './pages/form';

//Components Import
import ProtectedRoute from './components/auth/protectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/confirm/:token" element={<ConfirmEmail />} />
        {/** Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/driver" element={<Driver/>} />
          <Route path="/form" element={<FormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
