## 🔍 Sesión 75: Integración avanzada con Google OAuth

### 🎯 Objetivos de la sesión
- Configurar Google OAuth correctamente en Firebase
- Implementar login social avanzado con múltiples proveedores
- Manejar diferentes estados de autenticación social
- Crear experiencia de usuario fluida para login social
- Gestionar perfiles de usuario de diferentes proveedores

### 📋 Contenidos clave
✅ **Google OAuth setup** - Configuración completa de Google Sign-In
✅ **Múltiples proveedores** - Preparar para Facebook, Twitter, etc
✅ **Manejo de perfiles** - Datos de usuario de diferentes fuentes
✅ **UX optimizada** - Experiencia fluida en login social

---

### 🏗️ Implementación paso a paso

#### Paso 1: Configurar Google OAuth en Firebase Console
> **Acción:** Configuración completa en Firebase Console

```bash
# 🔥 CONFIGURACIÓN AVANZADA EN FIREBASE CONSOLE

# 1️⃣ Ir a Firebase Console > Authentication > Sign-in method
# 2️⃣ Click en "Google" para configuración avanzada

# ✅ CONFIGURAR GOOGLE SIGN-IN:
# - Enable: ✓ Activado
# - Project support email: tu-email@gmail.com
# - Project public-facing name: "Task Manager - Gestión de Tareas"

# 🔧 CONFIGURAR GOOGLE CLOUD CONSOLE:
# 3️⃣ Click en "Web SDK configuration"
# 4️⃣ Ir a Google Cloud Console
# 5️⃣ APIs & Services > Credentials

# ✅ CONFIGURAR JAVASCRIPT ORIGINS:
# Authorized JavaScript origins:
# - http://localhost:5173 (desarrollo)
# - http://localhost:3000 (desarrollo alternativo)
# - https://tu-dominio.com (producción)

# ✅ CONFIGURAR REDIRECT URIs:
# Authorized redirect URIs:
# - https://tu-proyecto.firebaseapp.com/__/auth/handler
# - http://localhost:5173 (para desarrollo local)

# 🎯 OBTENER CONFIGURACIÓN:
# - Web client ID: Copiar para uso avanzado
# - Client secret: No necesario para web
```

#### Paso 2: Mejorar servicio de Google OAuth
> **Archivo:** `src/services/authService.js`
> **Acción:** Extender funcionalidades de Google Sign-In

```javascript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  updateProfile,
  linkWithPopup,
  unlink,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// ... funciones existentes (registerWithEmail, loginWithEmail, logout)

// 🔐 GOOGLE OAUTH AVANZADO
export const loginWithGoogle = async (useRedirect = false) => {
  try {
    console.log('🔐 Iniciando Google OAuth...', { useRedirect });

    // ✅ Configurar proveedor de Google con scopes adicionales
    const provider = new GoogleAuthProvider();

    // 🎯 Solicitar permisos específicos
    provider.addScope('email');
    provider.addScope('profile');
    // provider.addScope('https://www.googleapis.com/auth/user.birthday.read'); // Opcional

    // ⚙️ Configuraciones adicionales
    provider.setCustomParameters({
      'login_hint': 'user@example.com', // Sugerencia de email
      'prompt': 'select_account' // Siempre mostrar selector de cuenta
    });

    let result;

    if (useRedirect) {
      // 📱 Para dispositivos móviles: usar redirect
      await signInWithRedirect(auth, provider);
      return { success: true, isRedirect: true };
    } else {
      // 💻 Para desktop: usar popup
      result = await signInWithPopup(auth, provider);
    }

    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);

    // 🎯 Información adicional del usuario
    const additionalUserInfo = result._tokenResponse;

    console.log('✅ Google OAuth exitoso:', {
      uid: user.uid,
      email: user.email,
      isNewUser: additionalUserInfo?.isNewUser
    });

    // 💾 Guardar/actualizar perfil en Firestore
    const userProfile = await saveUserProfile(user, {
      provider: 'google',
      isNewUser: additionalUserInfo?.isNewUser,
      accessToken: credential?.accessToken
    });

    return {
      success: true,
      user: userProfile,
      isNewUser: additionalUserInfo?.isNewUser,
      provider: 'google'
    };

  } catch (error) {
    console.error('❌ Error en Google OAuth:', error);
    return {
      success: false,
      error: getGoogleAuthErrorMessage(error.code),
      errorCode: error.code
    };
  }
};

// 🔄 MANEJAR RESULTADO DE REDIRECT
export const handleRedirectResult = async () => {
  try {
    console.log('🔄 Verificando resultado de redirect...');

    const result = await getRedirectResult(auth);

    if (result) {
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);

      console.log('✅ Redirect OAuth exitoso:', user.uid);

      const userProfile = await saveUserProfile(user, {
        provider: 'google',
        accessToken: credential?.accessToken
      });

      return {
        success: true,
        user: userProfile,
        provider: 'google'
      };
    }

    return { success: true, noResult: true };

  } catch (error) {
    console.error('❌ Error en redirect result:', error);
    return {
      success: false,
      error: getGoogleAuthErrorMessage(error.code)
    };
  }
};

// 💾 GUARDAR PERFIL DE USUARIO EN FIRESTORE
const saveUserProfile = async (user, additionalInfo = {}) => {
  try {
    const userRef = doc(db, 'users', user.uid);

    // 🔍 Verificar si el usuario ya existe
    const existingUser = await getDoc(userRef);

    const baseProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (!existingUser.exists()) {
      // 📝 Nuevo usuario: crear perfil completo
      const newProfile = {
        ...baseProfile,
        createdAt: serverTimestamp(),
        provider: additionalInfo.provider || 'unknown',
        isNewUser: true,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'es'
        }
      };

      await setDoc(userRef, newProfile);
      console.log('✅ Perfil de usuario creado:', user.uid);

      return { ...newProfile, isNewUser: true };
    } else {
      // 🔄 Usuario existente: actualizar información
      const updateProfile = {
        ...baseProfile,
        isNewUser: false
      };

      await setDoc(userRef, updateProfile, { merge: true });
      console.log('✅ Perfil de usuario actualizado:', user.uid);

      return { ...existingUser.data(), ...updateProfile, isNewUser: false };
    }

  } catch (error) {
    console.error('❌ Error guardando perfil:', error);
    // Retornar perfil básico aunque falle Firestore
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      error: 'Profile save failed'
    };
  }
};

// 🔗 VINCULAR CUENTA CON GOOGLE (para usuarios existentes)
export const linkAccountWithGoogle = async () => {
  try {
    console.log('🔗 Vinculando cuenta con Google...');

    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const result = await linkWithPopup(auth.currentUser, provider);
    const user = result.user;

    console.log('✅ Cuenta vinculada exitosamente:', user.uid);

    // 🔄 Actualizar perfil con información de Google
    await saveUserProfile(user, { provider: 'google', linked: true });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    };

  } catch (error) {
    console.error('❌ Error vinculando cuenta:', error);
    return {
      success: false,
      error: getLinkAccountErrorMessage(error.code)
    };
  }
};

// 🔓 DESVINCULAR CUENTA DE GOOGLE
export const unlinkGoogleAccount = async () => {
  try {
    console.log('🔓 Desvinculando cuenta de Google...');

    await unlink(auth.currentUser, GoogleAuthProvider.PROVIDER_ID);

    console.log('✅ Cuenta desvinculada exitosamente');
    return { success: true };

  } catch (error) {
    console.error('❌ Error desvinculando cuenta:', error);
    return {
      success: false,
      error: 'Error al desvincular cuenta de Google'
    };
  }
};

// 🔍 VERIFICAR MÉTODOS DE LOGIN DISPONIBLES
export const checkSignInMethods = async (email) => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);

    return {
      success: true,
      methods: methods,
      hasPassword: methods.includes('password'),
      hasGoogle: methods.includes(GoogleAuthProvider.PROVIDER_ID),
      // hasFacebook: methods.includes(FacebookAuthProvider.PROVIDER_ID),
    };

  } catch (error) {
    console.error('❌ Error verificando métodos:', error);
    return {
      success: false,
      error: 'Error verificando métodos de login'
    };
  }
};

// 🎯 OBTENER INFORMACIÓN DETALLADA DEL USUARIO
export const getUserProfile = async (uid = null) => {
  try {
    const userId = uid || auth.currentUser?.uid;
    if (!userId) return null;

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const profile = userDoc.data();

      return {
        ...profile,
        createdAt: profile.createdAt?.toDate?.() || null,
        updatedAt: profile.updatedAt?.toDate?.() || null,
        lastLoginAt: profile.lastLoginAt?.toDate?.() || null
      };
    }

    return null;

  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    return null;
  }
};

// 🎯 MENSAJES DE ERROR ESPECÍFICOS PARA GOOGLE OAUTH
const getGoogleAuthErrorMessage = (errorCode) => {
  const googleErrorMessages = {
    'auth/popup-blocked': 'El popup fue bloqueado. Permite popups para este sitio',
    'auth/popup-closed-by-user': 'Inicio de sesión cancelado por el usuario',
    'auth/cancelled-popup-request': 'Solo se permite un popup a la vez',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email usando otro método',
    'auth/credential-already-in-use': 'Esta cuenta de Google ya está vinculada a otro usuario',
    'auth/operation-not-allowed': 'Google Sign-In no está habilitado',
    'auth/unauthorized-domain': 'Este dominio no está autorizado para OAuth',
    'auth/internal-error': 'Error interno del servidor OAuth'
  };

  return googleErrorMessages[errorCode] || getAuthErrorMessage(errorCode);
};

// 🔗 MENSAJES DE ERROR PARA VINCULACIÓN
const getLinkAccountErrorMessage = (errorCode) => {
  const linkErrorMessages = {
    'auth/provider-already-linked': 'Esta cuenta ya está vinculada con Google',
    'auth/invalid-credential': 'Las credenciales de Google no son válidas',
    'auth/email-already-in-use': 'El email de Google ya está en uso por otra cuenta'
  };

  return linkErrorMessages[errorCode] || getGoogleAuthErrorMessage(errorCode);
};

// ... resto de funciones existentes (getCurrentUser, onAuthStateChange, etc.)
```

#### Paso 3: Crear componente mejorado de Google Sign-In
> **Archivo:** `src/components/auth/GoogleSignInButton.jsx`
> **Acción:** Botón avanzado para Google OAuth

```jsx
import { useState } from 'react';
import { loginWithGoogle, handleRedirectResult } from '../../services/authService';
import { useToast } from '../ui/Toast';
import { useEffect } from 'react';

const GoogleSignInButton = ({
  onSuccess,
  onError,
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'outline'
  size = 'large', // 'small', 'medium', 'large'
  useRedirect = false,
  className = ''
}) => {

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const toast = useToast();

  // 🔄 Verificar si hay resultado de redirect al cargar
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await handleRedirectResult();

        if (result.success && !result.noResult) {
          toast.success(`¡Bienvenido, ${result.user.displayName}!`);
          onSuccess?.(result.user);
        }
      } catch (error) {
        console.error('Error checking redirect:', error);
        toast.error('Error procesando inicio de sesión');
      } finally {
        setChecking(false);
      }
    };

    checkRedirect();
  }, [onSuccess, toast]);

  // 🔐 Manejar click en Google Sign-In
  const handleGoogleSignIn = async () => {
    if (disabled || loading) return;

    setLoading(true);

    try {
      const result = await loginWithGoogle(useRedirect);

      if (result.success) {
        if (result.isRedirect) {
          // Redirect iniciado, no hacer nada más
          toast.info('Redirigiendo a Google...');
          return;
        }

        // Login exitoso con popup
        const message = result.isNewUser
          ? `¡Cuenta creada! Bienvenido, ${result.user.displayName}!`
          : `¡Bienvenido de nuevo, ${result.user.displayName}!`;

        toast.success(message);
        onSuccess?.(result.user);
      } else {
        // Error en login
        toast.error(result.error, 'Error de Google Sign-In');
        onError?.(result.error);
      }
    } catch (error) {
      console.error('Error inesperado en Google Sign-In:', error);
      toast.error('Error inesperado al iniciar sesión');
      onError?.('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Configurar estilos según variante
  const getButtonStyles = () => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Tamaños
    const sizeClasses = {
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-2.5 text-base',
      large: 'px-6 py-3 text-lg'
    };

    // Variantes
    const variantClasses = {
      primary: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-lg hover:shadow-xl',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-500 border border-gray-300',
      outline: 'bg-white hover:bg-gray-50 text-gray-700 focus:ring-red-500 border-2 border-gray-300 hover:border-red-300'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  // ⏳ Estado de verificación inicial
  if (checking) {
    return (
      <button disabled className={getButtonStyles()}>
        <span className="inline-block animate-spin mr-2">⏳</span>
        Verificando...
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleGoogleSignIn}
        disabled={disabled || loading}
        className={getButtonStyles()}
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin mr-3">⏳</span>
            {useRedirect ? 'Redirigiendo...' : 'Conectando...'}
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {useRedirect ? 'Continuar con Google' : 'Iniciar con Google'}
          </>
        )}
      </button>

      <toast.ToastContainer />
    </>
  );
};

export default GoogleSignInButton;
```

