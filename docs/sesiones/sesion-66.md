## 🔥 Sesión 66: Lectura de datos (getDocs)

### 🎯 Objetivos de la sesión
- Comprender operación READ del CRUD
- Implementar `getDocs` para obtener datos de Firestore
- Mostrar lista de tareas en tiempo real
- Manejar estados de carga y datos vacíos
- Crear componente reutilizable para tareas

### 📋 Contenidos clave
✅ **Mostrar datos desde la base en tiempo real**
✅ **Función getDocs** - Leer documentos de colección

---

### 🏗️ Implementación paso a paso

#### Paso 1: Comprender operación READ
> **Concepto:** Obtener datos de Firestore y mostrarlos en React

```javascript
// 🎯 FLUJO DE LECTURA DE DATOS
Frontend (React)     ←     Backend (Firebase)     ←     Database (Firestore)
┌─────────────┐            ┌─────────────────┐        ┌──────────────────┐
│ Lista UI    │   getDocs  │ Consulta        │        │ Colección "tasks"│
│ - TaskItem  │ ←───────── │ - Filtros       │ ←───── │ - doc1: {...}    │
│ - TaskItem  │            │ - Ordenamiento  │        │ - doc2: {...}    │
│ - [Empty]   │            │ - Límites       │        │ - doc3: {...}    │
└─────────────┘            └─────────────────┘        └──────────────────┘
```

**¿Qué necesitamos?**
- 📖 **Función getDocs** para leer datos
- 🧩 **Componente TaskList** para mostrar
- ⚡ **Estado** para almacenar tareas
- 🔄 **useEffect** para cargar al montar

#### Paso 2: Agregar función de lectura al servicio
> **Archivo:** `src/services/taskService.js`
> **Acción:** Añadir función `getTasks`

```javascript
import {
  collection,
  addDoc,
  getDocs,          // 👈 Nueva importación
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// 📝 Crear tarea (ya existe)
export const createTask = async (taskData) => {
  // ... código anterior
};

// 📖 Leer todas las tareas
export const getTasks = async () => {
  try {
    console.log('📖 Obteniendo tareas de Firestore...');

    // 🔍 Obtener referencia a la colección
    const tasksCollection = collection(db, 'tasks');

    // 📊 Ejecutar consulta
    const querySnapshot = await getDocs(tasksCollection);

    // 🔄 Convertir documentos a array
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,           // ID único del documento
        ...doc.data()         // Datos del documento
      });
    });

    console.log(`✅ ${tasks.length} tareas obtenidas:`, tasks);
    return { success: true, data: tasks };

  } catch (error) {
    console.error('❌ Error al obtener tareas:', error);
    return { success: false, error: error.message };
  }
};
```

**¿Qué hace cada parte?**
- `getDocs()`: Obtiene todos los documentos de una colección
- `querySnapshot`: Resultado de la consulta
- `doc.id`: ID único generado por Firebase
- `doc.data()`: Datos almacenados en el documento
- `...doc.data()`: Spread operator para combinar id + datos

#### Paso 3: Crear componente TaskItem
> **Archivo:** `src/components/TaskItem.jsx`
> **Acción:** Componente individual para mostrar tarea

```jsx
const TaskItem = ({ task }) => {
  // 📅 Formatear fecha de creación
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin fecha';

    // Convertir timestamp de Firebase a Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="border rounded p-4 mb-3 bg-white shadow-sm">
      {/* Header con estado */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">
          {task.completed ? '✅' : '📋'} {task.title}
        </h3>
        <span className={`px-2 py-1 rounded text-sm ${
          task.completed
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {task.completed ? 'Completada' : 'Pendiente'}
        </span>
      </div>

      {/* Descripción */}
      {task.description && (
        <p className="text-gray-600 mb-2">{task.description}</p>
      )}

      {/* Footer con metadata */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>📅 Creada: {formatDate(task.createdAt)}</span>
        <span>🆔 ID: {task.id.substring(0, 8)}...</span>
      </div>
    </div>
  );
};

