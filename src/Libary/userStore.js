import { create } from 'zustand';
import { db } from './Firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });
  
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const userData = { uid, ...docSnap.data() }; // Include uid along with other user data
        set({ currentUser: userData, isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
      set({ currentUser: null, isLoading: false });
    }
  },  
  updateUser: async (uid, newData) => {
    try {
      if (!uid) {
        console.error("UID is missing.");
        return;
      }
      const docRef = doc(db, "users", uid.toString());
  
      await updateDoc(docRef, newData);
      set((state) => ({
        currentUser: { ...state.currentUser, ...newData },
      }));
    } catch (err) {
      console.error("Error updating user data:", err);
    }
  }
}));
