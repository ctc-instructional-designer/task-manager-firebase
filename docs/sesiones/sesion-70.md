## 🛡️ Sesión 70: Validación de entradas y manejo de errores

### 🎯 Objetivos de la sesión
- Implementar validación robusta de datos de entrada
- Crear sistema centralizado de manejo de errores
- Mejorar experiencia de usuario con mensajes claros
- Prevenir datos corruptos en Firestore
- Establecer reglas de validación consistentes

### 📋 Contenidos clave
✅ **Validación frontend** - Prevenir envío de datos inválidos
✅ **Manejo de errores** - Sistema robusto y user-friendly
✅ **Feedback visual** - Estados de loading/error/success

---

### 🏗️ Implementación paso a paso

#### Paso 1: Crear utilidad de validación
> **Archivo:** `src/utils/validation.js`
> **Acción:** Sistema centralizado de validación

```javascript
// 🎯 REGLAS DE VALIDACIÓN PARA TAREAS
export const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    REQUIRED: true
  },
  DESCRIPTION: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 500,
    REQUIRED: false
  }
};

// 🎯 MENSAJES DE ERROR ESTANDARIZADOS
export const ERROR_MESSAGES = {
  TITLE_REQUIRED: 'El título es obligatorio',
  TITLE_TOO_SHORT: 'El título debe tener al menos 1 carácter',
  TITLE_TOO_LONG: `El título no puede tener más de ${VALIDATION_RULES.TITLE.MAX_LENGTH} caracteres`,
  TITLE_INVALID: 'El título contiene caracteres no válidos',

  DESCRIPTION_TOO_LONG: `La descripción no puede tener más de ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} caracteres`,
  DESCRIPTION_INVALID: 'La descripción contiene caracteres no válidos',

  GENERIC_REQUIRED: 'Este campo es obligatorio',
  GENERIC_INVALID: 'El valor ingresado no es válido'
};

// 🎯 FUNCIONES DE VALIDACIÓN

/**
 * Valida el título de una tarea
 * @param {string} title - El título a validar
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateTitle = (title) => {
  // ✅ Verificar que existe y no está vacío
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: ERROR_MESSAGES.TITLE_REQUIRED };
  }

  // 🧹 Limpiar espacios extra
  const cleanTitle = title.trim();

  // ✅ Verificar longitud mínima
  if (cleanTitle.length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.TITLE_TOO_SHORT };
  }

  // ✅ Verificar longitud máxima
  if (cleanTitle.length > VALIDATION_RULES.TITLE.MAX_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.TITLE_TOO_LONG };
  }

  // 🚫 Verificar caracteres no permitidos (ejemplo: solo texto básico)
  const invalidCharsRegex = /[<>{}[\]\\\/]/;
  if (invalidCharsRegex.test(cleanTitle)) {
    return { isValid: false, error: ERROR_MESSAGES.TITLE_INVALID };
  }

  return { isValid: true, error: null, cleanValue: cleanTitle };
};

/**
 * Valida la descripción de una tarea
 * @param {string} description - La descripción a validar
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateDescription = (description) => {
  // ✅ La descripción es opcional
  if (!description || description === '') {
    return { isValid: true, error: null, cleanValue: '' };
  }

  // ✅ Verificar tipo
  if (typeof description !== 'string') {
    return { isValid: false, error: ERROR_MESSAGES.DESCRIPTION_INVALID };
  }

  // 🧹 Limpiar espacios extra
  const cleanDescription = description.trim();

  // ✅ Verificar longitud máxima
  if (cleanDescription.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.DESCRIPTION_TOO_LONG };
  }

  // 🚫 Verificar caracteres no permitidos
  const invalidCharsRegex = /[<>{}[\]\\]/;
  if (invalidCharsRegex.test(cleanDescription)) {
    return { isValid: false, error: ERROR_MESSAGES.DESCRIPTION_INVALID };
  }

  return { isValid: true, error: null, cleanValue: cleanDescription };
};

/**
 * Valida un objeto completo de tarea
 * @param {object} taskData - Los datos de la tarea
 * @returns {object} { isValid: boolean, errors: object, cleanData: object }
 */
export const validateTaskData = (taskData) => {
  const errors = {};
  let isValid = true;
  const cleanData = {};

  // ✅ Validar título
  const titleValidation = validateTitle(taskData.title);
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error;
    isValid = false;
  } else {
    cleanData.title = titleValidation.cleanValue;
  }

  // ✅ Validar descripción
  const descriptionValidation = validateDescription(taskData.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.error;
    isValid = false;
  } else {
    cleanData.description = descriptionValidation.cleanValue;
  }

  return { isValid, errors, cleanData };
};

/**
 * Sanitiza y normaliza datos de entrada
 * @param {object} data - Datos a sanitizar
 * @returns {object} Datos limpios
 */
export const sanitizeTaskData = (data) => {
  return {
    title: (data.title || '').toString().trim(),
    description: (data.description || '').toString().trim(),
    completed: Boolean(data.completed)
  };
};

// 🎯 VALIDADORES ESPECÍFICOS ADICIONALES

/**
 * Valida ID de tarea
 * @param {string} taskId - ID a validar
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateTaskId = (taskId) => {
  if (!taskId || typeof taskId !== 'string') {
    return { isValid: false, error: 'ID de tarea inválido' };
  }

  // ✅ Verificar formato básico de Firebase ID
  if (taskId.length < 10 || taskId.length > 25) {
    return { isValid: false, error: 'Formato de ID inválido' };
  }

  return { isValid: true, error: null };
};

/**
 * Valida estado booleano
 * @param {any} completed - Estado a validar
 * @returns {object} { isValid: boolean, error: string, cleanValue: boolean }
 */
export const validateCompleted = (completed) => {
  // ✅ Convertir a boolean de manera segura
  let cleanValue = false;

  if (typeof completed === 'boolean') {
    cleanValue = completed;
  } else if (typeof completed === 'string') {
    cleanValue = completed.toLowerCase() === 'true';
  } else if (typeof completed === 'number') {
    cleanValue = completed === 1;
  }

  return { isValid: true, error: null, cleanValue };
};
```

