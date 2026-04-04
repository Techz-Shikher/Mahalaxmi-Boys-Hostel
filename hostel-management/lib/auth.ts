// lib/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';
import { createUser, getUser } from './firestore';

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  role: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create user document in Firestore
    await createUser(uid, {
      uid,
      email,
      name,
      role,
      roomId: null,
    });

    return uid;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

export function getCurrentUser(
  setUser: Function,
  setLoading: Function
) {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (firebaseUser) {
        const userData = await getUser(firebaseUser.uid);
        if (userData && userData.role) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            ...userData,
          });
        } else {
          console.error('No user data found or role missing for:', firebaseUser.uid);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  });

  return unsubscribe;
}
