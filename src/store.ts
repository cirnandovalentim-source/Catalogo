import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firebase';
import { Product, StoreSettings } from './types';

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  return onSnapshot(collection(db, 'products'), (snapshot) => {
    const products = snapshot.docs.map(doc => doc.data() as Product);
    callback(products);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'products');
  });
};

export const subscribeToSettings = (callback: (settings: StoreSettings) => void) => {
  return onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as StoreSettings);
    } else {
      callback({ whatsappNumber: '5511999999999' });
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'settings/global');
  });
};

export const saveProduct = async (product: Product) => {
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
  }
};

export const saveSettings = async (settings: StoreSettings) => {
  try {
    await setDoc(doc(db, 'settings', 'global'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/global');
  }
};

export const saveMultipleProducts = async (products: Product[]) => {
  try {
    const batch = writeBatch(db);
    products.forEach(product => {
      const docRef = doc(db, 'products', product.id);
      batch.set(docRef, product);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }
};
