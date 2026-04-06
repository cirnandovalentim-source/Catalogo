import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { Product, ProcessingState } from '../types';
import { extractProductsFromImage } from '../lib/gemini';
import { Loader2, Pause, Play } from 'lucide-react';

// Setup PDF.js worker using local file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface Props {
  file: File;
  initialState: ProcessingState | null;
  onComplete: (products: Product[]) => void;
}

export function ProcessingScreen({ file, initialState, onComplete }: Props) {
  const [progress, setProgress] = useState(initialState?.processedPages || 0);
  const [total, setTotal] = useState(initialState?.totalPages || 0);
  const [status, setStatus] = useState('Iniciando...');
  const [isPaused, setIsPaused] = useState(false);
  
  const productsRef = useRef<Product[]>(initialState?.products || []);
  const isProcessing = useRef(false);
  const pauseRef = useRef(false);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    processPdf();
  }, []);

  const processPdf = async () => {
    try {
      setStatus('Lendo arquivo PDF...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotal(numPages);

      let startPage = (initialState?.processedPages || 0) + 1;

      for (let i = startPage; i <= numPages; i++) {
        while (pauseRef.current) {
          await new Promise(r => setTimeout(r, 500));
        }

        setStatus(`Processando página ${i} de ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not get canvas context");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport } as any).promise;
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);

        setStatus(`Analisando página ${i} com IA...`);
        const newProducts = await extractProductsFromImage(base64Image);
        
        for (const product of newProducts) {
          if (product.imageBox && product.imageBox.length === 4) {
            const [ymin, xmin, ymax, xmax] = product.imageBox;
            const x = (xmin / 1000) * canvas.width;
            const y = (ymin / 1000) * canvas.height;
            const width = ((xmax - xmin) / 1000) * canvas.width;
            const height = ((ymax - ymin) / 1000) * canvas.height;

            if (width > 0 && height > 0) {
              const cropCanvas = document.createElement('canvas');
              cropCanvas.width = width;
              cropCanvas.height = height;
              const cropCtx = cropCanvas.getContext('2d');
              if (cropCtx) {
                cropCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
                product.imagem = cropCanvas.toDataURL('image/jpeg', 0.8);
              }
            }
          }
          delete product.imageBox;
        }
        
        productsRef.current = [...productsRef.current, ...newProducts];
        setProgress(i);

        const state: ProcessingState = {
          fileName: file.name,
          fileSize: file.size,
          totalPages: numPages,
          processedPages: i,
          products: productsRef.current
        };
        localStorage.setItem(`catalog_${file.name}_${file.size}`, JSON.stringify(state));
      }

      setStatus('Concluído!');
      onComplete(productsRef.current);
    } catch (error) {
      console.error(error);
      setStatus('Erro ao processar PDF. Tente novamente.');
    } finally {
      isProcessing.current = false;
    }
  };

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Processando PDF</h2>
        <p className="text-gray-600 mb-8">{status}</p>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
          <div 
            className="bg-orange-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-sm font-medium text-gray-500 mb-8">
          {progress} de {total} páginas ({percentage}%)
        </p>

        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center justify-center gap-2 mx-auto px-6 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isPaused ? 'Continuar' : 'Pausar'}
        </button>
      </div>
    </div>
  );
}
