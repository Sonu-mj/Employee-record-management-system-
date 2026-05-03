import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAttendance();
    fetchTodayStatus();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await API.get('/attendance');
      setRecords(res.data.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await API.get('/attendance', { params: { date: today } });
      const todayRecs = res.data.data;
      const myRecord = todayRecs.find((r) => r.employee?._id === user?._id || r.employee === user?._id);
      setTodayRecord(myRecord || null);
    } catch (error) {
      console.error('Failed to fetch today status:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await API.post('/attendance/checkin');
      fetchAttendance();
      fetchTodayStatus();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await API.post('/attendance/checkout');
      fetchAttendance();
      fetchTodayStatus();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed');
    }
  };

  const statusBadge = (status) => {
    const styles = {
      present: 'bg-green-100 text-green-700',
      absent: 'bg-red-100 text-red-700',
      'half-day': 'bg-yellow-100 text-yellow-700',
      late: 'bg-orange-100 text-orange-700'
    };
    return `text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`;
  };

  const checkedIn = todayRecord?.checkIn && !todayRecord?.checkOut;
  const checkedOut = todayRecord?.checkOut;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance</h2>

      {/* Check-in/Check-out Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm text-gray-500 mb-2">Today's Status</h3>
          <p className="text-2xl font-bold text-gray-800 capitalize">
            {todayRecord ? todayRecord.status : 'Not checked in'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm text-gray-500 mb-2">Check In</h3>
          {todayRecord?.checkIn ? (
            <p className="text-lg font-semibold text-green-600">{new Date(todayRecord.checkIn).toLocaleTimeString()}</p>
          ) : (
            <button onClick={handleCheckIn} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Check In
            </button>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm text-gray-500 mb-2">Check Out</h3>
          {todayRecord?.checkOut ? (
            <p className="text-lg font-semibold text-blue-600">{new Date(todayRecord.checkOut).toLocaleTimeString()}</p>
          ) : checkedIn ? (
            <button onClick={handleCheckOut} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Check Out
            </button>
          ) : (
            <p className="text-sm text-gray-400">Check in first</p>
          )}
        </div>
      </div>

      {/* Attendance Records Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((rec) => (
                <tr key={rec._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{new Date(rec.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{rec.employee?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '—'}</td>
                  <td className="px-6 py-4"><span className={statusBadge(rec.status)}>{rec.status}</span></td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-400">No attendance records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
