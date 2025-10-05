import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Driver = () => {
    // @ts-ignore
    const navigate = useNavigate();
    // @ts-ignore
    const [data, setData] = useState<string | null>(null);
    // @ts-ignore
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div>   
            <h1>Driver</h1>
            <p>Welcome to the Driver Dashboard!</p>
        </div>
    )
}

export default Driver;