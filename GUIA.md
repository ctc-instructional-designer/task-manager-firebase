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

## 🔥 Sesión 69: Eliminación de datos (deleteDoc)

### Objetivos
- Implementar función de eliminación de tareas
- Agregar confirmación antes de eliminar
- Manejar estados de carga durante eliminación
- Actualizar interfaz automáticamente

### Paso 1: Actualizar TaskItem con eliminación

En `src/components/TaskItem.jsx`, agrega la funcionalidad de eliminación:

```jsx
import { useState } from 'react';
import { updateTask, toggleTaskComplete, validateTaskData, deleteTask } from '../services/taskService';

export default function TaskItem({ task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState([]);

  // ... código existente de edición ...

  const handleDelete = async () => {
    // Confirmación antes de eliminar
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    const result = await deleteTask(task.id);

    if (!result.success) {
      alert('Error al eliminar la tarea: ' + result.error);
      setIsDeleting(false);
    }
    // Si es exitoso, no necesitamos hacer nada más porque
    // el listener de Firestore actualizará automáticamente la lista
  };

  // ... resto del código de edición ...

  if (isEditing) {
    return (
      <div className="border border-blue-200 rounded-md p-4 bg-blue-50">
        {/* ... código de edición existente ... */}
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-md p-4 transition-all duration-200 ${
      isDeleting ? 'opacity-50 bg-red-50' : 'hover:bg-gray-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleComplete}
              disabled={isDeleting}
              className="text-lg hover:scale-110 transition-transform disabled:cursor-not-allowed"
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
            disabled={isDeleting}
            className="text-blue-500 hover:text-blue-700 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✏️ Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 text-sm transition-colors disabled:cursor-not-allowed"
          >
            {isDeleting ? '🔄 Eliminando...' : '🗑️ Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Paso 2: Mejorar confirmación de eliminación

Crea un componente de confirmación más elegante. Crea `src/components/ui/ConfirmDialog.jsx`:

```jsx
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que quieres continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-4">
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

### Paso 3: Actualizar TaskItem con el nuevo componente

```jsx
import { useState } from 'react';
import { updateTask, toggleTaskComplete, validateTaskData, deleteTask } from '../services/taskService';
import ConfirmDialog from './ui/ConfirmDialog';

export default function TaskItem({ task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState([]);

  // ... código existente ...

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);

    const result = await deleteTask(task.id);

    if (!result.success) {
      alert('Error al eliminar la tarea: ' + result.error);
      setIsDeleting(false);
    }
  };

  // ... resto del componente ...

  return (
    <>
      <div className={`border border-gray-200 rounded-md p-4 transition-all duration-200 ${
        isDeleting ? 'opacity-50 bg-red-50' : 'hover:bg-gray-50'
      }`}>
        {/* ... contenido existente ... */}

        <div className="flex gap-2 ml-4">
          <button
            onClick={handleEdit}
            disabled={isDeleting}
            className="text-blue-500 hover:text-blue-700 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 text-sm transition-colors disabled:cursor-not-allowed"
          >
            {isDeleting ? '🔄 Eliminando...' : '🗑️ Eliminar'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Tarea"
        message={`¿Estás seguro de que quieres eliminar "${task.title}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
```

### Paso 4: Probar funcionalidad

1. Ejecuta la aplicación
2. Crea algunas tareas de prueba
3. Haz clic en "Eliminar" en cualquier tarea
4. Verifica que aparezca el diálogo de confirmación
5. Confirma la eliminación y observa que la tarea desaparece

**[📸 Captura: Diálogo de confirmación de eliminación]**
**[📸 Captura: Tarea eliminándose con estado de carga]**

### ✅ Resultado esperado
- Funcionalidad de eliminación completa
- Confirmación elegante antes de eliminar
- Estados de carga durante eliminación
- Actualización automática de la interfaz

---

## 🔥 Sesión 70: Validación de entradas y manejo de errores

### Objetivos
- Mejorar validación de formularios
- Implementar manejo robusto de errores
- Agregar feedback visual para errores
- Crear sistema de notificaciones

### Paso 1: Crear sistema de notificaciones

Crea `src/components/ui/Toast.jsx`:

```jsx
import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar animación
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = 'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 max-w-sm';

    if (!isVisible) return `${baseStyles} translate-x-full opacity-0`;

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-100 border border-green-300 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-100 border border-red-300 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-100 border border-yellow-300 text-yellow-800`;
      default:
        return `${baseStyles} bg-blue-100 border border-blue-300 text-blue-800`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
```

