import React from 'react';
import Sidebar from './sidebard';
import Header from './header';
import Footer from './footer';

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <div className="flex min-h-screen ">
        <Sidebar />
        <main className="flex-1 container-main px-4 md:px-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;