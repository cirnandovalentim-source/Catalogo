import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { subscribeToProducts, saveProduct, deleteProduct } from '../store';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES: Category[] = ['Móveis', 'Alimentação', 'Utilidades para o lar', 'Outros'];

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    const newProduct: Product = { id: uuidv4(), nome: 'Novo Produto', preco: '', descricao: '', categoria: 'Outros' };
    setEditingProduct(newProduct);
    setEditingId(newProduct.id);
  };

  const handleRemove = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este produto?')) {
      await deleteProduct(id);
    }
  };

  const handleChange = (field: keyof Product, value: string) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleChange('imagem', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    if (editingProduct) {
      await saveProduct(editingProduct);
      setEditingId(null);
      setEditingProduct(null);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setEditingId(product.id);
  };

  const filteredProducts = products.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));
  
  const isEditingNew = editingId && !products.find(p => p.id === editingId);
  const displayProducts = isEditingNew && editingProduct ? [editingProduct, ...filteredProducts] : filteredProducts;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h2>
          <p className="text-gray-500">Cadastre ou edite os produtos da sua vitrine.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {filteredProducts.length} produtos
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {displayProducts.map(product => {
            const isEditing = editingId === product.id;
            const currentProduct = isEditing && editingProduct ? editingProduct : product;
            
            return (
            <div key={currentProduct.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                  <div className="sm:col-span-3">
                    <div className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group">
                      {currentProduct.imagem ? (
                        <img src={currentProduct.imagem} alt="Preview" className="w-full h-full object-contain bg-white" />
                      ) : (
                        <span className="text-sm text-gray-400 font-medium">Sem imagem</span>
                      )}
                      <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-sm font-medium">
                        Alterar
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="sm:col-span-9 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome</label>
                        <input type="text" value={currentProduct.nome} onChange={(e) => handleChange('nome', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Preço</label>
                        <input type="text" value={currentProduct.preco} onChange={(e) => handleChange('preco', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Categoria</label>
                        <select value={currentProduct.categoria} onChange={(e) => handleChange('categoria', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descrição</label>
                      <textarea value={currentProduct.descricao} onChange={(e) => handleChange('descricao', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
                    </div>
                    <div className="flex justify-end pt-2 gap-2">
                       <button onClick={() => { setEditingId(null); setEditingProduct(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">Cancelar</button>
                      <button onClick={handleSaveEdit} className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors">Salvar Alterações</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 p-1">
                    {currentProduct.imagem ? <img src={currentProduct.imagem} className="w-full h-full object-contain" /> : <span className="text-xs text-gray-300">N/A</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 truncate">{currentProduct.nome}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-medium text-orange-500">{currentProduct.preco || 'Sem preço'}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{currentProduct.categoria}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEditing(currentProduct)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => handleRemove(currentProduct.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              )}
            </div>
          )})}
          {displayProducts.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
