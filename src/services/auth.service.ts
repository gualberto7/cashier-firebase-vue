import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import type { UserProfile } from '@/types'

export const authService = {
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
  },

  async register(email: string, password: string, displayName?: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    if (displayName) {
      await updateProfile(userCredential.user, { displayName })
    }

    // Create default user profile
    await this.createUserProfile(userCredential.user.uid)

    return userCredential
  },

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)

    // Create profile if it doesn't exist
    const profileExists = await this.getUserProfile(userCredential.user.uid)
    if (!profileExists) {
      await this.createUserProfile(userCredential.user.uid)
    }

    return userCredential
  },

  async logout() {
    return signOut(auth)
  },

  async createUserProfile(userId: string, profile?: Partial<UserProfile>) {
    const defaultProfile: UserProfile = {
      currency: 'USD',
      locale: 'es-ES',
      ...profile
    }

    await setDoc(doc(db, 'users', userId, 'profile', 'settings'), defaultProfile)
    return defaultProfile
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', userId, 'profile', 'settings')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile
    }
    return null
  },

  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    const docRef = doc(db, 'users', userId, 'profile', 'settings')
    await setDoc(docRef, profile, { merge: true })
  },

  getCurrentUser(): User | null {
    return auth.currentUser
  }
}
