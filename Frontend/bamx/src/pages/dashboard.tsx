import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div>   
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard!</p>
        </div>
    )
}

export default Dashboard;