import React from 'react';
import { FileText, Calendar, Download, TrendingUp } from 'lucide-react';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate comprehensive financial reports and insights
          </p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports Coming Soon</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Advanced reporting features including custom report generation, scheduled reports, and detailed analytics are under development.
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;