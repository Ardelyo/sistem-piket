import React, { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuth } from '../../contexts/AuthContext';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 sm:pt-8 pb-24">
        {children}
      </main>
      {user?.role === 'Siswa' && <BottomNav />}
    </div>
  );
};

export default Layout;