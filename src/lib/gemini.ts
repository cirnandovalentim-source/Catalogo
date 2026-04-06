import { GoogleGenAI, Type } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { Product, Category } from '../types';

declare const process: { env: { GEMINI_API_KEY: string } };

export async function extractProductsFromImage(base64Image: string): Promise<(Product & { imageBox?: number[] })[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1]
            }
          },
          {
            text: "Você é um assistente especializado em extração de dados de catálogos. Analise a imagem desta página de catálogo/lista de preços e extraia todos os produtos encontrados. Retorne APENAS um array JSON válido, onde cada objeto tem a seguinte estrutura: {\"nome\": \"Nome do produto\", \"preco\": \"Preço do produto\", \"descricao\": \"Descrição do produto\", \"categoria\": \"Móveis\" | \"Alimentação\" | \"Utilidades para o lar\" | \"Outros\", \"imageBox\": [ymin, xmin, ymax, xmax]}. A propriedade imageBox deve conter as coordenadas da caixa delimitadora da imagem do produto na página, onde os valores são inteiros de 0 a 1000 proporcionais ao tamanho da página. Se o produto não tiver imagem, retorne um array vazio []. Classifique o produto na categoria mais adequada. Não inclua markdown como ```json, apenas o array puro."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nome: { type: Type.STRING },
              preco: { type: Type.STRING },
              descricao: { type: Type.STRING },
              categoria: { type: Type.STRING },
              imageBox: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER }
              }
            },
            required: ["nome", "preco", "categoria"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    return parsed.map((p: any) => {
      const validCategories = ['Móveis', 'Alimentação', 'Utilidades para o lar', 'Outros'];
      const categoria = validCategories.includes(p.categoria) ? p.categoria : 'Outros';
      
      return {
        id: uuidv4(),
        nome: p.nome || '',
        preco: p.preco || '',
        descricao: p.descricao || '',
        categoria: categoria as Category,
        imageBox: p.imageBox
      };
    });
  } catch (e) {
    console.error("Gemini error", e);
    return [];
  }
}
