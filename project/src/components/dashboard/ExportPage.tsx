import React, { useState } from 'react';
import { Download, Calendar, Filter, FileText, Table, BarChart3, Check } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const ExportPage: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedData, setSelectedData] = useState<string[]>(['revenue', 'expenses']);
  const [dateRange, setDateRange] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const dataTypes = [
    { id: 'revenue', label: 'Revenue Data', description: 'All revenue transactions and sources' },
    { id: 'expenses', label: 'Expense Data', description: 'All expense transactions and categories' },
    { id: 'profit', label: 'Profit & Loss', description: 'P&L statements and profitability metrics' },
    { id: 'transactions', label: 'Transaction History', description: 'Complete transaction history' },
    { id: 'analytics', label: 'Analytics Data', description: 'Performance metrics and KPIs' },
    { id: 'clients', label: 'Client Data', description: 'Client information and revenue attribution' },
  ];

  const formatOptions = [
    { id: 'csv', label: 'CSV', description: 'Comma-separated values, ideal for Excel', icon: Table },
    { id: 'xlsx', label: 'Excel', description: 'Excel workbook with multiple sheets', icon: FileText },
    { id: 'pdf', label: 'PDF', description: 'Professional report format', icon: FileText },
    { id: 'json', label: 'JSON', description: 'Raw data format for developers', icon: BarChart3 },
  ];

  const exportPresets = [
    { id: 'financial-summary', label: 'Financial Summary', includes: ['revenue', 'expenses', 'profit'] },
    { id: 'transaction-report', label: 'Transaction Report', includes: ['transactions', 'revenue', 'expenses'] },
    { id: 'analytics-package', label: 'Analytics Package', includes: ['analytics', 'profit', 'revenue'] },
    { id: 'complete-export', label: 'Complete Export', includes: ['revenue', 'expenses', 'profit', 'transactions', 'analytics', 'clients'] },
  ];

  const handleDataTypeChange = (dataType: string) => {
    setSelectedData(prev => 
      prev.includes(dataType) 
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const handlePresetSelect = (preset: typeof exportPresets[0]) => {
    setSelectedData(preset.includes);
  };

  const generateMockData = (type: string) => {
    const data: Record<string, any[]> = {
      revenue: [
        { date: '2024-01-01', amount: 15000, source: 'Consulting', client: 'TechCorp' },
        { date: '2024-01-02', amount: 8500, source: 'Product Sales', client: 'StartupX' },
        { date: '2024-01-03', amount: 12000, source: 'Subscription', client: 'Enterprise Ltd' },
      ],
      expenses: [
        { date: '2024-01-01', amount: -2500, category: 'Technology', description: 'Software License' },
        { date: '2024-01-02', amount: -3200, category: 'Marketing', description: 'Ad Campaign' },
        { date: '2024-01-03', amount: -450, category: 'Operations', description: 'Office Supplies' },
      ],
      profit: [
        { date: '2024-01-01', revenue: 15000, expenses: 8000, profit: 7000, margin: 46.7 },
        { date: '2024-01-02', revenue: 18000, expenses: 12000, profit: 6000, margin: 33.3 },
        { date: '2024-01-03', revenue: 22000, expenses: 14000, profit: 8000, margin: 36.4 },
      ],
    };
    return data[type] || [];
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (selectedFormat === 'csv') {
      selectedData.forEach(dataType => {
        const data = generateMockData(dataType);
        if (data.length > 0) {
          exportToCSV(data, `${dataType}_${dateRange}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        }
      });
    }
    
    setIsExporting(false);
    setExportSuccess(true);
    
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      case 'custom': return 'Custom range';
      default: return 'Last 30 days';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export Financial Data</h1>
          <p className="mt-1 text-sm text-gray-500">
            Export your financial data in various formats for analysis and reporting
          </p>
        </div>
      </div>

      {/* Export Success Message */}
      {exportSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Export completed successfully! Your files have been downloaded.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Presets */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Export Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-900">{preset.label}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Includes: {preset.includes.join(', ')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Data Selection */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Data to Export</h3>
            <div className="space-y-3">
              {dataTypes.map((dataType) => (
                <label
                  key={dataType.id}
                  className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedData.includes(dataType.id)}
                    onChange={() => handleDataTypeChange(dataType.id)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">{dataType.label}</h4>
                    <p className="text-sm text-gray-500">{dataType.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['7d', '30d', '90d', '1y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      dateRange === range
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {range === '7d' && 'Last 7 days'}
                    {range === '30d' && 'Last 30 days'}
                    {range === '90d' && 'Last 90 days'}
                    {range === '1y' && 'Last year'}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setDateRange('custom')}
                className={`w-full p-3 text-center border rounded-lg transition-colors ${
                  dateRange === 'custom'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Custom Date Range
              </button>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <label
                    key={format.id}
                    className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.id}
                      checked={selectedFormat === format.id}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 text-gray-400 mr-2" />
                        <h4 className="font-medium text-gray-900">{format.label}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{format.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Export Summary & Action */}
        <div className="space-y-6">
          {/* Export Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Summary</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Types Selected</p>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedData.length > 0 ? selectedData.join(', ') : 'None selected'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p className="text-sm text-gray-900 mt-1">{getDateRangeLabel()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Export Format</p>
                <p className="text-sm text-gray-900 mt-1 capitalize">{selectedFormat}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated File Size</p>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedData.length * 0.5}MB - {selectedData.length * 2}MB
                </p>
              </div>
            </div>
          </div>

          {/* Export Action */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={handleExport}
              disabled={selectedData.length === 0 || isExporting}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Export Data
                </>
              )}
            </button>
            
            {selectedData.length === 0 && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Please select at least one data type to export
              </p>
            )}
          </div>

          {/* Export History */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h3>
            <div className="space-y-3">
              {[
                { name: 'Financial Summary', date: '2024-01-07', format: 'CSV', size: '2.4MB' },
                { name: 'Transaction Report', date: '2024-01-05', format: 'Excel', size: '1.8MB' },
                { name: 'Analytics Package', date: '2024-01-03', format: 'PDF', size: '5.2MB' },
              ].map((export_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{export_.name}</p>
                    <p className="text-xs text-gray-500">{format(new Date(export_.date), 'MMM dd, yyyy')} • {export_.format} • {export_.size}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;