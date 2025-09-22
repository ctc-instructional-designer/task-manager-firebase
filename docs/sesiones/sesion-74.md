## 🔐 Sesión 74: Componentes de Login y Registro

### 🎯 Objetivos de la sesión
- Crear interfaces de usuario para login y registro
- Implementar validación de formularios de autenticación
- Integrar formularios con servicios de Firebase Auth
- Crear flujo completo de registro → login → dashboard
- Manejar estados de loading y errores en auth

### 📋 Contenidos clave
✅ **Formularios de autenticación** - Login y registro user-friendly
✅ **Validación frontend** - Validar datos antes de enviar a Firebase
✅ **Estados de UI** - Loading, success, error en tiempo real
✅ **Flujo de navegación** - Redirecciones automáticas

---

### 🏗️ Implementación paso a paso

#### Paso 1: Crear componente de Login
> **Archivo:** `src/components/auth/LoginForm.jsx`
> **Acción:** Formulario completo de inicio de sesión

```jsx
import { useState } from 'react';
import { loginWithEmail, loginWithGoogle } from '../../services/authService';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Input from '../ui/Input';

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  // 📊 Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const toast = useToast();

  // 🎯 Validaciones específicas para login
  const validateEmail = (email) => {
    if (!email) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Formato de email inválido';
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  };

  // 🎯 Validar campo individual
  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  };

  // 🎯 Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      validateField(name, value);
    }
  };

  // 🎯 Manejar blur de inputs
  const handleInputBlur = (e) => {
    const { name, value } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    validateField(name, value);
  };

  // 🔐 Manejar login con email
  const handleEmailLogin = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);

    if (!emailValid || !passwordValid) {
      setTouched({ email: true, password: true });
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      const result = await loginWithEmail(formData.email, formData.password);

      if (result.success) {
        toast.success(`¡Bienvenido, ${result.user.displayName}!`);
        onLoginSuccess?.(result.user);
      } else {
        toast.error(result.error, 'Error de inicio de sesión');
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Manejar login con Google
  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const result = await loginWithGoogle();

      if (result.success) {
        toast.success(`¡Bienvenido, ${result.user.displayName}!`);
        onLoginSuccess?.(result.user);
      } else {
        toast.error(result.error, 'Error de inicio de sesión');
      }
    } catch (error) {
      console.error('Error inesperado en login con Google:', error);
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Obtener estilos de campo según estado
  const getFieldClasses = (fieldName) => {
    const baseClasses = "w-full p-3 border rounded-lg transition-colors";

    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClasses} border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200`;
    }

    if (touched[fieldName] && !errors[fieldName] && formData[fieldName]) {
      return `${baseClasses} border-green-500 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-200`;
    }

    return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`;
  };

  return (
    <>
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🔐 Iniciar Sesión</h2>
          <p className="text-gray-600">Accede a tu cuenta para gestionar tus tareas</p>
        </div>

        {/* Formulario de email/password */}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              📧 Email
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={getFieldClasses('email')}
              placeholder="tu@email.com"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">❌ {errors.email}</p>
            )}
          </div>

          {/* Campo Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              🔒 Contraseña
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={getFieldClasses('password')}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-600">❌ {errors.password}</p>
            )}
          </div>

          {/* Botón de login */}
          <Button
            type="submit"
            disabled={loading || Object.values(errors).some(error => error)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Iniciando sesión...
              </>
            ) : (
              '🔐 Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o continúa con</span>
            </div>
          </div>
        </div>

        {/* Login con Google */}
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Conectando con Google...
            </>
          ) : (
            <>
              🔍 Continuar con Google
            </>
          )}
        </Button>

        {/* Link para cambiar a registro */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              disabled={loading}
              className="text-blue-500 hover:text-blue-600 font-medium disabled:text-gray-400"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        {/* Indicadores de estado del formulario */}
        <div className="mt-4 text-sm">
          <div className="flex justify-between text-gray-500">
            <span className={formData.email && !errors.email ? 'text-green-600' : ''}>
              📧 Email válido
            </span>
            <span className={formData.password && !errors.password ? 'text-green-600' : ''}>
              🔒 Contraseña válida
            </span>
          </div>
        </div>
      </div>

      {/* Sistema de notificaciones */}
      <toast.ToastContainer />
    </>
  );
};

export default LoginForm;
```

#### Paso 2: Crear componente de Registro
> **Archivo:** `src/components/auth/RegisterForm.jsx`
> **Acción:** Formulario completo de registro de usuarios

