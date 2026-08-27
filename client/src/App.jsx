import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { OrganizationLayout } from './layouts/OrganizationLayout';
import { CustomerLayout } from './layouts/CustomerLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Customer QR Experience Pages
import { QRLandingPage } from './pages/customer/QRLandingPage';
import { ComplaintFormPage } from './pages/customer/ComplaintFormPage';
import { FeedbackFormPage } from './pages/customer/FeedbackFormPage';
import { ConfirmationPage } from './pages/customer/ConfirmationPage';
import { ServiceUnavailablePage } from './pages/customer/ServiceUnavailablePage';

// Admin Pages
import { OverviewPage } from './pages/admin/OverviewPage';
import { OrganizationsPage } from './pages/admin/OrganizationsPage';
import { OrganizationCreatePage } from './pages/admin/OrganizationCreatePage';
import { OrganizationDetailsPage } from './pages/admin/OrganizationDetailsPage';
import { QrCodesPage } from './pages/admin/QrCodesPage';
import { SubmissionsPage } from './pages/admin/SubmissionsPage';
import { RenewalsPage } from './pages/admin/RenewalsPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

// Organization Pages
import { OrgDashboardPage } from './pages/org/OrgDashboardPage';
import { OrgSubmissionsPage } from './pages/org/OrgSubmissionsPage';
import { OrgQrPage } from './pages/org/OrgQrPage';
import { OrgSubscriptionPage } from './pages/org/OrgSubscriptionPage';
import { OrgReportsPage } from './pages/org/OrgReportsPage';
import { OrgProfilePage } from './pages/org/OrgProfilePage';

export const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#2F2E2D',
            color: '#fff',
            fontSize: '13px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#0086FF',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#E11D48',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public SaaS Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* Customer Experience (Mobile-First / Anonymous) */}
        <Route path="/c/:token" element={<CustomerLayout />}>
          <Route index element={<QRLandingPage />} />
          <Route path="cabasho" element={<ComplaintFormPage />} />
          <Route path="complaint" element={<ComplaintFormPage />} />
          <Route path="talo" element={<FeedbackFormPage />} />
          <Route path="feedback" element={<FeedbackFormPage />} />
          <Route path="confirmation" element={<ConfirmationPage />} />
          <Route path="unavailable" element={<ServiceUnavailablePage />} />
        </Route>

        {/* Platform Admin Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="organizations/create" element={<OrganizationCreatePage />} />
          <Route path="organizations/:id" element={<OrganizationDetailsPage />} />
          <Route path="qr-center" element={<QrCodesPage />} />
          <Route path="complaints" element={<SubmissionsPage />} />
          <Route path="feedback" element={<SubmissionsPage />} />
          <Route path="submissions" element={<SubmissionsPage />} />
          <Route path="subscriptions" element={<RenewalsPage />} />
          <Route path="renewals" element={<RenewalsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="settings" element={<AdminUsersPage />} />
        </Route>

        {/* Organization Portal */}
        <Route path="/organization" element={<OrganizationLayout />}>
          <Route index element={<Navigate to="/organization/overview" replace />} />
          <Route path="overview" element={<OrgDashboardPage />} />
          <Route path="complaints" element={<OrgSubmissionsPage />} />
          <Route path="feedback" element={<OrgSubmissionsPage />} />
          <Route path="submissions" element={<OrgSubmissionsPage />} />
          <Route path="qr" element={<OrgQrPage />} />
          <Route path="subscription" element={<OrgSubscriptionPage />} />
          <Route path="reports" element={<OrgReportsPage />} />
          <Route path="profile" element={<OrgProfilePage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
export default App;
