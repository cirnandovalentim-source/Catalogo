import React, { useState, useEffect } from 'react';
import { Storefront } from './components/Storefront';
import { Admin } from './components/Admin';
import { testConnection } from './firebase';

export default function App() {
  const [view, setView] = useState<'storefront' | 'admin'>('storefront');

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <>
      {view === 'storefront' ? (
        <>
          <Storefront />
          <button 
            onClick={() => setView('admin')}
            className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-black transition-colors z-50"
          >
            Acessar Painel
          </button>
        </>
      ) : (
        <Admin onExit={() => setView('storefront')} />
      )}
    </>
  );
}
