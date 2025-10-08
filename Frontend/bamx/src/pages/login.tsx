import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
 } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Import context
import { useAuth } from '../context/AuthContext';

const Login = () => {
    //Constants to handle login
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {setUser} = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/signup/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if(!response.ok){
                const errorText = await response.text();
                throw new Error(errorText || 'Error en la solicitud');

            }
            
            const data = await response.json();

            if(data && data.jwt && data.user){
                localStorage.setItem('token', data.jwt);
                localStorage.setItem('user', JSON.stringify({
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role,
                    id: data.user.id
                }));

                setUser({
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role,
                    id: data.user.id
                })

                
                //TODO: Añadir aqui variantes de redireccion segun el rol del usuario
                switch(data.user.role){
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'user':
                        navigate('/dashboard');
                        break;
                    case 'DRIVER':
                        navigate('/driver');
                        break;
                    case 'family':
                        navigate('/family');
                        break;
                    default:
                        navigate('/dashboard');
                }

            }else{
                throw new Error('Respuesta inválida del servidor');
            }
        }catch(error:any){
            console.error(error);
        }finally{
            setIsLoading(false);
        }
    }

    //Return
    return (
        <div>
            <Card className="w-full shadow-lg w-96 m-auto mt-20">
                <CardHeader className="space-y-1">
                    <CardTitle className="border p-4 text-primary">Login</CardTitle>
                    <CardDescription>Introduzca sus credenciales de acceso</CardDescription>
                </CardHeader>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <CardContent className="space-y-4">
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

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p>Contraseña</p>
                                </div>
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
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
                        </Button>
                        <Button
                            variant="link"
                            className="w-full"
                            onClick={() => navigate('/register')}
                        >
                            ¿No tienes una cuenta? Regístrate
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default Login;