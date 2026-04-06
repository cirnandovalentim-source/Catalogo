export type Category = 'Móveis' | 'Alimentação' | 'Utilidades para o lar' | 'Outros';

export interface Product {
  id: string;
  nome: string;
  preco: string;
  descricao: string;
  imagem?: string;
  categoria: Category;
  imageBox?: number[];
}

export interface StoreSettings {
  whatsappNumber: string;
}

export interface ProcessingState {
  fileName: string;
  fileSize: number;
  totalPages: number;
  processedPages: number;
  products: Product[];
}