#### Paso 2: Crear sistema de notificaciones
> **Archivo:** `src/components/ui/Toast.jsx`
> **Acción:** Sistema de notificaciones para feedback

```jsx
import { useState, useEffect } from 'react';

// 🎯 Componente Toast individual
const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getToastStyles = () => {
    const baseClasses = "mb-2 p-4 rounded shadow-lg max-w-sm transform transition-all";

    switch (toast.type) {
      case 'success':
        return `${baseClasses} bg-green-500 text-white`;
      case 'error':
        return `${baseClasses} bg-red-500 text-white`;
      case 'warning':
        return `${baseClasses} bg-yellow-500 text-white`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-500 text-white`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info':
      default: return 'ℹ️';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">{getIcon()}</span>
          <div>
            {toast.title && (
              <div className="font-semibold">{toast.title}</div>
            )}
            <div className={toast.title ? 'text-sm' : ''}>{toast.message}</div>
          </div>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-4 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// 🎯 Contenedor de Toasts
const ToastContainer = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemoveToast}
        />
      ))}
    </div>
  );
};

// 🎯 Hook para manejo de toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, title = null, duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, type, message, title, duration };

    setToasts(prev => [...prev, toast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  // 🎯 Métodos de conveniencia
  const success = (message, title = null) => addToast('success', message, title);
  const error = (message, title = null) => addToast('error', message, title);
  const warning = (message, title = null) => addToast('warning', message, title);
  const info = (message, title = null) => addToast('info', message, title);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
  };
};

export default ToastContainer;
```

#### Paso 3: Mejorar TaskForm con validación
> **Archivo:** `src/components/TaskForm.jsx`
> **Acción:** Validación en tiempo real y feedback

```jsx
import { useState } from 'react';
import { createTask } from '../services/taskService';
import { validateTaskData, sanitizeTaskData } from '../utils/validation';
import { useToast } from './ui/Toast';

