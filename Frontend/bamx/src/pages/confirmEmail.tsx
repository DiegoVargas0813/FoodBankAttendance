import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "../components/ui/card";
import { Button } from "../components/ui/button";

const ConfirmEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  // @ts-ignore
  const [message, setMessage] = useState<string>("Verificando...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación faltante.");
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      const maxAttempts = 15;
      const intervalMs = 1000;

      for (let attempt = 0; attempt < maxAttempts && mounted; attempt++) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/confirm-email?token=${encodeURIComponent(String(token))}`,
            { signal: controller.signal }
          );

          // try to parse JSON safely
          let data: any = null;
          try {
            data = await res.json();
          } catch (e) {
            data = null;
          }

          // Definite success
          if (res.status === 200 || res.status === 201 || (res.ok && (data?.success || data?.message))) {
            if (!mounted) return;
            setStatus("success");
            setMessage(data?.message || "¡Correo confirmado exitosamente! Ya puedes iniciar sesión.");
            return;
          }

          // Pending/processing -> retry after interval
          const isPending =
            res.status === 202 ||
            (data && String(data.status).toLowerCase() === "processing") ||
            (!res.ok && (res.status === 503 || res.status === 425)); // service unavailable / too early

          if (isPending) {
            await delay(intervalMs);
            continue;
          }

          // Definite failure
          const errMsg = data?.error || data?.message || `Error al confirmar (status ${res.status})`;
          if (!mounted) return;
          setStatus("error");
          setMessage(errMsg);
          return;
        } catch (err: any) {
          if (controller.signal.aborted) return;
          // Network error: retry a few times, then show error
          if (attempt < maxAttempts - 1) {
            await delay(intervalMs);
            continue;
          }
          if (!mounted) return;
          setStatus("error");
          setMessage("No se pudo conectar con el servidor. Intenta más tarde.");
          return;
        }
      }

      // if loop finishes without success or explicit failure
      if (mounted && status !== "success") {
        setStatus("error");
        setMessage("La confirmación está en proceso. Intenta de nuevo en unos segundos o contacta soporte.");
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [token]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-2xl">
              {status === "loading" ? "Verificando correo..." : status === "success" ? "Confirmación exitosa" : "Error al confirmar"}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6">
            {status === "success" && (
              <div className="mt-4 text-sm text-gray-600">
                Sugerencia: inicia sesión para continuar con tu solicitud.
              </div>
            )}
          </CardContent>

          <CardFooter className="px-6 py-5 flex gap-3">
            {status === "success" ? (
              <>
                <Button onClick={() => navigate("/")} className="bg-blue-600">Ir a Iniciar sesión</Button>
              </>
            ) : status === "error" ? (
              <>
                <Button onClick={() => navigate("/register")} className="bg-blue-600">Reintentar registro</Button>
                <Button onClick={() => navigate("/")} variant="ghost">Volver</Button>
              </>
            ) : (
              <Button onClick={() => { /* noop while loading */ }} disabled>Por favor espera...</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ConfirmEmail;