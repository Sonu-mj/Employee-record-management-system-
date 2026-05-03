import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
  }

  const cards = [
    { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: '👥', color: 'bg-blue-500' },
    { label: 'Departments', value: stats?.totalDepartments || 0, icon: '🏢', color: 'bg-green-500' },
    { label: "Today's Attendance", value: stats?.todayAttendance || 0, icon: '✅', color: 'bg-purple-500' },
    { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: '⏳', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Distribution</h3>
          {stats?.deptStats?.length > 0 ? (
            <div className="space-y-3">
              {stats.deptStats.map((dept) => (
                <div key={dept._id || 'unassigned'} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{dept.name || 'Unassigned'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${Math.min((dept.count / stats.totalEmployees) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800 w-6 text-right">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No department data</p>
          )}
        </div>

        {/* Recent Leaves */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Leave Requests</h3>
          {stats?.recentLeaves?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentLeaves.map((leave) => (
                <div key={leave._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{leave.employee?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{leave.type} leave</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      leave.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : leave.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No recent leaves</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
