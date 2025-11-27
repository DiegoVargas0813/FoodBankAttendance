import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-main max-w-7xl mx-auto py-6 px-4 md:px-8">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="text-sm md:text-base">
            Hacienda de la Calerilla 360, Santa Maria Tequepexpan, Tlaquepaque, Jalisco.
          </div>

          <div className="text-sm md:text-base">
            <span className="font-medium">GDL :</span> <span>33 3810 6595</span>
          </div>

          <div className="text-sm md:text-base">
            <span className="font-medium">Correo :</span>{' '}
            <a
              href="mailto:comunicacionbamx@bdalimentos.org"
              className="underline text-primary-foreground hover:opacity-90"
            >
              comunicacionbamx@bdalimentos.org
            </a>
          </div>

          <div className="text-xs text-primary-foreground/80 mt-1">
            © {new Date().getFullYear()} Banco de Alimentos — Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;