## 🛡️ Sesión 76: Protección de rutas y componentes

### 🎯 Objetivos de la sesión
- Implementar sistema de rutas protegidas (Protected Routes)
- Crear componentes de autorización y permisos
- Configurar redirecciones automáticas según estado de auth
- Implementar guards de navegación para diferentes niveles
- Crear experiencia de usuario fluida en navegación

### 📋 Contenidos clave
✅ **Protected Routes** - Rutas que requieren autenticación
✅ **Route Guards** - Verificación de permisos antes de acceder
✅ **Redirecciones automáticas** - Navegación inteligente
✅ **Components authorizados** - Mostrar/ocultar según permisos

---

### 🏗️ Implementación paso a paso

#### Paso 1: Instalar React Router (si no está instalado)
> **Acción:** Configurar sistema de navegación

```bash
# 📦 Instalar React Router DOM
npm install react-router-dom

# ✅ Verificar instalación
npm list react-router-dom
# Debe mostrar: react-router-dom@^6.x.x
```

#### Paso 2: Crear componente ProtectedRoute
> **Archivo:** `src/components/auth/ProtectedRoute.jsx`
> **Acción:** Guard principal para rutas protegidas

```jsx
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireEmailVerified = false,
  fallback = null,
  redirectTo = '/auth'
}) => {

  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // ⏳ Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Verificando acceso...</div>
        </div>
      </div>
    );
  }

  // 🔐 Verificar si requiere autenticación
  if (requireAuth && !isAuthenticated) {
    // 💾 Guardar la ubicación a la que intentaba acceder
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ✉️ Verificar si requiere email verificado
  if (requireAuth && requireEmailVerified && !user?.emailVerified) {
    return (
      <Navigate
        to="/verify-email"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 🚫 Redirigir usuarios autenticados de páginas públicas
  if (!requireAuth && isAuthenticated) {
    const intendedDestination = location.state?.from || '/dashboard';
    return <Navigate to={intendedDestination} replace />;
  }

  // ✅ Permitir acceso
  return children;
};

export default ProtectedRoute;
```

#### Paso 3: Crear componente PublicRoute
> **Archivo:** `src/components/auth/PublicRoute.jsx`
> **Acción:** Guard para rutas públicas (no autenticadas)

```jsx
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const PublicRoute = ({
  children,
  redirectAuthenticatedTo = '/dashboard',
  allowAuthenticated = false
}) => {

  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ⏳ Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  // 🔄 Redirigir usuarios autenticados si no están permitidos
  if (isAuthenticated && !allowAuthenticated) {
    // 🎯 Usar destino original o dashboard por defecto
    const destination = location.state?.from || redirectAuthenticatedTo;
    return <Navigate to={destination} replace />;
  }

  // ✅ Permitir acceso a ruta pública
  return children;
};

export default PublicRoute;
```

#### Paso 4: Crear hook de navegación autorizada
> **Archivo:** `src/hooks/useAuthNavigation.js`
> **Acción:** Hook para navegación inteligente

```javascript
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCallback, useEffect } from 'react';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  // 🎯 Navegar a dashboard después de login exitoso
  const navigateAfterLogin = useCallback(() => {
    const intendedDestination = location.state?.from || '/dashboard';
    navigate(intendedDestination, { replace: true });
  }, [navigate, location.state]);

  // 🚪 Navegar a auth después de logout
  const navigateAfterLogout = useCallback(() => {
    navigate('/auth', { replace: true });
  }, [navigate]);

  // 🏠 Navegar a página principal
  const navigateToHome = useCallback(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [navigate, isAuthenticated]);

  // 📱 Navegar con verificación de auth
  const navigateIfAuthenticated = useCallback((path, options = {}) => {
    if (!isAuthenticated) {
      navigate('/auth', {
        state: { from: path },
        ...options
      });
      return false;
    }

    navigate(path, options);
    return true;
  }, [navigate, isAuthenticated]);

  // 🔄 Redireccionar automáticamente basado en auth state
  const autoRedirect = useCallback(() => {
    if (isLoading) return;

    const currentPath = location.pathname;

    // 📋 Rutas que requieren autenticación
    const protectedPaths = ['/dashboard', '/tasks', '/profile', '/settings'];

    // 🚪 Rutas para usuarios no autenticados
    const publicPaths = ['/', '/auth', '/about', '/contact'];

    const isProtectedPath = protectedPaths.some(path =>
      currentPath.startsWith(path)
    );

    const isPublicPath = publicPaths.includes(currentPath);

    if (isProtectedPath && !isAuthenticated) {
      // Redirigir a auth si intenta acceder a ruta protegida
      navigate('/auth', {
        state: { from: currentPath },
        replace: true
      });
    } else if (isPublicPath && isAuthenticated && currentPath === '/auth') {
      // Redirigir a dashboard si ya está autenticado
      navigateAfterLogin();
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate, navigateAfterLogin]);

  // 🎯 Auto-redirigir cuando cambie el estado de auth
  useEffect(() => {
    autoRedirect();
  }, [autoRedirect]);

  return {
    // 🧭 Funciones de navegación
    navigateAfterLogin,
    navigateAfterLogout,
    navigateToHome,
    navigateIfAuthenticated,

    // 📊 Estado de navegación
    currentPath: location.pathname,
    canAccessCurrentRoute: true, // Implementar lógica específica si es necesario

    // 🎯 Utilidades
    isOnProtectedRoute: ['/dashboard', '/tasks', '/profile', '/settings'].some(
      path => location.pathname.startsWith(path)
    ),
    isOnPublicRoute: ['/', '/auth', '/about', '/contact'].includes(location.pathname)
  };
};

export default useAuthNavigation;
```

