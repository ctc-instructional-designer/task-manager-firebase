# Guía paso a paso: Firebase React Task Manager

Esta guía te llevará sesión por sesión para construir una aplicación completa de gestión de tareas con React y Firebase.

## 📋 Requisitos previos

- Node.js 18+ instalado
- Cuenta de Google para Firebase
- Conocimientos básicos de React
- VS Code (recomendado)

---

## 🔥 Sesión 64: Introducción a backend y Firebase

### Objetivos
- Crear proyecto en Firebase Console
- Configurar Firestore Database
- Conectar React con Firebase
- Entender arquitectura backend

### Paso 1: Crear proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Clic en "Crear proyecto"
3. Nombre: `task-manager-[tu-nombre]`
4. Deshabilita Google Analytics (por ahora)
5. Clic en "Crear proyecto"

**[📸 Captura: Pantalla de creación de proyecto Firebase]**

### Paso 2: Configurar Firestore

1. En el panel lateral, clic en "Firestore Database"
2. Clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba"
4. Elige ubicación más cercana a tu región
5. Clic en "Listo"

**[📸 Captura: Configuración de Firestore Database]**

### Paso 3: Obtener configuración de Firebase

1. Ve a "Configuración del proyecto" (⚙️)
2. Clic en "Agregar app" → "Web" (</⚡>)
3. Nombre de la app: `Task Manager`
4. **NO** marcar "Configurar Firebase Hosting"
5. Copia la configuración mostrada

**[📸 Captura: Configuración de la app web]**

### Paso 4: Crear proyecto React con Vite

```bash
npm create vite@latest firebase-task-manager -- --template react
cd firebase-task-manager
npm install
```

### Paso 5: Instalar dependencias

```bash
npm install firebase react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Paso 6: Configurar Tailwind

Edita `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Edita `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Paso 7: Configurar Firebase

Crea `src/services/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Pega aquí la configuración copiada del paso 3
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```

### Paso 8: Probar conexión

Edita `src/App.jsx`:
```jsx
import { useEffect } from 'react'
import { db } from './services/firebase'
import { collection, getDocs } from 'firebase/firestore'

