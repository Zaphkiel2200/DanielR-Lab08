import { storage } from "../firebase/firebase-config";
import { ref, uploadBytes, getDownloadURL, listAll, getMetadata } from "firebase/storage";

export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const listFiles = async (path: string) => {
  const folderRef = ref(storage, path);
  const res = await listAll(folderRef);
  
  return Promise.all(
    res.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      const metadata = await getMetadata(itemRef);
      return {
        url,
        timestamp: metadata.timeCreated ? new Date(metadata.timeCreated).getTime() : Date.now()
      };
    })
  );
};

export const getFileUrl = async (path: string) => {
  const fileRef = ref(storage, path);
  return getDownloadURL(fileRef);
};