#### Paso 5: Crear componente AuthGuard
> **Archivo:** `src/components/auth/AuthGuard.jsx`
> **Acción:** Guard a nivel de componente

```jsx
import { useAuth } from '../../contexts/AuthContext';

const AuthGuard = ({
  children,
  requireAuth = true,
  requireEmailVerified = false,
  fallback = null,
  roles = [],
  permissions = []
}) => {

  const { isAuthenticated, user, isLoading } = useAuth();

  // ⏳ Loading state
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin text-lg">⏳</div>
        <span className="ml-2 text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  // 🔐 Verificar autenticación básica
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-2xl mb-2">🔐</div>
        <div className="font-medium text-yellow-800 mb-1">Acceso restringido</div>
        <div className="text-yellow-700 text-sm">
          Debes iniciar sesión para ver este contenido
        </div>
      </div>
    );
  }

  // ✉️ Verificar email verificado
  if (requireAuth && requireEmailVerified && !user?.emailVerified) {
    return fallback || (
      <div className="text-center p-6 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="text-2xl mb-2">📧</div>
        <div className="font-medium text-orange-800 mb-1">Email no verificado</div>
        <div className="text-orange-700 text-sm">
          Verifica tu email para acceder a este contenido
        </div>
      </div>
    );
  }

  // 👑 Verificar roles (para futuras implementaciones)
  if (roles.length > 0 && user) {
    const userRoles = user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return fallback || (
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl mb-2">🚫</div>
          <div className="font-medium text-red-800 mb-1">Permisos insuficientes</div>
          <div className="text-red-700 text-sm">
            No tienes los permisos necesarios para ver este contenido
          </div>
        </div>
      );
    }
  }

  // 🔑 Verificar permisos específicos (para futuras implementaciones)
  if (permissions.length > 0 && user) {
    const userPermissions = user.permissions || [];
    const hasRequiredPermission = permissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermission) {
      return fallback || (
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl mb-2">🔒</div>
          <div className="font-medium text-red-800 mb-1">Función no disponible</div>
          <div className="text-red-700 text-sm">
            Esta función requiere permisos adicionales
          </div>
        </div>
      );
    }
  }

  // ✅ Todos los checks pasaron, mostrar contenido
  return children;
};

export default AuthGuard;
```

#### Paso 6: Actualizar App.jsx con rutas protegidas
> **Archivo:** `src/App.jsx`
> **Acción:** Implementar sistema de routing completo

```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Páginas
import AuthPage from './pages/AuthPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

// Componentes
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>

            {/* 🏠 Página de inicio */}
            <Route
              path="/"
              element={
                <PublicRoute allowAuthenticated={true}>
                  <LandingPage />
                </PublicRoute>
              }
            />

            {/* 🔐 Autenticación */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />

            {/* 📋 Dashboard/Tareas (Ruta protegida) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TasksPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 📋 Alias para tareas */}
            <Route
              path="/tasks"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* 👤 Perfil de usuario */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ⚙️ Configuraciones */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold mb-4">⚙️ Configuraciones</h2>
                      <p className="text-gray-600">Panel de configuraciones - Próximamente</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 📧 Verificación de email */}
            <Route
              path="/verify-email"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
                      <div className="text-6xl mb-4">📧</div>
                      <h2 className="text-2xl font-bold mb-4">Verificar Email</h2>
                      <p className="text-gray-600 mb-6">
                        Te hemos enviado un email de verificación.
                        Revisa tu bandeja de entrada y haz clic en el enlace para continuar.
                      </p>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                      >
                        Continuar al Dashboard
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* 404 - Página no encontrada */}
            <Route
              path="*"
              element={<NotFoundPage />}
            />

          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
```

#### Paso 7: Crear componente de navegación con auth
> **Archivo:** `src/components/Navbar.jsx`
> **Acción:** Barra de navegación que responde al estado de auth

