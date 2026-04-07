import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AppShell({ children, navItems, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-72 flex-col bg-slate-900 p-6 text-white md:flex">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">LearnAI</h1>
          <p className="mt-1 text-sm text-slate-400">{title}</p>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `block rounded-xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { logout(); navigate('/'); }} className="mt-6 flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700">
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{user?.firstName} {user?.lastName} • {user?.role}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">{user?.firstName?.[0] || 'U'}</div>
        </header>
        {children}
      </main>
    </div>
  );
}