```jsx
import { useState } from 'react';
import { registerWithEmail, loginWithGoogle } from '../../services/authService';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Input from '../ui/Input';

const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  // 📊 Estados del formulario
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const toast = useToast();

  // 🎯 Validaciones específicas para registro
  const validateDisplayName = (name) => {
    if (!name) return 'El nombre es requerido';
    if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (name.length > 50) return 'El nombre no puede tener más de 50 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return 'Solo se permiten letras y espacios';
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Formato de email inválido';
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (password.length > 100) return 'La contraseña no puede tener más de 100 caracteres';
    if (!/(?=.*[a-z])/.test(password)) return 'Debe contener al menos una letra minúscula';
    if (!/(?=.*[A-Z])/.test(password)) return 'Debe contener al menos una letra mayúscula';
    if (!/(?=.*\d)/.test(password)) return 'Debe contener al menos un número';
    return null;
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Confirma tu contraseña';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    return null;
  };

  // 🎯 Validar campo individual
  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case 'displayName':
        error = validateDisplayName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  };

  // 🎯 Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      validateField(name, value);
    }

    // Revalidar confirmPassword si cambió password
    if (name === 'password' && touched.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  // 🎯 Manejar blur de inputs
  const handleInputBlur = (e) => {
    const { name, value } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    validateField(name, value);
  };

  // 📝 Manejar registro con email
  const handleEmailRegister = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const nameValid = validateField('displayName', formData.displayName);
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    const confirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);

    if (!nameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
      setTouched({
        displayName: true,
        email: true,
        password: true,
        confirmPassword: true
      });
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      const result = await registerWithEmail(
        formData.email,
        formData.password,
        formData.displayName
      );

      if (result.success) {
        toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${result.user.displayName}!`);
        onRegisterSuccess?.(result.user);
      } else {
        toast.error(result.error, 'Error de registro');
      }
    } catch (error) {
      console.error('Error inesperado en registro:', error);
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Manejar registro con Google
  const handleGoogleRegister = async () => {
    setLoading(true);

    try {
      const result = await loginWithGoogle();

      if (result.success) {
        toast.success(`¡Bienvenido, ${result.user.displayName}!`);
        onRegisterSuccess?.(result.user);
      } else {
        toast.error(result.error, 'Error de registro');
      }
    } catch (error) {
      console.error('Error inesperado en registro con Google:', error);
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Obtener estilos de campo según estado
  const getFieldClasses = (fieldName) => {
    const baseClasses = "w-full p-3 border rounded-lg transition-colors";

    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClasses} border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200`;
    }

    if (touched[fieldName] && !errors[fieldName] && formData[fieldName]) {
      return `${baseClasses} border-green-500 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-200`;
    }

    return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`;
  };

  // 🎯 Calcular fortaleza de contraseña
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { label: 'Muy débil', color: 'bg-red-500' },
      { label: 'Débil', color: 'bg-orange-500' },
      { label: 'Regular', color: 'bg-yellow-500' },
      { label: 'Fuerte', color: 'bg-green-500' },
      { label: 'Muy fuerte', color: 'bg-green-600' }
    ];

    return { strength, ...levels[Math.min(strength, 4)] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">📝 Crear Cuenta</h2>
          <p className="text-gray-600">Únete para gestionar tus tareas de forma efectiva</p>
        </div>

        {/* Formulario de registro */}
        <form onSubmit={handleEmailRegister} className="space-y-6">
          {/* Campo Nombre */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              👤 Nombre completo
            </label>
            <Input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={getFieldClasses('displayName')}
              placeholder="Tu nombre completo"
              disabled={loading}
              autoComplete="name"
            />
            {errors.displayName && touched.displayName && (
              <p className="mt-1 text-sm text-red-600">❌ {errors.displayName}</p>
            )}
          </div>

          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              📧 Email
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={getFieldClasses('email')}
              placeholder="tu@email.com"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">❌ {errors.email}</p>
            )}
          </div>

          {/* Campo Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              🔒 Contraseña
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={getFieldClasses('password')}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
            />

            {/* Indicador de fortaleza de contraseña */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{passwordStrength.label}</span>
                </div>
              </div>
            )}

            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-600">❌ {errors.password}</p>
            )}
          </div>

          {/* Campo Confirmar Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              🔐 Confirmar contraseña
            </label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={getFieldClasses('confirmPassword')}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">❌ {errors.confirmPassword}</p>
            )}
          </div>

          {/* Botón de registro */}
          <Button
            type="submit"
            disabled={loading || Object.values(errors).some(error => error)}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Creando cuenta...
              </>
            ) : (
              '📝 Crear Cuenta'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o regístrate con</span>
            </div>
          </div>
        </div>

        {/* Registro con Google */}
        <Button
          onClick={handleGoogleRegister}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Conectando con Google...
            </>
          ) : (
            <>
              🔍 Continuar con Google
            </>
          )}
        </Button>

        {/* Link para cambiar a login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onSwitchToLogin}
              disabled={loading}
              className="text-blue-500 hover:text-blue-600 font-medium disabled:text-gray-400"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>

        {/* Indicadores de validación */}
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <span className={formData.displayName && !errors.displayName ? 'text-green-600' : ''}>
              👤 Nombre válido
            </span>
            <span className={formData.email && !errors.email ? 'text-green-600' : ''}>
              📧 Email válido
            </span>
            <span className={formData.password && !errors.password ? 'text-green-600' : ''}>
              🔒 Contraseña fuerte
            </span>
            <span className={formData.confirmPassword && !errors.confirmPassword ? 'text-green-600' : ''}>
              🔐 Contraseñas coinciden
            </span>
          </div>
        </div>
      </div>

      {/* Sistema de notificaciones */}
      <toast.ToastContainer />
    </>
  );
};

