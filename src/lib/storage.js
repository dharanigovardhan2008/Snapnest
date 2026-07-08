import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const storageService = {
  async uploadDesign(file, orderId) {
    const filename = `designs/${orderId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    return { url, path: filename };
  },

  async uploadProofOfPrint(file, orderId) {
    const filename = `proofs/${orderId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    return { url, path: filename };
  },

  async deleteFile(path) {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },
};

export default storageService;