```jsx
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authService';
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { useToast } from './ui/Toast';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { navigateAfterLogout } = useAuthNavigation();
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const toast = useToast();

  // 🚪 Manejar logout
  const handleLogout = async () => {
    setLoading(true);

    try {
      const result = await logout();

      if (result.success) {
        toast.success('Sesión cerrada correctamente');
        navigateAfterLogout();
      } else {
        toast.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error en logout:', error);
      toast.error('Error inesperado al cerrar sesión');
    } finally {
      setLoading(false);
      setShowUserMenu(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => window.location.href = isAuthenticated ? '/dashboard' : '/'}
                className="flex items-center space-x-2 text-xl font-bold text-gray-800"
              >
                <span className="text-2xl">📋</span>
                <span>Task Manager</span>
              </button>
            </div>

            {/* Navegación */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {isAuthenticated ? (
                  // 🔐 Navegación para usuarios autenticados
                  <>
                    <a
                      href="/dashboard"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      📋 Tareas
                    </a>
                    <a
                      href="/profile"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      👤 Perfil
                    </a>
                  </>
                ) : (
                  // 🌐 Navegación para usuarios no autenticados
                  <>
                    <a
                      href="/"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      🏠 Inicio
                    </a>
                    <a
                      href="/auth"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      🔐 Iniciar Sesión
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Usuario autenticado - Desktop */}
            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {/* Notificaciones (placeholder) */}
                  <button className="bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3">
                    <span className="sr-only">Ver notificaciones</span>
                    <span className="text-lg">🔔</span>
                  </button>

                  {/* Menú de usuario */}
                  <div className="ml-3 relative">
                    <div>
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="max-w-xs bg-gray-100 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-expanded="false"
                        aria-haspopup="true"
                      >
                        <span className="sr-only">Abrir menú de usuario</span>
                        {user?.photoURL ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.photoURL}
                            alt={user.displayName || 'Usuario'}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Dropdown */}
                    {showUserMenu && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          {/* Info del usuario */}
                          <div className="px-4 py-2 border-b">
                            <div className="text-sm font-medium text-gray-900">
                              {user?.displayName || 'Usuario'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user?.email}
                            </div>
                          </div>

                          {/* Opciones del menú */}
                          <a
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            👤 Mi Perfil
                          </a>
                          <a
                            href="/settings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            ⚙️ Configuraciones
                          </a>

                          <div className="border-t">
                            <button
                              onClick={handleLogout}
                              disabled={loading}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              {loading ? '⏳ Cerrando...' : '🚪 Cerrar Sesión'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Menú móvil */}
            <div className="md:hidden">
              <button className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <span className="sr-only">Abrir menú principal</span>
                <span className="text-lg">☰</span>
              </button>
            </div>
          </div>
        </div>

        {/* Click outside para cerrar menú */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </nav>

      <toast.ToastContainer />
    </>
  );
};

export default Navbar;
```

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**🛡️ Sistema de protección completo**
- ✅ Protected Routes para rutas que requieren autenticación
- ✅ Public Routes para páginas abiertas al público
- ✅ Auth Guards a nivel de componente
- ✅ Verificación de email y permisos avanzados

**🧭 Navegación inteligente**
- ✅ Hook personalizado para navegación autorizada
- ✅ Redirecciones automáticas según estado de auth
- ✅ Preservación de destino original después del login
- ✅ Manejo de rutas no encontradas

**✨ Experiencia de usuario optimizada**
- ✅ Estados de loading durante verificación de auth
- ✅ Navegación fluida entre páginas públicas y privadas
- ✅ Navbar que se adapta al estado de autenticación
- ✅ Menú de usuario con opciones contextuales

**🔒 Seguridad implementada**
- ✅ Verificación automática de autenticación
- ✅ Protección contra acceso no autorizado
- ✅ Manejo seguro de logout y limpieza de sesión
- ✅ Preparación para roles y permisos futuros

### 🧪 Pruebas críticas

1. **Acceso sin autenticación** → Redirigir a /auth automáticamente
2. **Login exitoso** → Redirigir al destino original o dashboard
3. **Logout** → Limpiar sesión y redirigir a auth
4. **Navegación directa** → URLs protegidas redirigen correctamente
5. **Estados de loading** → No mostrar contenido durante verificación

### 📸 Capturas de verificación
1. **Ruta protegida** → Redirección automática a /auth
2. **Navbar autenticado** → Menú de usuario funcionando
3. **Navbar no autenticado** → Botón de login visible
4. **Loading states** → Spinners durante verificación
5. **Logout completo** → Sesión limpia, regreso a auth

### 🔄 Próxima sesión
**Sesión 77:** Conectar tareas con usuarios autenticados - Filtrar y asociar datos por usuario

---

**🎯 Conceptos clave aprendidos:**
- Implementación de Protected Routes
- Guards de navegación y autorización
- Hooks personalizados para navegación
- Manejo de estados de autenticación en rutas
- Redirecciones automáticas inteligentes
- Componentes condicionales según auth
- Preservación de destinos de navegación
