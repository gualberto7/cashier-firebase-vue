import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  function setUser(firebaseUser: FirebaseUser | null) {
    if (firebaseUser) {
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      }
    } else {
      user.value = null
    }
  }

  async function initializeAuth(): Promise<void> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser)
        isInitialized.value = true
        unsubscribe()
        resolve()
      })
    })
  }

  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      setUser(userCredential.user)
    } catch (e: any) {
      error.value = getErrorMessage(e.code)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function register(email: string, password: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      setUser(userCredential.user)
    } catch (e: any) {
      error.value = getErrorMessage(e.code)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGoogle(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      setUser(userCredential.user)
    } catch (e: any) {
      error.value = getErrorMessage(e.code)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      await signOut(auth)
      user.value = null
    } catch (e: any) {
      error.value = getErrorMessage(e.code)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este correo',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/popup-closed-by-user': 'Inicio de sesión cancelado'
    }
    return messages[code] || 'Ha ocurrido un error'
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    isInitialized,
    isLoading,
    error,
    isAuthenticated,
    initializeAuth,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError
  }
})