export default TaskItem;
```

#### Paso 4: Crear componente TaskList
> **Archivo:** `src/components/TaskList.jsx`
> **Acción:** Lista que contiene múltiples TaskItem

```jsx
import { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { getTasks } from '../services/taskService';

const TaskList = () => {
  // 📋 Estado para almacenar tareas
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔄 Cargar tareas al montar componente
  useEffect(() => {
    loadTasks();
  }, []);

  // 📖 Función para cargar tareas
  const loadTasks = async () => {
    setLoading(true);
    setError('');

    const result = await getTasks();

    if (result.success) {
      setTasks(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // 🔄 Estados de carga
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="mt-2 text-gray-600">Cargando tareas...</p>
      </div>
    );
  }

  // ❌ Estado de error
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>❌ Error:</strong> {error}
        <button
          onClick={loadTasks}
          className="ml-4 underline hover:no-underline"
        >
          🔄 Reintentar
        </button>
      </div>
    );
  }

  // 📄 Lista vacía
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-2">No hay tareas</h3>
        <p className="text-gray-600">¡Crea tu primera tarea arriba!</p>
      </div>
    );
  }

  // 📋 Lista con tareas
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">📋 Mis Tareas ({tasks.length})</h2>
        <button
          onClick={loadTasks}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">📊 Estadísticas:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>✅ Completadas: {tasks.filter(t => t.completed).length}</div>
          <div>📋 Pendientes: {tasks.filter(t => !t.completed).length}</div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
```

#### Paso 5: Actualizar App.jsx
> **Archivo:** `src/App.jsx`
> **Acción:** Incluir TaskList y mejorar UX

```jsx
import { useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { createTask } from './services/taskService';

function App() {
  // 🔄 Estado para forzar recarga de lista
  const [refreshKey, setRefreshKey] = useState(0);

  // 🎯 Función mejorada para crear tareas
  const handleTaskCreate = async (taskData) => {
    console.log('📝 Creando tarea:', taskData);

    const result = await createTask(taskData);

    if (result.success) {
      console.log('✅ Tarea creada exitosamente!');

      // 🔄 Forzar recarga de la lista
      setRefreshKey(prev => prev + 1);

      // ✨ Feedback visual mejorado
      alert('✅ Tarea creada exitosamente!');
    } else {
      console.error('❌ Error:', result.error);
      alert('❌ Error: ' + result.error);
    }

    return result;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔥 Firebase Task Manager
          </h1>
          <p className="text-gray-600">
            Gestiona tus tareas con Firebase y React
          </p>
        </header>

        {/* Formulario */}
        <section className="mb-8">
          <TaskForm onTaskCreate={handleTaskCreate} />
        </section>

        {/* Lista de tareas */}
        <section>
          <TaskList key={refreshKey} />
        </section>
      </div>
    </div>
  );
}

export default App;
```

#### Paso 6: Mejorar el manejo de timestamps
> **Archivo:** `src/utils/dateUtils.js`
> **Acción:** Utilidades para fechas de Firebase

```javascript
// 📅 Formatear timestamp de Firebase
export const formatFirebaseDate = (timestamp) => {
  try {
    if (!timestamp) return 'Sin fecha';

    // Firebase Timestamp tiene método toDate()
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    // Formato español
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

// ⏰ Tiempo relativo (hace X tiempo)
export const getRelativeTime = (timestamp) => {
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return 'hace menos de 1 hora';
  } catch (error) {
    return 'Tiempo desconocido';
  }
};
```

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**📖 Lectura de datos funcionando**
- ✅ Función `getTasks` implementada
- ✅ Datos de Firestore mostrándose en UI
- ✅ Manejo de estados async (loading/error/success)

**🧩 Componentes organizados**
- ✅ `TaskList` - Lista contenedora
- ✅ `TaskItem` - Elemento individual
- ✅ Separación clara de responsabilidades

**✨ UX mejorada**
- ✅ Estados de carga visibles
- ✅ Manejo de errores con retry
- ✅ Lista vacía con mensaje amigable
- ✅ Estadísticas básicas

### 🧪 Pruebas de funcionalidad

1. **Crear varias tareas** usando el formulario
2. **Verificar que aparecen** en la lista
3. **Refrescar página** → Tareas persisten
4. **Probar sin internet** → Ver manejo de errores

### 📸 Capturas de verificación
1. **Lista con tareas** mostrando datos reales
2. **Estado de carga** mientras obtiene datos
3. **Lista vacía** con mensaje amigable
4. **Firebase Console** confirmando datos

### 🔄 Próxima sesión
**Sesión 67:** Actualización de datos (updateDoc) - Editaremos tareas existentes

---

**🎯 Conceptos clave aprendidos:**
- Operación READ del CRUD
- Función `getDocs` de Firestore
- Manejo de QuerySnapshot
- Componentes React organizados
- Estados de UI async
- Formateo de timestamps Firebase