function App() {
  useEffect(() => {
    // Probar conexión a Firebase
    const testConnection = async () => {
      try {
        await getDocs(collection(db, 'test'));
        console.log('✅ Conexión a Firebase exitosa');
      } catch (error) {
        console.error('❌ Error de conexión:', error);
      }
    };
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🔥 Firebase Task Manager
        </h1>
        <p className="text-gray-600">
          Configuración inicial completada. Revisa la consola del navegador.
        </p>
      </div>
    </div>
  )
}

export default App
```

### Paso 9: Ejecutar aplicación

```bash
npm run dev
```

**[📸 Captura: Aplicación funcionando con mensaje de éxito en consola]**

### ✅ Resultado esperado
- Proyecto Firebase creado y configurado
- Firestore Database habilitado
- Aplicación React conectada a Firebase
- Mensaje de éxito en consola del navegador

---

## 🔥 Sesión 65: Escritura en Firestore (addDoc)

### Objetivos
- Crear formulario para agregar tareas
- Implementar función addDoc
- Manejar estados de carga
- Ver datos guardados en Firebase Console

### Paso 1: Crear componente TaskForm

Crea `src/components/TaskForm.jsx`:
```jsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function TaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!title.trim()) {
      setMessage('El título es obligatorio');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Agregar documento a Firestore
      await addDoc(collection(db, 'tasks'), {
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Limpiar formulario
      setTitle('');
      setDescription('');
      setMessage('✅ Tarea guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      setMessage('❌ Error al guardar la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Nueva Tarea</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Estudiar React"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detalles de la tarea..."
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar Tarea'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
```

### Paso 2: Actualizar App.jsx

```jsx
import TaskForm from './components/TaskForm'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📝 Task Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus tareas con Firebase
          </p>
        </header>

        <TaskForm />
      </div>
    </div>
  )
}

export default App
```

### Paso 3: Crear directorio components

```bash
mkdir src/components
```

### Paso 4: Probar funcionalidad

1. Ejecuta `npm run dev`
2. Llena el formulario con una tarea de prueba
3. Clic en "Guardar Tarea"
4. Verifica mensaje de éxito

**[📸 Captura: Formulario funcionando con mensaje de éxito]**

### Paso 5: Verificar en Firebase Console

1. Ve a Firebase Console → Firestore Database
2. Deberías ver la colección `tasks` creada
3. Dentro, un documento con los datos de tu tarea

**[📸 Captura: Datos guardados en Firestore Console]**

### ✅ Resultado esperado
- Formulario funcional para agregar tareas
- Datos guardándose correctamente en Firestore
- Estados de carga y validación funcionando
- Confirmación visual de éxito

---

## 🔥 Sesión 66: Lectura de datos (getDocs)

### Objetivos
- Mostrar lista de tareas guardadas
- Implementar getDocs para leer datos
- Manejar estados de carga durante lectura
- Actualizar interfaz en tiempo real

### Paso 1: Crear componente TaskList

Crea `src/components/TaskList.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Crear consulta ordenada por fecha de creación
      const q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const tasksData = [];

      querySnapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setTasks(tasksData);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      setError('Error al cargar las tareas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Mis Tareas</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Mis Tareas</h2>
        <div className="bg-red-100 text-red-700 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mis Tareas</h2>
        <span className="text-sm text-gray-500">
          {tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-gray-500">No tienes tareas aún</p>
          <p className="text-sm text-gray-400 mt-1">
            Crea tu primera tarea usando el formulario de arriba
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente individual para cada tarea
function TaskItem({ task }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>📅 {formatDate(task.createdAt)}</span>
            <span className={`px-2 py-1 rounded-full ${
              task.completed
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {task.completed ? '✅ Completada' : '⏳ Pendiente'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button className="text-blue-500 hover:text-blue-700 text-sm">
            ✏️ Editar
          </button>
          <button className="text-red-500 hover:text-red-700 text-sm">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Paso 2: Actualizar App.jsx

```jsx
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📝 Task Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus tareas con Firebase
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <TaskForm />
          <TaskList />
        </div>
      </div>
    </div>
  )
}

export default App
```

### Paso 3: Probar funcionalidad

1. Recarga la aplicación
2. Deberías ver las tareas que creaste en la sesión anterior
3. Crea nuevas tareas y observa cómo aparecen (necesitarás recargar por ahora)

**[📸 Captura: Lista de tareas mostrándose correctamente]**

### Paso 4: Opcional - Tiempo real con onSnapshot

Para actualización automática, actualiza TaskList.jsx:

```jsx
import { onSnapshot } from 'firebase/firestore';

// Reemplaza el useEffect en TaskList
useEffect(() => {
  const q = query(
    collection(db, 'tasks'),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasksData = [];
    querySnapshot.forEach((doc) => {
      tasksData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    setTasks(tasksData);
    setIsLoading(false);
  });

  return () => unsubscribe();
}, []);
```

### ✅ Resultado esperado
- Lista de tareas mostrándose correctamente
- Estados de carga y error manejados
- Interfaz responsive con información detallada
- Actualización automática (si implementaste onSnapshot)

---

## 🔥 Sesión 67: Actualización de datos (updateDoc)

### Objetivos
- Implementar edición de tareas existentes
- Usar updateDoc para modificar documentos
- Crear interfaz de edición inline
- Manejar estados de edición

### Paso 1: Crear funciones de edición

Crea `src/services/taskService.js`:
```javascript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return { success: false, error: error.message };
  }
};

export const toggleTaskComplete = async (taskId, completed) => {
  return updateTask(taskId, { completed });
};
```

### Paso 2: Actualizar TaskItem con edición

Actualiza el componente TaskItem en `src/components/TaskList.jsx`:

```jsx
import { useState } from 'react';
import { updateTask, toggleTaskComplete } from '../services/taskService';

function TaskItem({ task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    setIsUpdating(true);
    const result = await updateTask(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim()
    });

    if (result.success) {
      setIsEditing(false);
    }
    setIsUpdating(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleToggleComplete = async () => {
    await toggleTaskComplete(task.id, !task.completed);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isEditing) {
    return (
      <div className="border border-blue-200 rounded-md p-4 bg-blue-50">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Título de la tarea"
            disabled={isUpdating}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción (opcional)"
            disabled={isUpdating}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isUpdating || !editTitle.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {isUpdating ? 'Guardando...' : '✅ Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleComplete}
              className="text-lg"
            >
              {task.completed ? '✅' : '⭕'}
            </button>
            <h3 className={`font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm mt-1 ml-7">{task.description}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 ml-7">
            <span>📅 {formatDate(task.createdAt)}</span>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <span>✏️ {formatDate(task.updatedAt)}</span>
            )}
            <span className={`px-2 py-1 rounded-full ${
              task.completed
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {task.completed ? 'Completada' : 'Pendiente'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={handleEdit}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ✏️ Editar
          </button>
          <button className="text-red-500 hover:text-red-700 text-sm">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Paso 3: Crear directorio services

```bash
mkdir src/services
```

### Paso 4: Probar funcionalidad de edición

1. Recarga la aplicación
2. Haz clic en "Editar" en cualquier tarea
3. Modifica el título o descripción
4. Guarda los cambios
5. Prueba también marcar/desmarcar como completada

**[📸 Captura: Modo de edición activo]**
**[📸 Captura: Tarea editada exitosamente]**

### ✅ Resultado esperado
- Edición inline funcionando correctamente
- Botón de completar/descompletar operativo
- Estados de carga durante actualización
- Cambios reflejándose inmediatamente

---

## 🔥 Sesión 68: Repaso CRUD

### Objetivos
- Consolidar todas las operaciones CRUD
- Refactorizar y organizar código
- Mejorar validación y estructura de datos
- Preparar base para eliminación

### Paso 1: Organizar servicios de Firebase

Actualiza `src/services/taskService.js` con todas las operaciones:

```javascript
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Crear nueva tarea
export const createTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return { success: false, error: error.message };
  }
};

// Leer todas las tareas
export const getTasks = async () => {
  try {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return { success: false, error: error.message };
  }
};

// Escuchar cambios en tiempo real
export const subscribeToTasks = (callback) => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(tasks);
  });
};

// Actualizar tarea
export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return { success: false, error: error.message };
  }
};

// Alternar estado completado
export const toggleTaskComplete = async (taskId, completed) => {
  return updateTask(taskId, { completed });
};

// Eliminar tarea
export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return { success: false, error: error.message };
  }
};

// Validar datos de tarea
export const validateTaskData = (title, description) => {
  const errors = [];

  if (!title || !title.trim()) {
    errors.push('El título es obligatorio');
  }

  if (title && title.trim().length > 100) {
    errors.push('El título no puede exceder 100 caracteres');
  }

  if (description && description.length > 500) {
    errors.push('La descripción no puede exceder 500 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### Paso 2: Refactorizar TaskForm

Actualiza `src/components/TaskForm.jsx`:

```jsx
import { useState } from 'react';
import { createTask, validateTaskData } from '../services/taskService';

export default function TaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar datos
    const validation = validateTaskData(title, description);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setMessage('');
    setErrors([]);

    const result = await createTask({
      title: title.trim(),
      description: description.trim()
    });

    if (result.success) {
      setTitle('');
      setDescription('');
      setMessage('✅ Tarea guardada exitosamente');
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('❌ Error al guardar la tarea: ' + result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Nueva Tarea</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.some(e => e.includes('título'))
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Ej: Estudiar React"
            disabled={isLoading}
            maxLength={100}
          />
          <div className="text-xs text-gray-500 mt-1">
            {title.length}/100 caracteres
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.some(e => e.includes('descripción'))
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Detalles de la tarea... (opcional)"
            disabled={isLoading}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {description.length}/500 caracteres
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-md">
            <ul className="text-sm">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Guardando...' : 'Guardar Tarea'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
```

### Paso 3: Refactorizar TaskList

Actualiza `src/components/TaskList.jsx` para usar el servicio refactorizado:

```jsx
import { useState, useEffect } from 'react';
import { subscribeToTasks } from '../services/taskService';
import TaskItem from './TaskItem';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToTasks((tasksData) => {
      setTasks(tasksData);
      setIsLoading(false);
      setError('');
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Mis Tareas</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mis Tareas</h2>
        <div className="text-sm text-gray-500">
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mr-2">
            {pendingTasks.length} pendientes
          </span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {completedTasks.length} completadas
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-gray-500">No tienes tareas aún</p>
          <p className="text-sm text-gray-400 mt-1">
            Crea tu primera tarea usando el formulario de arriba
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                PENDIENTES ({pendingTasks.length})
              </h3>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                COMPLETADAS ({completedTasks.length})
              </h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Paso 4: Extraer TaskItem a archivo separado

Crea `src/components/TaskItem.jsx` y mueve el componente TaskItem allí:

```jsx
import { useState } from 'react';
import { updateTask, toggleTaskComplete, validateTaskData } from '../services/taskService';

export default function TaskItem({ task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setErrors([]);
  };

  const handleSave = async () => {
    const validation = validateTaskData(editTitle, editDescription);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsUpdating(true);
    setErrors([]);

    const result = await updateTask(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim()
    });

    if (result.success) {
      setIsEditing(false);
    } else {
      setErrors([result.error]);
    }
    setIsUpdating(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setErrors([]);
  };

  const handleToggleComplete = async () => {
    await toggleTaskComplete(task.id, !task.completed);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isEditing) {
    return (
      <div className="border border-blue-200 rounded-md p-4 bg-blue-50">
        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título de la tarea"
              disabled={isUpdating}
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              {editTitle.length}/100 caracteres
            </div>
          </div>

          <div>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción (opcional)"
              disabled={isUpdating}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {editDescription.length}/500 caracteres
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm">
              {errors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isUpdating || !editTitle.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {isUpdating ? 'Guardando...' : '✅ Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleComplete}
              className="text-lg hover:scale-110 transition-transform"
            >
              {task.completed ? '✅' : '⭕'}
            </button>
            <h3 className={`font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm mt-1 ml-7">{task.description}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 ml-7">
            <span>📅 {formatDate(task.createdAt)}</span>
            {task.updatedAt && task.updatedAt.seconds !== task.createdAt?.seconds && (
              <span>✏️ {formatDate(task.updatedAt)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={handleEdit}
            className="text-blue-500 hover:text-blue-700 text-sm transition-colors"
          >
            ✏️ Editar
          </button>
          <button className="text-red-500 hover:text-red-700 text-sm transition-colors">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
```

### ✅ Resultado esperado
- Código organizado en servicios separados
- Validación robusta implementada
- Interfaz mejorada con contador de caracteres
- Separación clara entre tareas pendientes y completadas
- Base sólida para agregar eliminación

**[📸 Captura: Interfaz organizada con contadores y validación]**

---

*La guía continúa con las sesiones restantes (69-78) siguiendo el mismo formato detallado...*

## 📝 Notas para implementación

### Espacios para capturas de pantalla

En cada paso importante de la guía, he incluido marcadores como:
**[📸 Captura: Descripción de lo que debe mostrarse]**

Estos indican dónde debes agregar capturas de pantalla que muestren:
- Configuración en Firebase Console
- Estados de la aplicación funcionando
- Resultados esperados en cada paso
- Pantallas de error para referencia

### Estructura de archivos del proyecto

El proyecto final tendrá esta estructura:
```
firebase-task-manager/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── ui/
│   │   └── layout/
│   ├── hooks/
│   ├── services/
│   ├── pages/
│   ├── utils/
│   └── ...
├── package.json
└── ...
```

### Próximos pasos

Una vez completada esta guía básica, se puede extender con:
- Filtros avanzados
- Categorías de tareas
- Fechas de vencimiento
- Notificaciones
- Compartir tareas
- PWA features
