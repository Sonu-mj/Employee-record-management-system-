import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-gray-300 hover:bg-primary-700 hover:text-white'
    }`;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/employees', label: 'Employees', icon: '👥', adminOnly: true },
    { to: '/departments', label: 'Departments', icon: '🏢', adminOnly: true },
    { to: '/leaves', label: 'Leaves', icon: '📋' },
    { to: '/attendance', label: 'Attendance', icon: '🕐' },
    { to: '/payroll', label: 'Payroll', icon: '💰' },
    { to: '/announcements', label: 'Announcements', icon: '📢' },
  ];

  return (
    <div className="w-64 bg-primary-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-primary-700">
        <h1 className="text-xl font-bold">ERMS</h1>
        <p className="text-xs text-primary-300 mt-1">Employee Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* User info & logout */}
      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-primary-300 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
