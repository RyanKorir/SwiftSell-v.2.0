import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  addDoc as firestoreAddDoc
} from 'firebase/firestore';
import { db, auth } from './firebase.ts';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firestoreApi = {
  // Products
  getProducts: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/products`;
    try {
      const q = query(collection(db, path), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  addProduct: async (data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/products`;
    try {
      const docRef = doc(collection(db, path));
      await setDoc(docRef, { ...data, ownerId: userId, createdAt: serverTimestamp() });
      return { id: docRef.id, ...data };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updateProduct: async (id: string, data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/products/${id}`;
    try {
      await updateDoc(doc(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Customers
  getCustomers: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/customers`;
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  addCustomer: async (data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/customers`;
    try {
      const docRef = doc(collection(db, path));
      await setDoc(docRef, { ...data, ownerId: userId, createdAt: serverTimestamp() });
      return { id: docRef.id, ...data };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updateCustomer: async (id: string, data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/customers/${id}`;
    try {
      await updateDoc(doc(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  deleteCustomer: async (id: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/customers/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Orders
  getOrders: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/orders`;
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  addOrder: async (orderData: any, items: any[]) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/orders`;
    try {
      const orderRef = doc(collection(db, path));
      await setDoc(orderRef, { ...orderData, ownerId: userId, createdAt: serverTimestamp() });
      
      for (const item of items) {
        const itemRef = doc(collection(db, `${path}/${orderRef.id}/items`));
        await setDoc(itemRef, { ...item, ownerId: userId, orderId: orderRef.id });
      }
      return { id: orderRef.id, ...orderData };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/orders/${id}`;
    try {
      await updateDoc(doc(db, path), { status, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateOrder: async (id: string, data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/orders/${id}`;
    try {
      await updateDoc(doc(db, path), { ...data, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  deleteOrder: async (id: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/orders/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  getOrderItems: async (orderId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/orders/${orderId}/items`;
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Expenses
  getExpenses: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/expenses`;
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  addExpense: async (data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/expenses`;
    try {
      const docRef = doc(collection(db, path));
      await setDoc(docRef, { ...data, ownerId: userId, date: serverTimestamp() });
      return { id: docRef.id, ...data };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updateExpense: async (id: string, data: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/expenses/${id}`;
    try {
      await updateDoc(doc(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  deleteExpense: async (id: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/expenses/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  deleteProduct: async (id: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}/products/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Stats
  updatePin: async (pin: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), { pin });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateXP: async (xp: number, level: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), { 
        xp, 
        level, 
        lastActiveDate: serverTimestamp() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
