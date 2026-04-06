import React, { useState, useEffect } from 'react';
import { UploadScreen } from './UploadScreen';
import { ProcessingScreen } from './ProcessingScreen';
import { EditorScreen } from './EditorScreen';
import { AdminProducts } from './AdminProducts';
import { AdminSettings } from './AdminSettings';
import { Product, ProcessingState } from '../types';
import { saveMultipleProducts } from '../store';
import { LayoutDashboard, FileUp, Settings, Package, ArrowLeft, LogOut } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../firebase';

type AdminTab = 'products' | 'upload' | 'settings';
type UploadStep = 'select' | 'processing' | 'editor';

interface Props {
  onExit: () => void;
}

export function Admin({ onExit }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  
  // Upload Flow State
  const [uploadStep, setUploadStep] = useState<UploadStep>('select');
  const [file, setFile] = useState<File | null>(null);
  const [initialState, setInitialState] = useState<ProcessingState | null>(null);
  const [extractedProducts, setExtractedProducts] = useState<Product[]>([]);
  
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleFileSelect = (selectedFile: File, state: ProcessingState | null, skipProcessing = false) => {
    setFile(selectedFile);
    setInitialState(state);
    if (skipProcessing && state) {
      setExtractedProducts(state.products);
      setUploadStep('editor');
    } else {
      setUploadStep('processing');
    }
  };

  const handleProcessingComplete = (products: Product[]) => {
    setExtractedProducts(products);
    setUploadStep('editor');
  };

  const handleSaveExtracted = async (products: Product[]) => {
    await saveMultipleProducts(products);
    setUploadStep('select');
    setActiveTab('products');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Administrativo</h2>
          <p className="text-gray-500 mb-8">Faça login com sua conta Google para gerenciar seu catálogo.</p>
          <button onClick={handleLogin} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors mb-4">
            Entrar com Google
          </button>
          <button onClick={onExit} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors">
            Voltar para a Vitrine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-orange-500" />
            Painel CLA
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('products'); setUploadStep('select'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'products' ? 'bg-orange-500 text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Package className="w-5 h-5" /> Produtos
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'upload' ? 'bg-orange-500 text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <FileUp className="w-5 h-5" /> Importar PDF
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-orange-500 text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" /> Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="px-4 py-2 text-sm text-gray-400 truncate text-center">
            {user.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
          <button 
            onClick={onExit}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Ver Vitrine
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'products' && <AdminProducts />}
        
        {activeTab === 'upload' && (
          <div className="p-6">
            {uploadStep === 'select' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Importar Catálogo PDF</h2>
                  <p className="text-gray-500">Envie um PDF para extrair produtos automaticamente.</p>
                </div>
                <UploadScreen onFileSelect={handleFileSelect} />
              </div>
            )}
            {uploadStep === 'processing' && file && (
              <ProcessingScreen 
                file={file} 
                initialState={initialState} 
                onComplete={handleProcessingComplete} 
              />
            )}
            {uploadStep === 'editor' && (
              <EditorScreen 
                products={extractedProducts} 
                setProducts={setExtractedProducts} 
                onNext={() => handleSaveExtracted(extractedProducts)} 
              />
            )}
          </div>
        )}

        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
}
