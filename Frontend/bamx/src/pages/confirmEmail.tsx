import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ConfirmEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (!token) return;
    fetch(`${import.meta.env.VITE_API_URL}/confirm-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) setStatus("¡Correo confirmado exitosamente!");
        else setStatus(data.error || "Error al confirmar el correo.");
      })
      .catch(() => setStatus("Error al conectar con el servidor."));
  }, [token]);

  return <div>{status}</div>;
};

export default ConfirmEmail;