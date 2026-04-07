import React, { useState, useEffect } from 'react';
import { Product, Category, StoreSettings } from '../types';
import { subscribeToProducts, subscribeToSettings } from '../store';
import { Search, ShoppingBag, MessageCircle, Filter } from 'lucide-react';

const CATEGORIES: Category[] = ['Móveis', 'Alimentação', 'Utilidades para o lar', 'Outros'];

export function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({ whatsappNumber: '' });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todas'>('Todas');

  useEffect(() => {
    const unsubProducts = subscribeToProducts(setProducts);
    const unsubSettings = subscribeToSettings(setSettings);
    return () => {
      unsubProducts();
      unsubSettings();
    };
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || p.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleWhatsAppClick = async (product: Product) => {
    const message = `Olá! Tenho interesse no produto: *${product.nome}*\nPreço: ${product.preco || 'Sob consulta'}\n\n${product.descricao}`;
    
    // Try to use the native Web Share API if the product has an image
    if (product.imagem && navigator.canShare) {
      try {
        // Convert base64 to blob
        const res = await fetch(product.imagem);
        const blob = await res.blob();
        const file = new File([blob], 'produto.jpg', { type: 'image/jpeg' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: product.nome,
            text: message,
            files: [file]
          });
          return; // Success!
        }
      } catch (error) {
        console.error('Erro ao compartilhar com imagem:', error);
        // Fallback to text only if sharing fails
      }
    }

    // Fallback to standard WhatsApp link (text only)
    const url = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2.5 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-gray-900">
                CLA <span className="text-orange-500">Catálogo</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">Produtos de qualidade</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar produtos..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all w-64 outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
          />
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Categories Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <Filter className="w-5 h-5 text-gray-400 shrink-0 mr-2" />
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`shrink-0 px-5 py-2 rounded-full font-medium text-sm transition-colors ${selectedCategory === 'Todas' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
          >
            Todas
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-5 py-2 rounded-full font-medium text-sm transition-colors ${selectedCategory === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                <div className="aspect-square bg-gray-50 p-6 flex items-center justify-center relative">
                  {product.imagem ? (
                    <img src={product.imagem} alt={product.nome} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-600 shadow-sm">
                    {product.categoria}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{product.nome}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.descricao}</p>
                  
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Preço</p>
                      <p className="text-xl font-extrabold text-orange-500">{product.preco || 'Sob consulta'}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleWhatsAppClick(product)}
                      className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl shadow-sm transition-colors flex items-center justify-center"
                      title="Comprar via WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Tente buscar com outros termos ou mude a categoria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