const TaskForm = ({ onTaskCreated }) => {
  // 🎯 Estados del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // 🎯 Sistema de notificaciones
  const toast = useToast();

  // 🎯 Validación en tiempo real
  const validateField = (name, value) => {
    const tempData = { ...formData, [name]: value };
    const validation = validateTaskData(tempData);

    setErrors(prev => ({
      ...prev,
      [name]: validation.errors[name] || null
    }));

    return !validation.errors[name];
  };

  // 🎯 Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // ✅ Validar solo si el campo ya fue tocado
    if (touched[name]) {
      validateField(name, value);
    }
  };

  // 🎯 Manejar blur (cuando el usuario sale del campo)
  const handleInputBlur = (e) => {
    const { name, value } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    validateField(name, value);
  };

  // 🎯 Envío del formulario con validación completa
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🧹 Sanitizar datos antes de validar
    const sanitizedData = sanitizeTaskData(formData);

    // ✅ Validación completa
    const validation = validateTaskData(sanitizedData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({ title: true, description: true });

      // 📢 Mostrar error general
      toast.error('Por favor corrige los errores en el formulario', 'Formulario inválido');
      return;
    }

    // 🚀 Enviar datos limpios
    setLoading(true);
    try {
      const result = await createTask(validation.cleanData);

      if (result.success) {
        // 🎉 Éxito
        toast.success(`Tarea "${validation.cleanData.title}" creada exitosamente`);

        // 🧹 Limpiar formulario
        setFormData({ title: '', description: '' });
        setErrors({});
        setTouched({});

        // 🔄 Notificar al padre
        onTaskCreated?.();
      } else {
        // ❌ Error del servidor
        toast.error(result.error, 'Error al crear tarea');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      toast.error('Ocurrió un error inesperado', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Obtener estado visual del campo
  const getFieldClasses = (fieldName) => {
    const baseClasses = "w-full p-3 border rounded transition-colors";

    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClasses} border-red-500 bg-red-50 focus:border-red-500 focus:outline-none`;
    }

    if (touched[fieldName] && !errors[fieldName] && formData[fieldName]) {
      return `${baseClasses} border-green-500 bg-green-50 focus:border-green-500 focus:outline-none`;
    }

    return `${baseClasses} border-gray-300 focus:border-blue-500 focus:outline-none`;
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">✍️ Nueva Tarea</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              📝 Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={getFieldClasses('title')}
              placeholder="¿Qué necesitas hacer?"
              disabled={loading}
              maxLength={100}
            />

            {/* Contador de caracteres */}
            <div className="flex justify-between mt-1">
              <div>
                {errors.title && touched.title && (
                  <span className="text-red-500 text-sm">❌ {errors.title}</span>
                )}
              </div>
              <span className="text-gray-400 text-sm">
                {formData.title.length}/100
              </span>
            </div>
          </div>

          {/* Campo Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              📄 Descripción (opcional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`${getFieldClasses('description')} h-20 resize-none`}
              placeholder="Detalles adicionales..."
              disabled={loading}
              maxLength={500}
            />

            {/* Contador de caracteres */}
            <div className="flex justify-between mt-1">
              <div>
                {errors.description && touched.description && (
                  <span className="text-red-500 text-sm">❌ {errors.description}</span>
                )}
              </div>
              <span className="text-gray-400 text-sm">
                {formData.description.length}/500
              </span>
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading || Object.keys(errors).some(key => errors[key])}
            className={`w-full py-3 px-4 rounded font-medium transition-colors ${
              loading || Object.keys(errors).some(key => errors[key])
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Creando tarea...
              </>
            ) : (
              '✅ Crear tarea'
            )}
          </button>
        </form>

        {/* Indicadores de validación */}
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className={formData.title && !errors.title ? 'text-green-600' : 'text-gray-400'}>
              ✅ Título válido
            </span>
            <span className={formData.description && !errors.description ? 'text-green-600' : 'text-gray-400'}>
              📄 Descripción opcional
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor de notificaciones */}
      <toast.ToastContainer />
    </>
  );
};

export default TaskForm;
```

#### Paso 4: Mejorar servicios con validación
> **Archivo:** `src/services/taskService.js`
> **Acción:** Validación a nivel de servicio

```javascript
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { validateTaskData, validateTaskId, sanitizeTaskData } from '../utils/validation';

const COLLECTION_NAME = 'tasks';

// 🎯 MANEJO CENTRALIZADO DE ERRORES FIREBASE
const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);

  // 🔍 Mapear códigos de error específicos
  const errorMappings = {
    'permission-denied': 'No tienes permisos para realizar esta acción',
    'unavailable': 'Servicio no disponible, intenta más tarde',
    'not-found': 'El recurso solicitado no existe',
    'already-exists': 'El recurso ya existe',
    'resource-exhausted': 'Se ha excedido la cuota de uso',
    'unauthenticated': 'Debes iniciar sesión para continuar',
    'deadline-exceeded': 'La operación tardó demasiado tiempo',
    'invalid-argument': 'Los datos proporcionados no son válidos'
  };

  return errorMappings[error.code] || error.message || 'Error desconocido';
};

