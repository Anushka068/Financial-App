const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('auth');
      }
    }
    return {
      'Content-Type': 'application/json'
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return this.handleResponse(response);
  }

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return this.handleResponse(response);
  }

  // Transactions
  async getTransactions(params: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/transactions?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getSampleTransactions(params: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/transactions/sample?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getTransactionStats(startDate?: string, endDate?: string) {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/transactions/stats?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async createTransaction(transaction: {
    type: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    tags?: string[];
    notes?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    return this.handleResponse(response);
  }

  async updateTransaction(id: string, transaction: Partial<{
    type: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    tags: string[];
    notes: string;
  }>) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    return this.handleResponse(response);
  }

  async deleteTransaction(id: string) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Dashboard
  async getDashboardOverview(period = 'monthly') {
    const response = await fetch(`${API_BASE_URL}/dashboard/overview?period=${period}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getRevenueData(period = 'monthly') {
    const response = await fetch(`${API_BASE_URL}/dashboard/revenue?period=${period}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getExpenseData() {
    const response = await fetch(`${API_BASE_URL}/dashboard/expenses`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getProfitLossData() {
    const response = await fetch(`${API_BASE_URL}/dashboard/profit-loss`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Export
  async exportTransactionsCSV(params: {
    startDate?: string;
    endDate?: string;
    type?: string;
    category?: string;
    search?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/export/transactions/csv?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async exportDashboardJSON(period = 'monthly') {
    const response = await fetch(`${API_BASE_URL}/export/dashboard/json?period=${period}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-data.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async generateCustomReport(params: {
    startDate?: string;
    endDate?: string;
    format?: string;
    includeCategories?: string[];
    excludeCategories?: string[];
    types?: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}/export/report`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params)
    });

    if (params.format === 'csv') {
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'custom-report.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } else {
      return this.handleResponse(response);
    }
  }

  // Users
  async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateUserProfile(profile: {
    name?: string;
    email?: string;
    avatar?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profile)
    });
    return this.handleResponse(response);
  }

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();