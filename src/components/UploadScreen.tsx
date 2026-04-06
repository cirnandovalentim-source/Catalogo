import React from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { ProcessingState } from '../types';

interface Props {
  onFileSelect: (file: File, savedState: ProcessingState | null, skipProcessing?: boolean) => void;
}

export function UploadScreen({ onFileSelect }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const savedStateStr = localStorage.getItem(`catalog_${file.name}_${file.size}`);
    if (savedStateStr) {
      const state: ProcessingState = JSON.parse(savedStateStr);
      if (state.processedPages < state.totalPages) {
        if (window.confirm(`Encontramos um processamento incompleto para este arquivo (${state.processedPages}/${state.totalPages} páginas). Deseja continuar de onde parou?`)) {
          onFileSelect(file, state);
          return;
        } else {
          localStorage.removeItem(`catalog_${file.name}_${file.size}`);
        }
      } else {
         if (window.confirm(`Este arquivo já foi totalmente processado. Deseja ir direto para o editor?`)) {
           onFileSelect(file, state, true);
           return;
         } else {
           localStorage.removeItem(`catalog_${file.name}_${file.size}`);
         }
      }
    }
    onFileSelect(file, null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-10 text-center hover:border-orange-500 transition-colors group">
        <div className="bg-orange-50 group-hover:bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
          <UploadCloud className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Importar PDF Inteligente</h2>
        <p className="text-gray-500 mb-8 text-lg">
          Envie seu catálogo ou tabela de preços em PDF. Nossa IA extrairá os produtos automaticamente.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Sem limite de tamanho (10MB+)
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Processamento seguro no navegador
          </div>
        </div>
        
        <label className="relative cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-2xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-3 text-lg">
          <FileText className="w-6 h-6" />
          <span>Selecionar Arquivo PDF</span>
          <input 
            type="file" 
            className="hidden" 
            accept="application/pdf" 
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
}
