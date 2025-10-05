// @ts-ignore
import { useState } from 'react'
// @ts-ignore
import reactLogo from './assets/react.svg'
// @ts-ignore
import viteLogo from '/vite.svg'
import './App.css'
// @ts-ignore
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

//Pages Import
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import Driver from './pages/driver';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/driver" element={<Driver/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
