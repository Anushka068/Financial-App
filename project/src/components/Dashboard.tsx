import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import { MenuProvider } from '../context/MenuContext';

const Dashboard: React.FC = () => {
  return (
    <MenuProvider>
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex w-full">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <DashboardContent />
          </main>
        </div>
      </div>
    </MenuProvider>
  );
};

export default Dashboard;