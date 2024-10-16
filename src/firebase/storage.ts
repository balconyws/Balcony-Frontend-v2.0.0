import { v4 as uuid } from 'uuid';
import { getDownloadURL, ref as storageRef, uploadBytes, deleteObject } from 'firebase/storage';

import { firebase } from '@/config';

export const uploadFile = async (file: Blob | Uint8Array | ArrayBuffer) => {
  if (!file) {
    return null;
  }
  const imageRef = storageRef(firebase.storage, `files/${uuid()}`);
  try {
    const snapshot = await uploadBytes(imageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteFile = async (url: string) => {
  try {
    const ref = storageRef(firebase.storage, url);
    const deleted = await deleteObject(ref);
    return deleted;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
