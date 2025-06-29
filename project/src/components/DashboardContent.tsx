import React from 'react';
import { useMenu } from '../context/MenuContext';
import OverviewDashboard from './dashboard/OverviewDashboard';
import TransactionsPage from './dashboard/TransactionsPage';
import ExpensesPage from './dashboard/ExpensesPage';
import ProfitLossPage from './dashboard/ProfitLossPage';
import ReportsPage from './dashboard/ReportsPage';
import AnalyticsPage from './dashboard/AnalyticsPage';
import ExportPage from './dashboard/ExportPage';
import UsersPage from './dashboard/UsersPage';
import SettingsPage from './dashboard/SettingsPage';

const DashboardContent: React.FC = () => {
  const { activeMenuItem } = useMenu();

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'transactions':
        return <TransactionsPage />;
      case 'wallet':
        return <ExpensesPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'personal':
        return <ProfitLossPage />;
      case 'message':
        return <ReportsPage />;
      case 'setting':
        return <SettingsPage />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen pt-0">
      {renderContent()}
    </div>
  );
};

export default DashboardContent;