import React from 'react';
import { Product, Category } from '../types';
import { Trash2, Image as ImageIcon, ArrowRight, CheckCircle } from 'lucide-react';

const CATEGORIES: Category[] = ['Móveis', 'Alimentação', 'Utilidades para o lar', 'Outros'];

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onNext: () => void;
}

export function EditorScreen({ products, setProducts, onNext }: Props) {
  const handleRemove = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleChange = (id: string, field: keyof Product, value: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          handleChange(id, 'imagem', compressedBase64);
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revisão de Produtos Extraídos</h2>
          <p className="text-gray-500 mt-1">Revise os dados, adicione imagens e salve no catálogo.</p>
        </div>
        <button 
          onClick={onNext}
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-colors"
        >
          <CheckCircle className="w-5 h-5" /> Salvar no Catálogo
        </button>
      </div>

      <div className="grid gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-full sm:w-32 h-32 shrink-0 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group">
              {product.imagem ? (
                <img src={product.imagem} alt="Preview" className="w-full h-full object-contain bg-white" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              )}
              <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-sm font-medium">
                Alterar
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(product.id, e)} />
              </label>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome do Produto</label>
                <input 
                  type="text" 
                  value={product.nome} 
                  onChange={(e) => handleChange(product.id, 'nome', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Preço</label>
                <input 
                  type="text" 
                  value={product.preco} 
                  onChange={(e) => handleChange(product.id, 'preco', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Categoria</label>
                <select 
                  value={product.categoria} 
                  onChange={(e) => handleChange(product.id, 'categoria', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descrição</label>
                <textarea 
                  value={product.descricao} 
                  onChange={(e) => handleChange(product.id, 'descricao', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                />
              </div>
            </div>

            <button 
              onClick={() => handleRemove(product.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:self-center"
              title="Remover produto"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-500">
            Nenhum produto encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
