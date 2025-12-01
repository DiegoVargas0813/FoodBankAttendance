import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const roleLinks = {
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/pending-approvals', label: 'Aprovaciones pendientes' },
    { to: '/approved-list', label: 'Usuarios Aprobados' },
    { to: '/invites-admin', label: 'Invitar Administrador' },
    { to: '/profile', label: 'Mi Perfil' },
  ],
  driver: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/driver', label: 'Driver Panel' },
    { to: '/profile', label: 'Mi Perfil' },
  ],
  family: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Mi Perfil' },
  ],
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer open
  const { user } = useAuth();

  const links = user ? roleLinks[user.role.toLowerCase() as keyof typeof roleLinks] || [] : [];

  // Listen a simple global event so Header can toggle the mobile drawer with window.dispatchEvent(...)
  useEffect(() => {
    const handler = () => setMobileOpen(prev => !prev);
    window.addEventListener('toggleSidebar', handler);
    return () => window.removeEventListener('toggleSidebar', handler);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <>
      {/* Mobile drawer (overlay) - opened by Header toggle */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 flex transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!mobileOpen}
      >
        {/* backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />

        {/* fixed width mobile drawer */}
        <aside className="relative z-50 bg-sidebar w-64 h-full p-3 border-r border-border flex flex-col justify-between">
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {links.map(link => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn('sidebar-link block', isActive ? 'active' : '', 'px-3 py-2 rounded')
                }
              >
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-border flex-none">
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center p-2 rounded-md hover:bg-sidebar-accent transition-colors"
            >
              Cerrar
            </button>
          </div>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          // enforce fixed widths and stick footer to bottom
          'hidden md:flex bg-sidebar border-r border-border flex-col justify-between h-screen transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
        style={{ flexShrink: 0 }}
      >
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                cn('sidebar-link group flex items-center gap-2', isActive ? 'active' : '')
              }
            >
              {!collapsed && <span className="animate-slide-in">{link.label}</span>}
              {collapsed && <span className="sr-only">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border flex-none">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <span>Expand</span> : <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;