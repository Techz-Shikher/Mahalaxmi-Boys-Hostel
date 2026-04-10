// lib/firestore.ts
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions
export interface Complaint {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  createdAt: any;
  [key: string]: any;
}

export interface Meal {
  id: string;
  date: string;
  type: string;
  menu: string;
  createdAt: any;
  [key: string]: any;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  occupants?: string[];
  [key: string]: any;
}

export interface TransportBooking {
  id: string;
  userId: string;
  destination: string;
  date: string;
  status: string;
  createdAt: any;
  [key: string]: any;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName?: string;
  title: string;
  content: string;
  createdAt: any;
  [key: string]: any;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: any;
  [key: string]: any;
}

export interface StudentStatus {
  id: string;
  userId: string;
  userName?: string;
  status: 'inHostel' | 'atHome';
  timestamp: any;
  [key: string]: any;
}

export interface User {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  roomId?: string;
  [key: string]: any;
}

// User related functions
export async function createUser(userId: string, userData: any) {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUser(userId: string) {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function updateUser(userId: string, data: any) {
  try {
    await updateDoc(doc(db, 'users', userId), data);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getStudentByEmail(email: string): Promise<User | null> {
  try {
    // First try exact lowercase match
    const lowerEmail = email.toLowerCase();
    const q1 = query(collection(db, 'users'), where('email', '==', lowerEmail));
    let querySnapshot = await getDocs(q1);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        uid: doc.id,
        ...doc.data()
      } as User;
    }

    // If not found, get all users and filter with case-insensitive match
    const allUsersQuery = query(collection(db, 'users'));
    querySnapshot = await getDocs(allUsersQuery);
    
    for (const doc of querySnapshot.docs) {
      const userData = doc.data();
      if (userData.email && userData.email.toLowerCase() === lowerEmail) {
        return {
          uid: doc.id,
          ...userData
        } as User;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting student by email:', error);
    throw error;
  }
}

// Room related functions
export async function createRoom(roomData: any) {
  try {
    const docRef = await addDoc(collection(db, 'rooms'), {
      ...roomData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

export async function getRooms(): Promise<Room[]> {
  try {
    const q = query(collection(db, 'rooms'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Room));
  } catch (error) {
    console.error('Error getting rooms:', error);
    throw error;
  }
}

export async function getRoom(roomId: string): Promise<Room | null> {
  try {
    const docSnap = await getDoc(doc(db, 'rooms', roomId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Room : null;
  } catch (error) {
    console.error('Error getting room:', error);
    throw error;
  }
}

export async function updateRoom(roomId: string, data: any) {
  try {
    await updateDoc(doc(db, 'rooms', roomId), data);
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
}

export async function deleteRoom(roomId: string) {
  try {
    await deleteDoc(doc(db, 'rooms', roomId));
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
}

// Complaint related functions
export async function createComplaint(complaintData: any) {
  try {
    const docRef = await addDoc(collection(db, 'complaints'), {
      ...complaintData,
      createdAt: Timestamp.now(),
      status: 'Pending',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating complaint:', error);
    throw error;
  }
}

export async function getComplaints(userId?: string): Promise<Complaint[]> {
  try {
    let q;
    if (userId) {
      // For user view - get their complaints (handles both studentId and userId fields)
      q = query(collection(db, 'complaints'), where('studentId', '==', userId));
    } else {
      // For admin view - get all complaints
      q = query(collection(db, 'complaints'));
    }
    const querySnapshot = await getDocs(q);
    let complaints = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Complaint));

    // If userId is provided and no results, try userId field for backward compatibility
    if (userId && complaints.length === 0) {
      console.warn('No complaints with studentId, trying userId field...');
      const q2 = query(collection(db, 'complaints'), where('userId', '==', userId));
      const querySnapshot2 = await getDocs(q2);
      complaints = querySnapshot2.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Complaint));
    }

    return complaints;
  } catch (error) {
    console.error('Error getting complaints:', error);
    throw error;
  }
}

export async function updateComplaint(complaintId: string, data: any) {
  try {
    await updateDoc(doc(db, 'complaints', complaintId), data);
  } catch (error) {
    console.error('Error updating complaint:', error);
    throw error;
  }
}

export async function deleteComplaint(complaintId: string) {
  try {
    await deleteDoc(doc(db, 'complaints', complaintId));
  } catch (error) {
    console.error('Error deleting complaint:', error);
    throw error;
  }
}

// Announcement related functions
export async function createAnnouncement(announcementData: any) {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...announcementData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
}

// Meal related functions
export async function createMeal(mealData: any) {
  try {
    const docRef = await addDoc(collection(db, 'meals'), {
      ...mealData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating meal:', error);
    throw error;
  }
}

export async function getMeals(date?: string): Promise<Meal[]> {
  try {
    let q;
    if (date) {
      q = query(collection(db, 'meals'), where('date', '==', date));
    } else {
      q = query(collection(db, 'meals'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Meal));
  } catch (error) {
    console.error('Error getting meals:', error);
    throw error;
  }
}

export async function updateMeal(mealId: string, data: any) {
  try {
    await updateDoc(doc(db, 'meals', mealId), data);
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
}

export async function deleteMeal(mealId: string) {
  try {
    await deleteDoc(doc(db, 'meals', mealId));
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
}

// Food Booking related functions
export async function getFoodBookings(): Promise<any[]> {
  try {
    const q = query(collection(db, 'foodBookings'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'foodBooking',
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting food bookings:', error);
    throw error;
  }
}

export async function getInstituteBookings(): Promise<any[]> {
  try {
    const q = query(collection(db, 'instituteBookings'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'instituteBooking',
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting institute bookings:', error);
    throw error;
  }
}

// Transport Booking related functions
export async function createTransportBooking(bookingData: any) {
  try {
    const docRef = await addDoc(collection(db, 'transportBookings'), {
      ...bookingData,
      createdAt: Timestamp.now(),
      status: 'Pending',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating transport booking:', error);
    throw error;
  }
}

export async function getTransportBookings(userId?: string): Promise<TransportBooking[]> {
  try {
    let q;
    if (userId) {
      q = query(collection(db, 'transportBookings'), where('userId', '==', userId));
    } else {
      q = query(collection(db, 'transportBookings'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as TransportBooking));
  } catch (error) {
    console.error('Error getting transport bookings:', error);
    throw error;
  }
}

export async function updateTransportBooking(bookingId: string, data: any) {
  try {
    await updateDoc(doc(db, 'transportBookings', bookingId), data);
  } catch (error) {
    console.error('Error updating transport booking:', error);
    throw error;
  }
}

export async function deleteTransportBooking(bookingId: string) {
  try {
    await deleteDoc(doc(db, 'transportBookings', bookingId));
  } catch (error) {
    console.error('Error deleting transport booking:', error);
    throw error;
  }
}

// Community Post related functions
export async function createCommunityPost(postData: any) {
  try {
    const docRef = await addDoc(collection(db, 'communityPosts'), {
      ...postData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating community post:', error);
    throw error;
  }
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const q = query(collection(db, 'communityPosts'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as CommunityPost));
  } catch (error) {
    console.error('Error getting community posts:', error);
    throw error;
  }
}

export async function updateCommunityPost(postId: string, data: any) {
  try {
    await updateDoc(doc(db, 'communityPosts', postId), data);
  } catch (error) {
    console.error('Error updating community post:', error);
    throw error;
  }
}

export async function deleteCommunityPost(postId: string) {
  try {
    await deleteDoc(doc(db, 'communityPosts', postId));
  } catch (error) {
    console.error('Error deleting community post:', error);
    throw error;
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const q = query(collection(db, 'announcements'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Announcement));
  } catch (error) {
    console.error('Error getting announcements:', error);
    throw error;
  }
}

export async function updateAnnouncement(announcementId: string, data: any) {
  try {
    await updateDoc(doc(db, 'announcements', announcementId), data);
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
}

export async function deleteAnnouncement(announcementId: string) {
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
}

// Student Status related functions
export async function setStudentStatus(userId: string, userName: string, status: 'inHostel' | 'atHome') {
  try {
    await setDoc(doc(db, 'studentStatus', userId), {
      userId,
      userName,
      status,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error setting student status:', error);
    throw error;
  }
}

export async function getStudentStatus(userId: string): Promise<StudentStatus | null> {
  try {
    const docSnap = await getDoc(doc(db, 'studentStatus', userId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as StudentStatus : null;
  } catch (error) {
    console.error('Error getting student status:', error);
    throw error;
  }
}

export async function getAllStudentStatuses(): Promise<StudentStatus[]> {
  try {
    const q = query(collection(db, 'studentStatus'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as StudentStatus));
  } catch (error) {
    console.error('Error getting all student statuses:', error);
    throw error;
  }
}

export function subscribeToStudentStatus(userId: string, callback: (status: StudentStatus | null) => void) {
  try {
    const docRef = doc(db, 'studentStatus', userId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as StudentStatus);
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error subscribing to student status:', error);
    throw error;
  }
}

export function subscribeToAllStatuses(callback: (statuses: StudentStatus[]) => void) {
  try {
    const q = query(collection(db, 'studentStatus'));
    return onSnapshot(q, (querySnapshot) => {
      const statuses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as StudentStatus));
      callback(statuses);
    });
  } catch (error) {
    console.error('Error subscribing to all statuses:', error);
    throw error;
  }
}
