// src/components/ChemicalAnalyzer.tsx
import { useState, useEffect } from 'react';
import { Upload, BarChart3, Download, History, LogOut, User } from 'lucide-react';
import { datasetAPI, authAPI } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Dataset {
  id: number;
  filename: string;
  uploaded_at: string;
  total_records: number;
  summary_stats: any;
  equipment_types: any;
}

export default function ChemicalAnalyzer() {
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [history, setHistory] = useState<Dataset[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [showLogin, setShowLogin] = useState(true);

  // Auth states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setShowLogin(false);
      loadHistory();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authAPI.login(username, password);
      setUser(data.user);
      setShowLogin(false);
      loadHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authAPI.register(username, email, password, password);
      setUser(data.user);
      setShowLogin(false);
      loadHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
    setShowLogin(true);
    setCurrentDataset(null);
    setHistory([]);
  };

  const loadHistory = async () => {
    try {
      const data = await datasetAPI.getHistory();
      setHistory(data.results || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const result = await datasetAPI.upload(file);
      setCurrentDataset(result.dataset);
      setFile(null);
      loadHistory();
      alert('File uploaded successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleViewDataset = async (id: number) => {
    try {
      const data = await datasetAPI.get(id);
      setCurrentDataset(data);
      setActiveTab('upload');
    } catch (error) {
      alert('Error loading dataset');
    }
  };

  const handleGenerateReport = async () => {
    if (!currentDataset) return;

    try {
      const result = await datasetAPI.generateReport(currentDataset.id);
      alert('Report generated successfully!');
      window.open(result.report.report_url, '_blank');
    } catch (error) {
      alert('Error generating report');
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
            Chemical Analyzer
          </h1>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {isRegistering ? 'Register' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-indigo-600 text-sm hover:underline"
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const equipmentChartData = currentDataset?.equipment_types ? {
    labels: Object.keys(currentDataset.equipment_types),
    datasets: [{
      label: 'Equipment Count',
      data: Object.values(currentDataset.equipment_types),
      backgroundColor: 'rgba(79, 70, 229, 0.6)',
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 1,
    }],
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Chemical Equipment Analyzer</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 flex items-center gap-2">
              <User className="w-5 h-5" />
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-5 h-5" />
            Upload & Analyze
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <History className="w-5 h-5" />
            History
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upload CSV File</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload and Analyze
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {currentDataset && (
              <>
                {/* Summary Stats */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Summary Statistics</h2>
                    <button
                      onClick={handleGenerateReport}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Generate PDF Report
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Records</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {currentDataset.total_records}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Equipment Types</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Object.keys(currentDataset.equipment_types || {}).length}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Uploaded</p>
                      <p className="text-lg font-bold text-blue-600">
                        {new Date(currentDataset.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Stats Table */}
                  {currentDataset.summary_stats && Object.keys(currentDataset.summary_stats).length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Metric</th>
                            {Object.keys(currentDataset.summary_stats).map((col) => (
                              <th key={col} className="px-4 py-2 text-center">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {['mean', 'median', 'std', 'min', 'max'].map((stat) => (
                            <tr key={stat} className="border-b">
                              <td className="px-4 py-2 font-medium capitalize">{stat}</td>
                              {Object.keys(currentDataset.summary_stats).map((col) => (
                                <td key={col} className="px-4 py-2 text-center">
                                  {currentDataset.summary_stats[col][stat]?.toFixed(2) || 'N/A'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Chart */}
                {equipmentChartData && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6" />
                      Equipment Type Distribution
                    </h2>
                    <div className="h-80">
                      <Bar
                        data={equipmentChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            title: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                stepSize: 1,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Upload History (Last 5)</h2>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No datasets uploaded yet</p>
            ) : (
              <div className="space-y-4">
                {history.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDataset(dataset.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{dataset.filename}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(dataset.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {dataset.total_records} records
                        </p>
                        <p className="text-sm text-gray-600">
                          {Object.keys(dataset.equipment_types || {}).length} types
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}