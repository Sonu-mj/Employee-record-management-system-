import { useState, useEffect } from 'react';
import API from '../api/axios';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', head: '' });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/departments');
      setDepartments(res.data.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
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

  const openCreateModal = () => {
    setEditDept(null);
    setForm({ name: '', description: '', head: '' });
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditDept(dept);
    setForm({
      name: dept.name,
      description: dept.description || '',
      head: dept.head?._id || dept.head || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editDept) {
        await API.put(`/departments/${editDept._id}`, form);
      } else {
        await API.post('/departments', form);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await API.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (error) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
        <button onClick={openCreateModal} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          + Add Department
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{dept.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(dept)} className="text-primary-600 hover:text-primary-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(dept._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{dept.description || 'No description'}</p>
              <p className="text-xs text-gray-400">
                Head: {dept.head?.name || 'Not assigned'}
              </p>
            </div>
          ))}
          {departments.length === 0 && (
            <p className="text-gray-400 col-span-3 text-center py-8">No departments found</p>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">{editDept ? 'Edit Department' : 'Add Department'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" rows="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
                <select value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select Head</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                  {editDept ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
