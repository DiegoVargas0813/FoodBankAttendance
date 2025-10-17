import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import components
import Sidebar from '../components/layout/sidebard';
import Header from '../components/layout/header';

//TODO: Put on hold to focus on user status of "Pending, Approved, Rejected"
const DashboardItems = {
    ADMIN: [
        {name: 'Pending Approvals', link: '/pending-approvals'},
        {name: 'User Management', link: '/user-management'},
        {name: 'System Settings', link: '/system-settings'},
    ],
    USER: [
        {name: 'My Profile', link: '/my-profile'},
        {name: 'My Tasks', link: '/my-tasks'},
        {name: 'Support', link: '/support'},
        {name: 'Beneficiary Form', link: '/form'},
    ],
}

const Dashboard = () => {
    // @ts-ignore
    const navigate = useNavigate();
    // @ts-ignore
    const [data, setData] = useState<string | null>(null);
    // @ts-ignore
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="flex min-h-screen">   
            <Sidebar/>
            <div className="flex-1 flex flex-col">
                <Header/>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {DashboardItems.USER.map(item => (
                        <div
                            key={item.link}
                            className="bg-white shadow rounded-lg p-6 cursor-pointer hover:bg-blue-100 transition"
                            onClick={() => navigate(item.link)}
                        >
                            <span className="text-lg font-semibold">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard;