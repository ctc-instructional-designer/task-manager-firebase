## 🔐 Sesión 73: Introducción a Firebase Authentication

### 🎯 Objetivos de la sesión
- Configurar Firebase Authentication en el proyecto
- Comprender conceptos básicos de autenticación
- Instalar y configurar las dependencias necesarias
- Preparar estructura base para manejo de usuarios
- Establecer flujo de autenticación general

### 📋 Contenidos clave
✅ **Firebase Auth setup** - Configuración inicial de autenticación
✅ **Estructura de usuarios** - Como funcionan las sesiones
✅ **Preparación del código** - Servicios y contextos base

---

### 🏗️ Implementación paso a paso

#### Paso 1: Conceptos fundamentales de autenticación
> **Concepto:** Entender qué es y por qué necesitamos autenticación

```javascript
// 🎯 ¿QUÉ ES LA AUTENTICACIÓN?
┌─────────────────────────────────────────────────────────────────┐
│  🌐 Cliente (React)         🔥 Firebase Auth        💾 Firestore │
│  ┌─────────────────┐        ┌─────────────────┐    ┌───────────┐ │
│  │ 🧑‍💻 Usuario      │ ────→  │ 🔐 Verificar    │ ──→ │ 📄 Datos  │ │
│  │ email/password  │        │ - Credenciales  │    │ del user  │ │
│  │ Google OAuth    │        │ - Generar token │    │           │ │
│  │ Facebook, etc   │        │ - Mantener      │    │           │ │
│  └─────────────────┘        │   sesión        │    │           │ │
│                             └─────────────────┘    └───────────┘ │
│                                     │                            │
│  ┌─────────────────┐                ▼                            │
│  │ 🏠 App protegida│ ◄────── 🎫 ID Token                        │
│  │ - Ver tareas    │        (Proof de identidad)                │ │
│  │ - Crear tareas  │                                            │
│  │ - Solo del user │                                            │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘

// ✨ BENEFICIOS DE FIREBASE AUTH
├── 🔒 Seguridad manejada por Google
├── 🚀 Múltiples métodos de login (email, Google, Facebook, etc)
├── 🎫 Tokens JWT automáticos
├── 🔄 Manejo de sesiones automático
├── 📱 Funciona en web, móvil, etc
└── 🛡️ Integración perfecta con Firestore Rules
```

**Flujo completo que implementaremos:**
- 🚪 **Login/Register** - Usuario entra credenciales
- 🔐 **Verificación** - Firebase valida y genera token
- 🎫 **Sesión activa** - Token se usa automáticamente
- 📄 **Datos protegidos** - Solo ve/edita sus propias tareas
- 🚪 **Logout** - Limpiar sesión y redirigir

#### Paso 2: Configurar Firebase Authentication
> **Archivo:** Firebase Console
> **Acción:** Habilitar métodos de autenticación

```bash
# 🔥 CONFIGURAR EN FIREBASE CONSOLE

# 1️⃣ Ir a Firebase Console > Authentication
# 2️⃣ Click en "Comenzar"
# 3️⃣ Ir a "Sign-in method"
# 4️⃣ Habilitar proveedores:

# ✅ HABILITAR: Email/Password
# - Provider: Email/Password
# - Enable: ✓ Activado
# - Email link (passwordless sign-in): ❌ (por ahora)

# ✅ HABILITAR: Google Sign-In
# - Provider: Google
# - Enable: ✓ Activado
# - Project support email: tu-email@gmail.com
# - Project public-facing name: "Task Manager"

# 🚀 CONFIGURAR DOMINIOS AUTORIZADOS
# - localhost (ya incluido)
# - tu-dominio-de-produccion.com (agregar más tarde)
```

#### Paso 3: Instalar dependencias de autenticación
> **Archivo:** Terminal
> **Acción:** Instalar Firebase Auth

```bash
# 🚀 Las dependencias ya están instaladas desde sesiones anteriores
# Verificar que package.json tiene:
npm list firebase
# Debe mostrar: firebase@^9.x.x (o superior)

# Si no está instalado:
# npm install firebase

# 📦 Firebase Auth ya viene incluido en el paquete firebase
# No necesitamos instalación adicional
```

#### Paso 4: Configurar Firebase Auth en el proyecto
> **Archivo:** `src/services/firebase.js`
> **Acción:** Agregar configuración de Auth

```javascript
// 🔥 Importar Firebase y servicios
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // 👈 NUEVO: Importar Auth

// ⚙️ Configuración de Firebase (ya existente)
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// 🚀 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 💾 Inicializar Firestore (ya existente)
export const db = getFirestore(app);

// 🔐 Inicializar Authentication (NUEVO)
export const auth = getAuth(app);

// 🎯 Configuraciones adicionales de Auth
auth.useDeviceLanguage(); // Usar idioma del dispositivo para emails

console.log('🔥 Firebase inicializado:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  firestoreConnected: !!db,
  authConnected: !!auth  // 👈 NUEVO: Verificar Auth
});

// 🚀 Exportar configuración para uso en otros archivos
export default app;
```

#### Paso 5: Crear servicio de autenticación
> **Archivo:** `src/services/authService.js`
> **Acción:** Funciones básicas de autenticación

```javascript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';

// 🎯 REGISTRO CON EMAIL Y PASSWORD
export const registerWithEmail = async (email, password, displayName) => {
  try {
    console.log('📝 Registrando usuario:', email);

    // ✅ Crear usuario en Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // ✅ Actualizar nombre del usuario
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }

    console.log('✅ Usuario registrado exitosamente:', user.uid);
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.email,
        emailVerified: user.emailVerified
      }
    };

  } catch (error) {
    console.error('❌ Error en registro:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
};

// 🔐 LOGIN CON EMAIL Y PASSWORD
export const loginWithEmail = async (email, password) => {
  try {
    console.log('🔐 Iniciando sesión:', email);

    // ✅ Autenticar en Firebase
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    console.log('✅ Sesión iniciada exitosamente:', user.uid);
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        emailVerified: user.emailVerified
      }
    };

  } catch (error) {
    console.error('❌ Error en login:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
};

// 🔐 LOGIN CON GOOGLE
export const loginWithGoogle = async () => {
  try {
    console.log('🔐 Iniciando sesión con Google...');

    // ✅ Configurar proveedor de Google
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    // ✅ Mostrar popup de Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log('✅ Sesión con Google exitosa:', user.uid);
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      }
    };

  } catch (error) {
    console.error('❌ Error en login con Google:', error);

    // 🚫 Manejar cancelación del usuario
    if (error.code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        error: 'Inicio de sesión cancelado por el usuario'
      };
    }

    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
};

// 🚪 CERRAR SESIÓN
export const logout = async () => {
  try {
    console.log('🚪 Cerrando sesión...');

    await signOut(auth);

    console.log('✅ Sesión cerrada exitosamente');
    return {
      success: true
    };

  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    return {
      success: false,
      error: 'Error al cerrar sesión'
    };
  }
};

// 👀 OBSERVAR CAMBIOS DE ESTADO DE AUTENTICACIÓN
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // ✅ Usuario está logueado
      callback({
        isLoggedIn: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      });
    } else {
      // ❌ Usuario no está logueado
      callback({
        isLoggedIn: false,
        user: null
      });
    }
  });
};

// 🎯 OBTENER USUARIO ACTUAL
export const getCurrentUser = () => {
  const user = auth.currentUser;

  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
  }

  return null;
};

// 🎯 MAPEAR ERRORES DE FIREBASE A MENSAJES USER-FRIENDLY
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Ya existe una cuenta con este email',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'El formato del email no es válido',
    'auth/invalid-credential': 'Las credenciales no son válidas',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/popup-blocked': 'El popup fue bloqueado por el navegador',
    'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
    'auth/cancelled-popup-request': 'Solo se permite un popup a la vez',
    'auth/network-request-failed': 'Error de conexión de red'
  };

  return errorMessages[errorCode] || 'Ha ocurrido un error inesperado';
};

// 🎯 UTILIDADES ADICIONALES
export const isLoggedIn = () => {
  return !!auth.currentUser;
};

export const getUserEmail = () => {
  return auth.currentUser?.email || null;
};

export const getUserId = () => {
  return auth.currentUser?.uid || null;
};
```

#### Paso 6: Crear contexto de autenticación
> **Archivo:** `src/contexts/AuthContext.jsx`
> **Acción:** Proveedor global de estado de autenticación

```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '../services/authService';

// 🎯 Crear contexto de autenticación
const AuthContext = createContext();

// 🎯 Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// 🎯 Proveedor de contexto de autenticación
export const AuthProvider = ({ children }) => {

  // 📊 Estados globales de autenticación
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    loading: true // Importante: iniciar en loading=true
  });

  // 👀 Escuchar cambios de estado de autenticación
  useEffect(() => {
    console.log('🔐 Configurando listener de autenticación...');

    const unsubscribe = onAuthStateChange((authData) => {
      console.log('🔄 Estado de auth cambiado:', authData);

      setAuthState({
        ...authData,
        loading: false // Ya terminó de cargar
      });
    });

    // 🧹 Cleanup: Desuscribirse cuando el componente se desmonte
    return () => {
      console.log('🧹 Desuscribiendo listener de auth');
      unsubscribe();
    };
  }, []);

  // 🎯 Métodos auxiliares para el contexto
  const contextValue = {
    // 📊 Estado actual
    ...authState,

    // 🎯 Getters de conveniencia
    userId: authState.user?.uid || null,
    userEmail: authState.user?.email || null,
    userName: authState.user?.displayName || authState.user?.email || null,
    userPhoto: authState.user?.photoURL || null,

    // 🎯 Funciones de estado
    isAuthenticated: authState.isLoggedIn && !authState.loading,
    isLoading: authState.loading
  };

  // 🔄 Mostrar loading mientras se determina el estado de auth
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Verificando sesión...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
```

#### Paso 7: Integrar AuthProvider en la aplicación
> **Archivo:** `src/main.jsx`
> **Acción:** Envolver la app con el proveedor de autenticación

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx'; // 👈 NUEVO

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* 👈 NUEVO: Envolver con AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**🔐 Firebase Auth configurado**
- ✅ Authentication habilitado en Firebase Console
- ✅ Métodos de login (Email/Password + Google) configurados
- ✅ Dominios autorizados establecidos

**⚙️ Código base preparado**
- ✅ Servicios de autenticación creados (`authService.js`)
- ✅ Contexto global de auth (`AuthContext.jsx`)
- ✅ Integración con la aplicación principal

**🎯 Funcionalidades disponibles**
- ✅ Registro de usuarios con email/password
- ✅ Login con email/password
- ✅ Login con Google OAuth
- ✅ Logout de sesiones
- ✅ Observación automática de cambios de estado
- ✅ Manejo de errores user-friendly

### 🧪 Pruebas críticas

1. **Firebase Console** → Authentication habilitado
2. **Console del navegador** → Sin errores de Firebase Auth
3. **AuthContext loading** → Pantalla de carga funciona
4. **Servicios importados** → Sin errores de importación

### 📸 Capturas de verificación
1. **Firebase Console** → Authentication > Sign-in method → Email y Google habilitados
2. **Navegador console** → "🔥 Firebase inicializado" con authConnected: true
3. **App funcionando** → Sin errores, pantalla de loading inicial
4. **Network tab** → Conexiones a Firebase Auth funcionando

### 🚧 Próximos pasos
En las siguientes sesiones implementaremos:
- **Sesión 74:** Componentes de Login y Registro
- **Sesión 75:** Integración con Google OAuth
- **Sesión 76:** Protección de rutas y páginas
- **Sesión 77:** Conectar tareas con usuarios autenticados
- **Sesión 78:** Finalización y deployment

### 🔄 Próxima sesión
**Sesión 74:** Componentes de Login y Registro - Crear interfaces de usuario para autenticación

---

**🎯 Conceptos clave aprendidos:**
- Configuración de Firebase Authentication
- Estructura de servicios de autenticación
- Context API para estado global de auth
- Observer pattern para cambios de estado
- Manejo de múltiples proveedores de login
- Loading states en autenticación
- Mapeo de errores user-friendly