export default RegisterForm;
```

#### Paso 3: Crear página de autenticación
> **Archivo:** `src/pages/AuthPage.jsx`
> **Acción:** Página que contiene ambos formularios

```jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useEffect } from 'react';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  // 🔄 Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      onAuthSuccess?.();
    }
  }, [isAuthenticated, onAuthSuccess]);

  // ⏳ Mostrar loading si está verificando auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Verificando autenticación...</div>
        </div>
      </div>
    );
  }

  // 🎯 Manejar éxito en autenticación
  const handleAuthSuccess = (user) => {
    console.log('✅ Autenticación exitosa:', user);
    onAuthSuccess?.(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header principal */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            📋 Task Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Organiza tus tareas de manera eficiente. Crea, edita y gestiona
            todas tus actividades en un solo lugar.
          </p>
        </div>

        {/* Contenedor de formularios */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Lado izquierdo: Información */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                ✨ Características principales
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Gestión completa de tareas</h4>
                    <p className="text-gray-600">Crea, edita, marca como completada y elimina tus tareas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Sincronización en la nube</h4>
                    <p className="text-gray-600">Accede a tus tareas desde cualquier dispositivo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Datos seguros</h4>
                    <p className="text-gray-600">Tus tareas están protegidas y son privadas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Rápido y eficiente</h4>
                    <p className="text-gray-600">Interfaz intuitiva para máxima productividad</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas o testimonios */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 rounded-lg shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-4">🎯 ¿Por qué elegir Task Manager?</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm opacity-90">Gratis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">⚡</div>
                  <div className="text-sm opacity-90">Tiempo real</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">🔒</div>
                  <div className="text-sm opacity-90">Seguro</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">📱</div>
                  <div className="text-sm opacity-90">Multi-dispositivo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho: Formulario */}
          <div>
            {isLoginMode ? (
              <LoginForm
                onSwitchToRegister={() => setIsLoginMode(false)}
                onLoginSuccess={handleAuthSuccess}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={() => setIsLoginMode(true)}
                onRegisterSuccess={handleAuthSuccess}
              />
            )}

            {/* Indicador de modo actual */}
            <div className="mt-6 text-center">
              <div className="inline-flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setIsLoginMode(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isLoginMode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🔐 Iniciar Sesión
                </button>
                <button
                  onClick={() => setIsLoginMode(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    !isLoginMode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📝 Registrarse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2024 Task Manager. Hecho con ❤️ usando React + Firebase</p>
          <p className="mt-2">
            <span className="inline-block mr-4">🔥 Firebase</span>
            <span className="inline-block mr-4">⚛️ React</span>
            <span className="inline-block mr-4">🎨 Tailwind CSS</span>
            <span className="inline-block">⚡ Vite</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
```

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**🎨 Interfaces de autenticación completas**
- ✅ Formulario de login con validación en tiempo real
- ✅ Formulario de registro con verificación de contraseña
- ✅ Página de autenticación con diseño atractivo
- ✅ Integración con servicios de Firebase Auth

**🛡️ Validación robusta**
- ✅ Validación de email, contraseña y nombres
- ✅ Indicador de fortaleza de contraseña
- ✅ Confirmación de contraseña
- ✅ Feedback visual en tiempo real

**✨ Experiencia de usuario optimizada**
- ✅ Estados de loading durante autenticación
- ✅ Mensajes de error y éxito claros
- ✅ Navegación fluida entre login y registro
- ✅ Integración con sistema de notificaciones

**🔐 Autenticación funcional**
- ✅ Login con email/password
- ✅ Registro de nuevos usuarios
- ✅ Login con Google OAuth
- ✅ Manejo de errores de Firebase Auth

### 🧪 Pruebas críticas

1. **Registro exitoso** → Crear cuenta nueva y recibir confirmación
2. **Login existente** → Iniciar sesión con credenciales válidas
3. **Validación de errores** → Probar email inválido, contraseña débil
4. **Google OAuth** → Login con cuenta de Google
5. **Navegación** → Cambiar entre login y registro sin errores

### 📸 Capturas de verificación
1. **Formulario de login** → Campos, validación, botones
2. **Formulario de registro** → Indicador de fortaleza de contraseña
3. **Página completa** → Layout responsive, información lateral
4. **Estados de loading** → Spinners durante autenticación
5. **Notificaciones Toast** → Mensajes de éxito y error

### 🔄 Próxima sesión
**Sesión 75:** Integración avanzada con Google OAuth - Configuración completa y manejo de múltiples proveedores

---

**🎯 Conceptos clave aprendidos:**
- Formularios de autenticación robustos
- Validación en tiempo real de campos
- Estados de UI para procesos asíncronos
- Integración con servicios de Firebase Auth
- Experiencia de usuario en flujos de autenticación
- Manejo de errores user-friendly
- Diseño responsive para autenticación