// ✅ Crear tarea con validación completa
export const createTask = async (taskData) => {
  try {
    console.log('🚀 Creando tarea con validación...', taskData);

    // 🧹 Sanitizar datos de entrada
    const sanitizedData = sanitizeTaskData(taskData);

    // ✅ Validar datos sanitizados
    const validation = validateTaskData(sanitizedData);
    if (!validation.isValid) {
      console.warn('❌ Datos inválidos:', validation.errors);
      return {
        success: false,
        error: 'Datos inválidos: ' + Object.values(validation.errors).join(', '),
        validationErrors: validation.errors
      };
    }

    // 📦 Preparar documento con metadata
    const taskDocument = {
      ...validation.cleanData,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 🔥 Guardar en Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), taskDocument);

    console.log('✅ Tarea creada exitosamente:', docRef.id);
    return {
      success: true,
      data: {
        id: docRef.id,
        ...validation.cleanData,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

  } catch (error) {
    const friendlyError = handleFirebaseError(error);
    console.error('❌ Error al crear tarea:', friendlyError);
    return { success: false, error: friendlyError };
  }
};

// ✅ Actualizar tarea con validación
export const updateTask = async (taskId, updates) => {
  try {
    console.log('📝 Actualizando tarea con validación...', { taskId, updates });

    // ✅ Validar ID de tarea
    const idValidation = validateTaskId(taskId);
    if (!idValidation.isValid) {
      return { success: false, error: idValidation.error };
    }

    // 🧹 Sanitizar actualizaciones
    const sanitizedUpdates = sanitizeTaskData(updates);

    // ✅ Validar datos (solo campos que se están actualizando)
    const validation = validateTaskData({
      title: sanitizedUpdates.title || 'Título temporal', // Para validación
      description: sanitizedUpdates.description || '',
      completed: sanitizedUpdates.completed
    });

    if (!validation.isValid) {
      return {
        success: false,
        error: 'Datos inválidos: ' + Object.values(validation.errors).join(', '),
        validationErrors: validation.errors
      };
    }

    // 📦 Preparar actualizaciones limpias
    const cleanUpdates = {
      ...sanitizedUpdates,
      updatedAt: serverTimestamp()
    };

    // 🔥 Actualizar en Firestore
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, cleanUpdates);

    console.log('✅ Tarea actualizada exitosamente');
    return {
      success: true,
      data: { id: taskId, ...cleanUpdates, updatedAt: new Date() }
    };

  } catch (error) {
    const friendlyError = handleFirebaseError(error);
    console.error('❌ Error al actualizar tarea:', friendlyError);
    return { success: false, error: friendlyError };
  }
};

// ✅ Eliminar tarea con validación
export const deleteTask = async (taskId) => {
  try {
    console.log('🗑️ Eliminando tarea con validación...', taskId);

    // ✅ Validar ID de tarea
    const idValidation = validateTaskId(taskId);
    if (!idValidation.isValid) {
      return { success: false, error: idValidation.error };
    }

    // 🔥 Eliminar de Firestore
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await deleteDoc(taskRef);

    console.log('✅ Tarea eliminada exitosamente');
    return { success: true, deletedId: taskId };

  } catch (error) {
    const friendlyError = handleFirebaseError(error);
    console.error('❌ Error al eliminar tarea:', friendlyError);
    return { success: false, error: friendlyError };
  }
};

// ✅ Obtener tareas (sin cambios, ya es robusto)
export const getTasks = async () => {
  try {
    console.log('📖 Obteniendo tareas...');

    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const tasks = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      });
    });

    console.log(`✅ ${tasks.length} tareas obtenidas`);
    return { success: true, data: tasks };

  } catch (error) {
    const friendlyError = handleFirebaseError(error);
    console.error('❌ Error al obtener tareas:', friendlyError);
    return { success: false, error: friendlyError, data: [] };
  }
};

// 🎯 Funciones de utilidad con validación
export const toggleTaskComplete = async (taskId, currentStatus) => {
  return await updateTask(taskId, { completed: !currentStatus });
};

export const updateTaskText = async (taskId, title, description) => {
  return await updateTask(taskId, { title, description });
};
```

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**🛡️ Validación robusta**
- ✅ Sistema centralizado de validación
- ✅ Sanitización automática de datos
- ✅ Validación en tiempo real
- ✅ Mensajes de error claros y específicos

**🎯 Experiencia de usuario mejorada**
- ✅ Feedback visual inmediato
- ✅ Sistema de notificaciones (Toast)
- ✅ Contadores de caracteres
- ✅ Estados de loading/error/success

**🔒 Seguridad de datos**
- ✅ Prevención de datos corruptos
- ✅ Manejo centralizado de errores Firebase
- ✅ Validación tanto frontend como en servicios

### 🧪 Pruebas críticas

1. **Formulario vacío** → Debe mostrar error de título requerido
2. **Título muy largo** → Debe limitarse a 100 caracteres
3. **Caracteres especiales** → Debe rechazar <>{}[]\
4. **Conexión fallida** → Debe mostrar error user-friendly
5. **Validación en tiempo real** → Errores aparecen al salir del campo

### 📸 Capturas de verificación
1. **Campos con validación** → Bordes rojos/verdes
2. **Contadores de caracteres** funcionando
3. **Toasts de notificación** apareciendo
4. **Formulario bloqueado** con datos inválidos
5. **Console logs** mostrando validaciones

### 🔄 Próxima sesión
**Sesión 71:** Reglas de seguridad de Firestore - Protegeremos los datos a nivel de base de datos

---

**🎯 Conceptos clave aprendidos:**
- Validación de entrada robusta
- Sanitización de datos de usuario
- Sistema de notificaciones Toast
- Manejo centralizado de errores Firebase
- Validación en tiempo real vs batch
- Estados visuales de formularios
- Prevención de datos corruptos