#### Paso 4: Crear componente de gestión de cuenta
> **Archivo:** `src/components/auth/AccountManager.jsx`
> **Acción:** Gestión avanzada de métodos de login

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUserProfile,
  linkAccountWithGoogle,
  unlinkGoogleAccount,
  checkSignInMethods
} from '../../services/authService';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';

const AccountManager = () => {
  const { user, userId } = useAuth();
  const [profile, setProfile] = useState(null);
  const [signInMethods, setSignInMethods] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const toast = useToast();

  // 🔄 Cargar información del usuario
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!user || !userId) return;

      setLoading(true);

      try {
        // 📊 Obtener perfil completo
        const userProfile = await getUserProfile(userId);
        setProfile(userProfile);

        // 🔍 Verificar métodos de login disponibles
        const methods = await checkSignInMethods(user.email);
        setSignInMethods(methods);

      } catch (error) {
        console.error('Error cargando información del usuario:', error);
        toast.error('Error cargando información de la cuenta');
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [user, userId, toast]);

  // 🔗 Vincular con Google
  const handleLinkGoogle = async () => {
    setActionLoading('link-google');

    try {
      const result = await linkAccountWithGoogle();

      if (result.success) {
        toast.success('Cuenta vinculada con Google exitosamente');

        // 🔄 Recargar métodos de login
        const methods = await checkSignInMethods(user.email);
        setSignInMethods(methods);
      } else {
        toast.error(result.error, 'Error vinculando cuenta');
      }
    } catch (error) {
      console.error('Error vinculando con Google:', error);
      toast.error('Error inesperado al vincular cuenta');
    } finally {
      setActionLoading('');
    }
  };

  // 🔓 Desvincular de Google
  const handleUnlinkGoogle = async () => {
    if (!signInMethods.hasPassword) {
      toast.error('No puedes desvincular Google sin tener contraseña configurada');
      return;
    }

    setActionLoading('unlink-google');

    try {
      const result = await unlinkGoogleAccount();

      if (result.success) {
        toast.success('Cuenta desvinculada de Google exitosamente');

        // 🔄 Recargar métodos de login
        const methods = await checkSignInMethods(user.email);
        setSignInMethods(methods);
      } else {
        toast.error(result.error, 'Error desvinculando cuenta');
      }
    } catch (error) {
      console.error('Error desvinculando de Google:', error);
      toast.error('Error inesperado al desvincular cuenta');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          👤 Gestión de Cuenta
        </h3>

        {/* Información del perfil */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-16 h-16 rounded-full border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=3B82F6&color=fff`;
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-gray-600">
                👤
              </div>
            )}

            <div>
              <h4 className="text-lg font-medium text-gray-800">
                {user.displayName || 'Usuario'}
              </h4>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.emailVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.emailVerified ? '✅ Email verificado' : '⚠️ Email no verificado'}
                </span>
              </div>
            </div>
          </div>

          {/* Información adicional del perfil */}
          {profile && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-2">📊 Información de cuenta</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Creada:</span>
                  <span className="ml-2 font-medium">
                    {profile.createdAt?.toLocaleDateString() || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Último acceso:</span>
                  <span className="ml-2 font-medium">
                    {profile.lastLoginAt?.toLocaleDateString() || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Proveedor:</span>
                  <span className="ml-2 font-medium">
                    {profile.provider || 'Email'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Preferencias:</span>
                  <span className="ml-2 font-medium">
                    {profile.preferences?.theme || 'Por defecto'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Métodos de inicio de sesión */}
        <div>
          <h5 className="font-medium text-gray-800 mb-4">
            🔐 Métodos de inicio de sesión
          </h5>

          <div className="space-y-3">

            {/* Email/Password */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📧</span>
                <div>
                  <div className="font-medium text-gray-800">Email y contraseña</div>
                  <div className="text-sm text-gray-600">
                    {signInMethods.hasPassword
                      ? 'Configurado y activo'
                      : 'No configurado'}
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                signInMethods.hasPassword
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {signInMethods.hasPassword ? '✅ Activo' : '➖ No configurado'}
              </span>
            </div>

            {/* Google OAuth */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <div className="font-medium text-gray-800">Google Sign-In</div>
                  <div className="text-sm text-gray-600">
                    {signInMethods.hasGoogle
                      ? 'Cuenta vinculada con Google'
                      : 'No vinculado'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  signInMethods.hasGoogle
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {signInMethods.hasGoogle ? '✅ Vinculado' : '➖ No vinculado'}
                </span>

                {signInMethods.hasGoogle ? (
                  <Button
                    onClick={handleUnlinkGoogle}
                    disabled={actionLoading === 'unlink-google' || !signInMethods.hasPassword}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                  >
                    {actionLoading === 'unlink-google' ? '⏳ Desvinculando...' : '🔓 Desvincular'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleLinkGoogle}
                    disabled={actionLoading === 'link-google'}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded"
                  >
                    {actionLoading === 'link-google' ? '⏳ Vinculando...' : '🔗 Vincular'}
                  </Button>
                )}
              </div>
            </div>

            {/* Placeholder para futuros proveedores */}
            <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📘</span>
                <div>
                  <div className="font-medium text-gray-800">Facebook Login</div>
                  <div className="text-sm text-gray-600">Próximamente disponible</div>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                🚧 Próximamente
              </span>
            </div>
          </div>

          {/* Advertencias de seguridad */}
          {signInMethods.hasGoogle && !signInMethods.hasPassword && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">Recomendación de seguridad</div>
                  <div className="text-yellow-700 mt-1">
                    Te recomendamos configurar también una contraseña como método alternativo de acceso.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <toast.ToastContainer />
    </>
  );
};

export default AccountManager;
```

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**🔍 Google OAuth avanzado**
- ✅ Configuración completa en Firebase Console
- ✅ Manejo de popup y redirect para diferentes dispositivos
- ✅ Scopes adicionales y configuraciones personalizadas
- ✅ Gestión de tokens de acceso

**💾 Gestión de perfiles**
- ✅ Guardado automático de perfiles en Firestore
- ✅ Diferenciación entre usuarios nuevos y existentes
- ✅ Información detallada de proveedores OAuth
- ✅ Preferencias de usuario personalizables

**🔗 Vinculación de cuentas**
- ✅ Vincular/desvincular proveedores de OAuth
- ✅ Verificación de métodos de login disponibles
- ✅ Manejo de conflictos de email
- ✅ Interfaz de gestión de cuenta

**✨ Experiencia de usuario premium**
- ✅ Botón de Google Sign-In personalizable
- ✅ Estados de loading y feedback visual
- ✅ Manejo de errores específicos de OAuth
- ✅ Gestión completa de métodos de autenticación

### 🧪 Pruebas críticas

1. **Google OAuth popup** → Login exitoso y creación de perfil
2. **Google OAuth redirect** → Funciona en dispositivos móviles
3. **Vinculación de cuentas** → Vincular Google a cuenta existente
4. **Desvinculación segura** → Solo con contraseña alternativa
5. **Manejo de errores** → Popup bloqueado, cancelación de usuario

### 📸 Capturas de verificación
1. **Firebase Console** → Google OAuth configurado correctamente
2. **Login con Google** → Popup funcionando, información completa
3. **Perfil de usuario** → Datos guardados en Firestore
4. **Gestión de cuenta** → Interface de métodos de login
5. **Vinculación/desvinculación** → Operaciones exitosas

### 🔄 Próxima sesión
**Sesión 76:** Protección de rutas y componentes - Implementar sistema de autorización y navegación segura

---

**🎯 Conceptos clave aprendidos:**
- Configuración avanzada de Google OAuth
- Manejo de múltiples proveedores de autenticación
- Gestión de perfiles de usuario en Firestore
- Vinculación y desvinculación de cuentas
- Manejo de tokens y scopes OAuth
- Experiencia de usuario en autenticación social
- Seguridad en métodos de autenticación múltiples
