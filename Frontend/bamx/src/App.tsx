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
import ConfirmEmail from './pages/confirmEmail';
import ConfirmNotice from './pages/confirmNotice'
import FormPage from './pages/form';
import PendingApprovalsPage from './pages/pendingApprovals';
import ApprovedList from './pages/approvedList';
import ProfilePage from './pages/profile';
import InvitesAdmin from './pages/invitesAdmin';
import InvitesAcceptAdmin from './pages/invitesAcceptAdmin';

//Components Import
import ProtectedRoute from './components/auth/protectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/confirm/:token" element={<ConfirmEmail />} />
        <Route path="/confirm-notice" element={<ConfirmNotice />} />
        <Route path="/accept-invite" element={<InvitesAcceptAdmin />} />
        {/** Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/form" element={<FormPage />} /> 
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        {/** Admin Only Routes */}
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/pending-approvals" element={<PendingApprovalsPage />} />
          <Route path="/approved-list" element={<ApprovedList />} />
          <Route path="/invites-admin" element={<InvitesAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
