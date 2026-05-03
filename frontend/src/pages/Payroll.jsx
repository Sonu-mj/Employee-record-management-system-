import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [payslipData, setPayslipData] = useState(null);
  const { isAdmin } = useAuth();

  const [form, setForm] = useState({
    employee: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    basicSalary: 0, hra: 0, da: 0, bonus: 0, deductions: 0
  });

  useEffect(() => {
    fetchPayrolls();
    if (isAdmin) fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await API.get('/payroll');
      setPayrolls(res.data.data);
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees', { params: { limit: 100 } });
      setEmployees(res.data.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/payroll', form);
      setShowModal(false);
      fetchPayrolls();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create payroll');
    }
  };

  const viewPayslip = async (id) => {
    try {
      const res = await API.get(`/payroll/${id}/payslip`);
      setPayslipData(res.data.data);
    } catch (error) {
      alert('Failed to generate payslip');
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payroll</h2>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            + Add Payroll
          </button>
        )}
      </div>

      {/* Payroll Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Month/Year</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Basic</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">HRA</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Bonus</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payrolls.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{p.employee?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.month}/{p.year}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(p.basicSalary)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(p.hra)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(p.bonus)}</td>
                  <td className="px-6 py-4 text-sm text-red-500">{formatCurrency(p.deductions)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatCurrency(p.netSalary)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => viewPayslip(p._id)} className="text-primary-600 hover:text-primary-800 text-sm">View</button>
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr><td colSpan="8" className="text-center py-8 text-gray-400">No payroll records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Payroll Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add Payroll</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select required value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name} - {emp.position}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <input type="number" min="1" max="12" required value={form.month} onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              {['basicSalary', 'hra', 'da', 'bonus', 'deductions'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</label>
                  <input type="number" min="0" value={form[field]} onChange={(e) => setForm({ ...form, [field]: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {payslipData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <div className="text-center border-b pb-4 mb-4">
              <h3 className="text-xl font-bold text-primary-800">{payslipData.company}</h3>
              <p className="text-sm text-gray-500">Pay Slip - {payslipData.payPeriod}</p>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm"><span className="text-gray-500">Name:</span> <span className="font-medium">{payslipData.employee.name}</span></p>
              <p className="text-sm"><span className="text-gray-500">Position:</span> <span className="font-medium">{payslipData.employee.position}</span></p>
            </div>
            <div className="border-t pt-4 space-y-1">
              <p className="text-sm flex justify-between"><span>Basic Salary</span><span>{formatCurrency(payslipData.earnings.basicSalary)}</span></p>
              <p className="text-sm flex justify-between"><span>HRA</span><span>{formatCurrency(payslipData.earnings.hra)}</span></p>
              <p className="text-sm flex justify-between"><span>DA</span><span>{formatCurrency(payslipData.earnings.da)}</span></p>
              <p className="text-sm flex justify-between"><span>Bonus</span><span>{formatCurrency(payslipData.earnings.bonus)}</span></p>
              <p className="text-sm flex justify-between font-medium border-t pt-1 mt-1"><span>Total Earnings</span><span>{formatCurrency(payslipData.earnings.totalEarnings)}</span></p>
              <p className="text-sm flex justify-between text-red-600"><span>Deductions</span><span>-{formatCurrency(payslipData.deductions)}</span></p>
              <p className="text-lg flex justify-between font-bold border-t pt-2 mt-2 text-primary-800"><span>Net Salary</span><span>{formatCurrency(payslipData.netSalary)}</span></p>
            </div>
            <button onClick={() => setPayslipData(null)} className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
