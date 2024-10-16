import { getDocs, collection, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';

import { firebase } from '@/config';

export const getData = async (collectionName: string) =>
  await getDocs(collection(firebase.db, collectionName)).then(querySnapshot =>
    querySnapshot.docs.map(dc => ({ ...dc.data(), id: dc.id }))
  );

export const addItem = async (collectionName: string, data: any) =>
  await addDoc(collection(firebase.db, collectionName), data);

export const updateItem = async (collectionName: string, uid: string, data: any) => {
  const itemRef = doc(firebase.db, collectionName, uid);
  return await updateDoc(itemRef, data);
};

export const deleteItem = async (collectionName: string, uid: string) => {
  const itemRef = doc(firebase.db, collectionName, uid);
  return await deleteDoc(itemRef);
};
