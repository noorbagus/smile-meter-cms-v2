// pages/dashboard.js - Fixed version
import { useState, useEffect } from 'react';
import { Package, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../pages/_app';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Overview from '../components/dashboard/overview';
import StockTable from '../components/dashboard/stock-table';
import UserManagement from '../components/dashboard/user-management';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check auth and role
    if (!user || !profile) {
      router.push('/login');
      return;
    }

    if (profile.role !== 'admin') {
      if (profile.role === 'customer_service') {
        router.push('/cs-dashboard');
      } else {
        router.push('/login');
      }
      return;
    }

    // Load initial data
    loadUnits();
  }, [user, profile, router]);

  const loadUnits = async () => {
    try {
      const { data: unitsData } = await supabase
        .from('units')
        .select('*')
        .eq('is_active', true)
        .order('name');

      setUnits(unitsData || []);
      
      // Set first unit as default selected
      if (unitsData?.length > 0) {
        setSelectedUnit(unitsData[0].id);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitSelect = (unitId) => {
    setSelectedUnit(unitId);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2a93ce] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-[#2a93ce] rounded flex items-center justify-center text-white font-bold">
                SM
              </div>
              <h1 className="text-xl font-semibold text-gray-900">HPM Stock Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {profile?.full_name}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-[#2a93ce] text-[#2a93ce]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="inline w-4 h-4 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stock'
                  ? 'border-[#2a93ce] text-[#2a93ce]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="inline w-4 h-4 mr-2" />
              Stock Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-[#2a93ce] text-[#2a93ce]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="inline w-4 h-4 mr-2" />
              User Management
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <Overview 
            onUnitSelect={handleUnitSelect}
            onTabChange={handleTabChange}
          />
        )}

        {activeTab === 'stock' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>
                <p className="text-gray-600">Manage product inventory across units</p>
              </div>
              
              {/* Unit Selection for Stock Tab */}
              {units.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Unit</label>
                  <select 
                    value={selectedUnit || ''}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-64"
                  >
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} - {unit.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {selectedUnit && (
              <StockTable selectedUnit={selectedUnit} user={user} />
            )}
            
            {!selectedUnit && (
              <div className="bg-white rounded-lg p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Unit Selected</h3>
                <p className="mt-1 text-sm text-gray-500">Please select a unit to manage stock.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <UserManagement user={user} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;