### Paso 2: Crear hook para notificaciones

Crea `src/hooks/useToast.js`:

```js
import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message) => addToast(message, 'success');
  const showError = (message) => addToast(message, 'error');
  const showWarning = (message) => addToast(message, 'warning');
  const showInfo = (message) => addToast(message, 'info');

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
```

### Paso 3: Mejorar validación en TaskForm

Actualiza `src/components/TaskForm.jsx` con mejor validación:

```jsx
import { useState, useEffect } from 'react';
import { createTask, validateTaskData } from '../services/taskService';
import { useToast } from '../hooks/useToast';

export default function TaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { showSuccess, showError } = useToast();

  const validateForm = () => {
    const errors = {};

    // Validación de título
    if (!title.trim()) {
      errors.title = 'El título es obligatorio';
    } else if (title.trim().length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres';
    } else if (title.trim().length > 100) {
      errors.title = 'El título no puede exceder 100 caracteres';
    }

    // Validación de descripción
    if (description.length > 500) {
      errors.description = 'La descripción no puede exceder 500 caracteres';
    }

    // Validación adicional de contenido
    if (title.trim() && !/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\d\-_.,:;!?()]+$/.test(title.trim())) {
      errors.title = 'El título contiene caracteres no válidos';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createTask({
        title: title.trim(),
        description: description.trim()
      });

      if (result.success) {
        setTitle('');
        setDescription('');
        setFieldErrors({});
        showSuccess('Tarea creada exitosamente');
      } else {
        showError('Error al crear la tarea: ' + result.error);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      showError('Error inesperado al crear la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (fieldErrors.title) {
      setFieldErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (fieldErrors.description) {
      setFieldErrors(prev => ({ ...prev, description: '' }));
    }
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
            onChange={handleTitleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.title
                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Ej: Estudiar React y Firebase"
            disabled={isLoading}
            maxLength={100}
            autoComplete="off"
          />
          <div className="flex justify-between mt-1">
            <div className="text-xs text-red-600">
              {fieldErrors.title}
            </div>
            <div className={`text-xs ${
              title.length > 90 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {title.length}/100 caracteres
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.description
                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Detalles adicionales de la tarea... (opcional)"
            disabled={isLoading}
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <div className="text-xs text-red-600">
              {fieldErrors.description}
            </div>
            <div className={`text-xs ${
              description.length > 450 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {description.length}/500 caracteres
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            'Guardar Tarea'
          )}
        </button>
      </form>
    </div>
  );
}
```

### ✅ Resultado esperado
- Validación robusta con feedback visual
- Sistema de notificaciones funcionando
- Manejo de errores mejorado
- Experiencia de usuario más pulida

---

## 🔥 Sesión 71: Reglas de seguridad y estructura de Firestore

### Objetivos
- Configurar reglas de Firestore para seguridad
- Implementar aislamiento de datos por usuario
- Entender estructura de colecciones
- Configurar permisos de lectura/escritura

### Paso 1: Entender la estructura de datos

Primero, vamos a revisar cómo deben estructurarse nuestros documentos en Firestore:

```javascript
// Estructura de una tarea en Firestore
{
  id: "documento_generado_automaticamente",
  title: "Estudiar Firebase",
  description: "Aprender reglas de seguridad y autenticación",
  completed: false,
  userId: "uid_del_usuario_autenticado", // ¡IMPORTANTE!
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Paso 2: Configurar reglas de Firestore

Ve a Firebase Console → Firestore Database → Rules y configura las siguientes reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para la colección de tareas
    match /tasks/{taskId} {
      // Permitir lectura solo al usuario propietario
      allow read: if request.auth != null &&
                     request.auth.uid == resource.data.userId;

      // Permitir escritura solo al usuario propietario
      allow write: if request.auth != null &&
                      request.auth.uid == resource.data.userId;

      // Permitir crear solo si el usuario está autenticado y
      // es el propietario de la tarea que está creando
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.userId &&
                       validateTaskData(request.resource.data);
    }

    // Función para validar los datos de la tarea
    function validateTaskData(data) {
      return data.keys().hasAll(['title', 'userId', 'completed']) &&
             data.title is string &&
             data.title.size() > 0 &&
             data.title.size() <= 100 &&
             data.userId is string &&
             data.completed is bool &&
             ((!('description' in data)) || (data.description is string && data.description.size() <= 500));
    }
  }
}
```

**[📸 Captura: Configuración de reglas en Firebase Console]**

### Paso 3: Actualizar servicios para incluir userId

Actualiza `src/services/taskService.js` para incluir userId en todas las operaciones:

```javascript
import { getCurrentUser } from './authService';

// Crear nueva tarea (actualizado)
export const createTask = async (taskData) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      userId: user.uid, // ¡Incluir userId!
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

// Leer tareas del usuario actual (actualizado)
export const subscribeToTasks = (callback) => {
  const user = getCurrentUser();
  if (!user) {
    console.warn('Usuario no autenticado');
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', user.uid), // Filtrar por usuario
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(tasks);
  }, (error) => {
    console.error('Error al escuchar tareas:', error);
    callback([]);
  });
};
```

### Paso 4: Verificar permisos

Crea `src/utils/testFirestoreRules.js` para probar las reglas:

```javascript
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { getCurrentUser } from '../services/authService';

export const testFirestorePermissions = async () => {
  const user = getCurrentUser();

  if (!user) {
    console.error('❌ Usuario no autenticado para las pruebas');
    return;
  }

  console.log('🧪 Iniciando pruebas de permisos de Firestore...');
  console.log('👤 Usuario actual:', user.uid);

  try {
    // Prueba 1: Crear una tarea
    console.log('📝 Prueba 1: Crear tarea...');
    const testTask = {
      title: 'Tarea de prueba',
      description: 'Prueba de reglas de Firestore',
      userId: user.uid,
      completed: false
    };

    const docRef = await addDoc(collection(db, 'tasks'), testTask);
    console.log('✅ Prueba 1 exitosa: Tarea creada con ID:', docRef.id);

    // Prueba 2: Leer tareas del usuario
    console.log('📖 Prueba 2: Leer tareas del usuario...');
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    console.log('✅ Prueba 2 exitosa: Se encontraron', querySnapshot.size, 'tareas');

    // Prueba 3: Intentar crear tarea con userId incorrecto (debe fallar)
    console.log('🚫 Prueba 3: Crear tarea con userId incorrecto...');
    try {
      await addDoc(collection(db, 'tasks'), {
        ...testTask,
        userId: 'usuario_falso'
      });
      console.log('❌ Prueba 3 falló: No debería permitir crear con userId incorrecto');
    } catch (error) {
      console.log('✅ Prueba 3 exitosa: Se rechazó correctamente la creación:', error.code);
    }

    console.log('🎉 Todas las pruebas de permisos completadas');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
};
```

### Paso 5: Probar la seguridad

Agrega un botón de prueba temporal en TaskList:

```jsx
// En TaskList.jsx, agrega temporalmente:
import { testFirestorePermissions } from '../utils/testFirestoreRules';

// En el componente, agrega:
<button
  onClick={testFirestorePermissions}
  className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
>
  🧪 Probar Reglas de Firestore
</button>
```

**[📸 Captura: Resultados de las pruebas en consola]**

### ✅ Resultado esperado
- Reglas de Firestore configuradas correctamente
- Datos aislados por usuario
- Validación de datos en el servidor
- Pruebas de seguridad funcionando

---

## 🔥 Sesión 72: Avance de proyecto

### Objetivos
- Verificar todas las funcionalidades implementadas
- Revisar la estructura del proyecto
- Optimizar el código existente
- Preparar para autenticación

### Paso 1: Auditoría del proyecto actual

Crea `src/utils/projectAudit.js`:

```javascript
export const auditProject = () => {
  console.log('🔍 AUDITORÍA DEL PROYECTO FIREBASE TASK MANAGER');
  console.log('================================================');

  // ✅ Funcionalidades implementadas
  const implementedFeatures = [
    '✅ Configuración de Firebase',
    '✅ Conexión a Firestore',
    '✅ Crear tareas (addDoc)',
    '✅ Leer tareas (getDocs/onSnapshot)',
    '✅ Actualizar tareas (updateDoc)',
    '✅ Eliminar tareas (deleteDoc)',
    '✅ Validación de formularios',
    '✅ Manejo de errores',
    '✅ Estados de carga',
    '✅ Interfaz responsive',
    '✅ Componentes reutilizables',
    '✅ Reglas de Firestore',
    '✅ Sistema de notificaciones'
  ];

  console.log('\n📋 FUNCIONALIDADES IMPLEMENTADAS:');
  implementedFeatures.forEach(feature => console.log(feature));

  // 🔄 Pendientes
  const pendingFeatures = [
    '🔄 Autenticación con email',
    '🔄 Autenticación con Google',
    '🔄 Control de sesión',
    '🔄 Rutas privadas',
    '🔄 Filtros por usuario',
    '🔄 Optimización final'
  ];

  console.log('\n🔄 FUNCIONALIDADES PENDIENTES:');
  pendingFeatures.forEach(feature => console.log(feature));

  // 📁 Estructura de archivos
  console.log('\n📁 ESTRUCTURA ACTUAL:');
  console.log(`
src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   ├── Toast.jsx
│   │   └── ConfirmDialog.jsx
│   ├── TaskForm.jsx
│   ├── TaskList.jsx
│   └── TaskItem.jsx
├── services/
│   ├── firebase.js
│   └── taskService.js
├── hooks/
│   └── useToast.js
├── utils/
│   └── testFirestoreRules.js
├── App.jsx
└── main.jsx
  `);

  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Implementar autenticación');
  console.log('2. Crear rutas protegidas');
  console.log('3. Filtrar datos por usuario');
  console.log('4. Optimizar rendimiento');
  console.log('5. Pulir interfaz de usuario');
};
```

### Paso 2: Refactorizar App.jsx

Prepara la estructura para autenticación:

```jsx
import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Toast from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { auditProject } from './utils/projectAudit';

function App() {
  const { toasts, removeToast } = useToast();
  const [user, setUser] = useState(null); // Para próxima sesión
  const [loading, setLoading] = useState(true); // Para próxima sesión

  useEffect(() => {
    // Ejecutar auditoría en desarrollo
    if (import.meta.env.DEV) {
      auditProject();
    }

    // Simular carga inicial (será reemplazado por autenticación)
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            📝 Task Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus tareas con Firebase
          </p>

          {/* Status indicator */}
          <div className="mt-4 flex justify-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              🔄 CRUD Completo
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              🔒 Seguridad Configurada
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              ⏳ Auth Pendiente
            </span>
          </div>
        </header>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <TaskForm />

            {/* Info panel */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                🎯 Estado del Proyecto
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ CRUD de tareas implementado</li>
                <li>✅ Validación y manejo de errores</li>
                <li>✅ Reglas de Firestore configuradas</li>
                <li>🔄 Próximo: Autenticación de usuarios</li>
              </ul>
            </div>
          </div>

          <div>
            <TaskList />
          </div>
        </div>

        {/* Toast notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
```

### Paso 3: Crear componente de estadísticas

Crea `src/components/TaskStats.jsx`:

```jsx
import { useMemo } from 'react';

export default function TaskStats({ tasks }) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }, [tasks]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">📊 Estadísticas</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completadas</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
          <div className="text-sm text-gray-600">Progreso</div>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso general</span>
            <span>{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### ✅ Resultado esperado
- Proyecto auditado y organizado
- Estructura preparada para autenticación
- Estadísticas visuales implementadas
- Base sólida para las siguientes sesiones

---

## 🔥 Sesión 73: Autenticación con email

### Objetivos
- Implementar registro con email/password
- Crear formulario de login
- Manejar estados de autenticación
- Configurar rutas protegidas

### Paso 1: Configurar autenticación en Firebase

1. Ve a Firebase Console → Authentication
2. Clic en "Comenzar"
3. En la pestaña "Sign-in method"
4. Habilita "Correo electrónico/contraseña"
5. Guarda los cambios

**[📸 Captura: Configuración de autenticación en Firebase Console]**

### Paso 2: Crear servicio de autenticación

Crea `src/services/authService.js`:

```javascript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';

// Registrar usuario con email y password
export const registerWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Actualizar el perfil con el nombre
    if (name) {
      await updateProfile(userCredential.user, {
        displayName: name
      });
    }

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error al registrar:', error);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

// Iniciar sesión con email y password
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
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
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada.';
    case 'auth/user-not-found':
      return 'No existe una cuenta con este email.';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este email.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del email no es válido.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Intenta más tarde.';
    default:
      return 'Error de autenticación. Intenta nuevamente.';
  }
};
```

### Paso 3: Crear hook de autenticación

Crea `src/hooks/useAuth.js`:

```javascript
import { useState, useEffect } from 'react';
import { onAuthChange } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
};
```

### Paso 4: Crear formularios de autenticación

Crea `src/components/auth/LoginForm.jsx`:

```jsx
import { useState } from 'react';
import { loginWithEmail } from '../../services/authService';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginWithEmail(email, password);

    if (result.success) {
      onSuccess && onSuccess(result.user);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          disabled={loading}
        />

        <Input
          type="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
        />

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          Iniciar Sesión
        </Button>
      </form>
    </div>
  );
}
```

Crea `src/components/auth/RegisterForm.jsx`:

```jsx
import { useState } from 'react';
import { registerWithEmail } from '../../services/authService';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function RegisterForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const result = await registerWithEmail(
      formData.email,
      formData.password,
      formData.name
    );

    if (result.success) {
      onSuccess && onSuccess(result.user);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          name="name"
          label="Nombre completo"
          value={formData.name}
          onChange={handleChange}
          placeholder="Tu nombre"
          required
          disabled={loading}
        />

        <Input
          type="email"
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          required
          disabled={loading}
        />

        <Input
          type="password"
          name="password"
          label="Contraseña"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={loading}
        />

        <Input
          type="password"
          name="confirmPassword"
          label="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={loading}
        />

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          Crear Cuenta
        </Button>
      </form>
    </div>
  );
}
```

### Paso 5: Crear página de autenticación

Crea `src/pages/AuthPage.jsx`:

```jsx
import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Button from '../components/ui/Button';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleAuthSuccess = (user) => {
    console.log('Usuario autenticado:', user);
    // La redirección se manejará automáticamente por el estado de autenticación
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">📝 Task Manager</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona tus tareas de forma segura
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isLogin ? (
          <LoginForm onSuccess={handleAuthSuccess} />
        ) : (
          <RegisterForm onSuccess={handleAuthSuccess} />
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </p>
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="mt-1"
          >
            {isLogin ? 'Crear cuenta nueva' : 'Iniciar sesión'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### ✅ Resultado esperado
- Autenticación con email implementada
- Formularios de login y registro funcionando
- Estados de autenticación manejados correctamente
- Base preparada para rutas protegidas

**[📸 Captura: Formulario de login funcionando]**
**[📸 Captura: Formulario de registro funcionando]**

---

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
---

## 🔥 Sesión 74: Autenticación con Google

### Objetivos
- Permitir login y registro con Google
- Integrar OAuth 2.0 en el frontend
- Unificar usuarios de email y Google

### Paso 1: Habilitar Google en Firebase
1. Ve a Firebase Console → Authentication → Sign-in method
2. Habilita "Google"
3. Configura el correo de soporte y guarda

**[📸 Captura: Habilitar Google en Firebase]**

### Paso 2: Actualizar servicio de autenticación
Agrega a `src/services/authService.js`:

```js
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// ...existing code...

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};
```

### Paso 3: Agregar botón de Google en LoginForm y RegisterForm
En ambos componentes, agrega:

```jsx
<Button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full bg-red-500 hover:bg-red-600 mt-2"
  loading={loading}
  disabled={loading}
>
  Iniciar sesión con Google
</Button>
```

Y la función:

```js
const handleGoogleLogin = async () => {
  setLoading(true);
  setError("");
  const result = await loginWithGoogle();
  if (result.success) {
    onSuccess && onSuccess(result.user);
  } else {
    setError(result.error);
  }
  setLoading(false);
};
```

**[📸 Captura: Botón de Google funcionando]**

### ✅ Resultado esperado
- Login y registro con Google funcionando
- Usuarios unificados en Firebase
- Experiencia de autenticación moderna

---
Una vez completada esta guía básica, se puede extender con:
- Filtros avanzados
- Categorías de tareas
- Fechas de vencimiento
- Notificaciones
- Compartir tareas
- PWA features
