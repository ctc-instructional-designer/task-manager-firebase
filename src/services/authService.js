import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";

// Registrar usuario con email y password
export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error al registrar:", error);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

// Iniciar sesión con email y password
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

// Iniciar sesión con Google
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return { success: false, error: error.message };
  }
};

// Escuchar cambios en el estado de autenticación
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Obtener usuario actual
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Mensajes de error amigables
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada.";
    case "auth/user-not-found":
      return "No existe una cuenta con este email.";
    case "auth/wrong-password":
      return "Contraseña incorrecta.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con este email.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/invalid-email":
      return "El formato del email no es válido.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Intenta más tarde.";
    case "auth/popup-closed-by-user":
      return "Ventana de autenticación cerrada por el usuario.";
    case "auth/cancelled-popup-request":
      return "Proceso de autenticación cancelado.";
    default:
      return "Error de autenticación. Intenta nuevamente.";
  }
};
