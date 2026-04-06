import React, { useRef } from 'react';
import { Product } from '../types';
import { Download, FileImage, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  products: Product[];
  onBack: () => void;
}

export function CatalogScreen({ products, onBack }: Props) {
  const catalogRef = useRef<HTMLDivElement>(null);

  const exportPNG = async () => {
    if (!catalogRef.current) return;
    const canvas = await html2canvas(catalogRef.current, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = 'catalogo.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const exportPDF = async () => {
    if (!catalogRef.current) return;
    const canvas = await html2canvas(catalogRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('catalogo.pdf');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Voltar ao Editor
        </button>
        <div className="flex gap-4">
          <button 
            onClick={exportPNG}
            className="bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-500 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <FileImage className="w-5 h-5" /> Exportar PNG (1080x1080)
          </button>
          <button 
            onClick={exportPDF}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-colors"
          >
            <Download className="w-5 h-5" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Container designed for 1080x1080 export (1:1 aspect ratio) */}
      <div className="flex justify-center bg-gray-100 p-8 rounded-3xl overflow-hidden">
        <div 
          ref={catalogRef}
          className="bg-white w-full max-w-[1080px] aspect-square p-12 shadow-2xl overflow-hidden relative"
          style={{ width: '1080px', height: '1080px' }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Catálogo de Produtos</h1>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {products.slice(0, 9).map((product) => (
              <div key={product.id} className="flex flex-col">
                <div className="aspect-square bg-white border border-gray-100 rounded-2xl shadow-sm mb-4 p-4 flex items-center justify-center">
                  {product.imagem ? (
                    <img src={product.imagem} alt={product.nome} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">
                      Sem Imagem
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 leading-tight mb-1 line-clamp-2">{product.nome}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-1">{product.descricao}</p>
                <p className="text-2xl font-extrabold text-orange-500">{product.preco}</p>
              </div>
            ))}
          </div>
          
          {products.length > 9 && (
            <div className="absolute bottom-6 right-12 text-gray-400 font-medium">
              + {products.length - 9} produtos...
            </div>
          )}
        </div>
      </div>
      <p className="text-center text-gray-500 mt-4 text-sm">
        Nota: O formato quadrado exibe até 9 produtos de forma ideal.
      </p>
    </div>
  );
}
