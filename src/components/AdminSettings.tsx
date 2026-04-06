import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { subscribeToSettings, saveSettings } from '../store';
import { Save, Phone } from 'lucide-react';

export function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings>({ whatsappNumber: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSettings(setSettings);
    return () => unsub();
  }, []);

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Configurações da Loja</h2>
        <p className="text-gray-500">Ajuste os dados de contato da sua vitrine.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Phone className="w-4 h-4 text-green-500" />
              Número do WhatsApp
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Este número receberá as mensagens quando o cliente clicar em comprar. Inclua o código do país (ex: 5511999999999).
            </p>
            <input 
              type="text" 
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="5511999999999"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-medium text-gray-900"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className={`text-sm font-medium text-green-600 transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>
              Configurações salvas com sucesso!
            </span>
            <button 
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-5 h-5" /> Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
