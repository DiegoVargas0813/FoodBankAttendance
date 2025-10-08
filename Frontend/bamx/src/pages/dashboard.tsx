import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import components
import Sidebar from '../components/layout/sidebard';
import Header from '../components/layout/header';

const Dashboard = () => {
    // @ts-ignore
    const navigate = useNavigate();
    // @ts-ignore
    const [data, setData] = useState<string | null>(null);
    // @ts-ignore
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div>   
            <Header/>
            <Sidebar />
        </div>
    )
}

export default Dashboard;