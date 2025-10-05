import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// @ts-ignore
import { 
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
 } from '../components/ui/card';
 // @ts-ignore
import { Button } from '../components/ui/button';
// @ts-ignore
import { Input } from '../components/ui/input';

const Register = () => {
    //Constants to handle registration
    // @ts-ignore
    const navigate = useNavigate();
    // @ts-ignore
    const [username, setUsername] = useState('');
    // @ts-ignore
    const [email, setEmail] = useState('');
    // @ts-ignore
    const [password, setPassword] = useState('');
    // @ts-ignore
    const [confirmPassword, setConfirmPassword] = useState('');
    // @ts-ignore
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try{
            if(!checkConfirmPassword()) return;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/signup/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, role: 'FAMILY' }),
            });


            if(!response.ok){
                const errorText = await response.text();
                throw new Error(errorText || 'Error en la solicitud');
            }

            
        }catch (error) {
            console.error('Error:', error);
        }finally {
            setIsLoading(false);
        }
    }

    const checkConfirmPassword = () => {
        if(password !== confirmPassword){
            alert("Las contraseñas no coinciden");
            return false;
        }
        return true;
    }

    return (
        <div>
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Registrate</CardTitle>
                    <CardDescription className="text-center">Crea tu cuenta</CardDescription>
                    <CardContent>
                        <div className="space-y-2"> 
                            <p>Correo Electronico</p>
                            <div className="relative">
                                 <Input
                                    id="email"
                                    type="email"
                                    placeholder="Ingrese su correo electrónico"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>    
                        </div>
                        <div className="space-y-2">
                            <p>Nombre Completo</p>
                            <div className="relative">
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Ingrese su nombre completo"
                                    className="pl-10"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p>Contraseña</p>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Ingrese su contraseña"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p>Confirmar Contraseña</p>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirme su contraseña"
                                    className="pl-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full"
                            onClick={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </CardFooter>
                </CardHeader>
            </Card>
        </div>
    )
}

export default Register;