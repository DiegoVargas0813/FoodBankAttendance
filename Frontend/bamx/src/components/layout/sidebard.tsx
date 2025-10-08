import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const roleLinks = {
    admin: [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/admin', label: 'Admin Panel' },
        { to: '/', label: 'If you see this, you are an admin' },
        // ...other admin links
    ],
    driver: [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/driver', label: 'Driver Panel' },
        // ...other driver links
    ],
    family: [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/', label: 'If you see this, you are a user' },
        // ...other user links
    ],
    // Add more roles as needed
};

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false); // State to manage sidebar collapse
    const { user} = useAuth(); // Get user from AuthContext

    // Determine links based on user role
    const links = user ? roleLinks[user.role.toLowerCase() as keyof typeof roleLinks] || [] : [];

    // Function to toggle sidebar collapse
    const toggleSidebar = () => {
        console.log(user);
        setCollapsed(!collapsed);
    }

    return (
        <aside
            className={cn(
                "bg-sidebar h-screen transition-all duration-300 border-r border-border flex flex-col",
                collapsed ? "w-[70px]" : "w-[240px]"
            )}>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {links.map(link => (
                    <NavLink
                        key={link.label}
                            to={link.to}
                            className={({ isActive}) => cn(
                                "sidebar-link",
                                isActive ? "active": "",
                                "group"
                            )}
                    >
                        {!collapsed && (
                           <span className="animate-slide-in">{link.label}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={toggleSidebar}
                    className="w-full flex items-center justify-center p-2 rounded-md hover:bg-sidebar-accent transition-colors"
                >
                    {collapsed ? (
                        <span className="animate-slide-in">Expand</span>
                    ) : (
                        <span className="animate-slide-in">Collapse</span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;