import React from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { ProjectsView } from './components/projects/ProjectsView';
import { FinanceView } from './components/finance/FinanceView';
import { CashFlowView } from './components/finance/CashFlowView';
import { InvoiceEngineView } from './components/finance/InvoiceEngineView';
import { SubcontractorsView } from './components/vendors/SubcontractorsView';
import { RentalMachineryView } from './components/rental/RentalMachineryView';
import { PayrollWorkforceView } from './components/payroll/PayrollWorkforceView';
import { OperationalExpensesView } from './components/expenses/OperationalExpensesView';
import { SiteOperationsView } from './components/operations/SiteOperationsView';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { BackupRestoreView } from './components/backup/BackupRestoreView';
import { LicenseManagementView } from './components/licensing/LicenseManagementView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { RoleSwitcherModal } from './components/rbac/RoleSwitcherModal';
import { NotificationToast } from './components/common/NotificationToast';
import { MobileBottomNavBar } from './components/layout/MobileBottomNavBar';
import { LoginAuthScreen } from './components/auth/LoginAuthScreen';
import { DirectorSettingsView } from './components/settings/DirectorSettingsView';

const AppContent: React.FC = () => {
  const { currentTab, isAuthenticated } = useErp();

  if (!isAuthenticated) {
    return (
      <>
        <NotificationToast />
        <LoginAuthScreen />
      </>
    );
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'projects':
        return <ProjectsView />;
      case 'treasury':
        return <CashFlowView />;
      case 'invoices':
        return <InvoiceEngineView />;
      case 'subcontractors':
        return <SubcontractorsView />;
      case 'rental_machinery':
        return <RentalMachineryView />;
      case 'finance':
        return <FinanceView />;
      case 'payroll':
        return <PayrollWorkforceView />;
      case 'expenses':
      case 'operations_expenses':
        return <OperationalExpensesView />;
      case 'operations':
        return <SiteOperationsView />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'backup':
        return <BackupRestoreView />;
      case 'licensing':
        return <LicenseManagementView />;
      case 'settings':
        return <DirectorSettingsView />;
      case 'audit':
        return <AuditLogsView />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row relative selection:bg-amber-500 selection:text-slate-950 font-sans overflow-x-hidden">
      {/* Toast notifications */}
      <NotificationToast />

      {/* Role Switcher RBAC Modal */}
      <RoleSwitcherModal />

      {/* Collapsible Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative pb-24 md:pb-8">
        {/* Top Header */}
        <TopHeader />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col justify-between">
          <div>{renderActiveView()}</div>

          <footer className="mt-12 pt-4 border-t border-slate-800/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>شركة لمسات المعمار للمقاولات والاستشارات الهندسية © 2026</span>
            <span className="text-amber-400/90 font-medium">
              تمت برمجة وتطوير النظام بواسطة - شركة فن التقنية الحديثة
            </span>
          </footer>
        </main>
      </div>

      {/* Fixed Horizontal Bottom Navigation Bar for Mobile Phones */}
      <MobileBottomNavBar />
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <AppContent />
    </ErpProvider>
  );
}
