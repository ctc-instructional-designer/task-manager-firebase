## 🔥 Sesión 67: Actualización de datos (updateDoc)

### 🎯 Objetivos de la sesión
- Comprender operación UPDATE del CRUD
- Implementar `updateDoc` para modificar datos existentes
- Crear funcionalidad de edición de tareas
- Alternar estado completado/pendiente
- Manejar updates optimistas en UI

### 📋 Contenidos clave
✅ **Edición de entradas y campos** existentes en Firestore
✅ **Función updateDoc** - Modificar documentos específicos

---

### 🏗️ Implementación paso a paso

#### Paso 1: Comprender operación UPDATE
> **Concepto:** Modificar datos existentes sin recrear documento

```javascript
// 🎯 FLUJO DE ACTUALIZACIÓN DE DATOS
Frontend (React)     →     Backend (Firebase)     →     Database (Firestore)
┌─────────────┐            ┌─────────────────┐        ┌──────────────────┐
│ Edit Form   │  updateDoc │ Validación      │        │ Documento abc123 │
│ - title ✏️  │ ────────→  │ - Campos        │ ────→  │ title: UPDATED   │
│ - Toggle ☑️ │            │ - Timestamps    │        │ updatedAt: NOW   │
│ - [Save] ✅ │            │ - Permisos      │        │ (otros sin cambio)│
└─────────────┘            └─────────────────┘        └──────────────────┘
```

**Tipos de updates que implementaremos:**
- ✏️ **Edición completa** - Modificar título y descripción
- ☑️ **Toggle completed** - Cambiar estado pendiente/completada
- 📝 **Update parcial** - Solo campos específicos

#### Paso 2: Agregar funciones de actualización al servicio
> **Archivo:** `src/services/taskService.js`
> **Acción:** Añadir funciones `updateTask` y `toggleTaskComplete`

```javascript
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,        // 👈 Nueva importación
  doc,              // 👈 Para referencia a documento específico
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ... funciones anteriores (createTask, getTasks)

// ✏️ Actualizar tarea completa
export const updateTask = async (taskId, updates) => {
  try {
    console.log('✏️ Actualizando tarea:', taskId, updates);

    // 📍 Referencia al documento específico
    const taskRef = doc(db, 'tasks', taskId);

    // 🔄 Actualizar con timestamp
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()  // Marcar cuándo se actualizó
    });

    console.log('✅ Tarea actualizada exitosamente');
    return { success: true };

  } catch (error) {
    console.error('❌ Error al actualizar tarea:', error);
    return { success: false, error: error.message };
  }
};

// ☑️ Alternar estado completado
export const toggleTaskComplete = async (taskId, currentCompleted) => {
  try {
    console.log('☑️ Toggling complete:', taskId, !currentCompleted);

    // 🔄 Usar updateTask con campo específico
    const result = await updateTask(taskId, {
      completed: !currentCompleted
    });

    return result;

  } catch (error) {
    console.error('❌ Error al alternar completado:', error);
    return { success: false, error: error.message };
  }
};

// ✏️ Actualizar solo texto (título + descripción)
export const updateTaskText = async (taskId, title, description) => {
  return updateTask(taskId, {
    title: title.trim(),
    description: description.trim()
  });
};
```

#### Paso 3: Agregar modo edición a TaskItem
> **Archivo:** `src/components/TaskItem.jsx`
> **Acción:** Permitir edición inline

```jsx
import { useState } from 'react';
import { updateTaskText, toggleTaskComplete } from '../services/taskService';

const TaskItem = ({ task, onTaskUpdate }) => {
  // 🔧 Estados de edición
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || ''
  });

  // 📅 Formatear fecha (función anterior)
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES');
  };

  // ☑️ Manejar toggle completado
  const handleToggleComplete = async () => {
    setLoading(true);
    const result = await toggleTaskComplete(task.id, task.completed);

    if (result.success) {
      // 🔄 Notificar al padre para refrescar
      onTaskUpdate?.();
    }

    setLoading(false);
  };

  // ✏️ Guardar edición
  const handleSaveEdit = async () => {
    if (!editData.title.trim()) {
      alert('El título es requerido');
      return;
    }

    setLoading(true);
    const result = await updateTaskText(
      task.id,
      editData.title,
      editData.description
    );

    if (result.success) {
      setEditing(false);
      onTaskUpdate?.();  // Refrescar lista
    } else {
      alert('Error: ' + result.error);
    }

    setLoading(false);
  };

  // ❌ Cancelar edición
  const handleCancelEdit = () => {
    setEditData({
      title: task.title,
      description: task.description || ''
    });
    setEditing(false);
  };

  return (
    <div className={`border rounded p-4 mb-3 shadow-sm transition-colors ${
      task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    }`}>
      {editing ? (
        // 🔧 MODO EDICIÓN
        <div>
          <div className="mb-3">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              className="w-full p-2 border rounded font-semibold"
              placeholder="Título de la tarea"
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              className="w-full p-2 border rounded h-20 resize-none"
              placeholder="Descripción (opcional)"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '💾 Guardando...' : '✅ Guardar'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      ) : (
        // 👀 MODO VISTA
        <div>
          {/* Header con título y estado */}
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold text-lg ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {task.completed ? '✅' : '📋'} {task.title}
            </h3>
            <div className="flex items-center gap-2">
              {/* Toggle completado */}
              <button
                onClick={handleToggleComplete}
                disabled={loading}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  task.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                {loading ? '⏳' : (task.completed ? '✅ Completada' : '📋 Pendiente')}
              </button>

              {/* Botón editar */}
              <button
                onClick={() => setEditing(true)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                ✏️ Editar
              </button>
            </div>
          </div>

          {/* Descripción */}
          {task.description && (
            <p className={`mb-2 ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          {/* Footer con metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>📅 Creada: {formatDate(task.createdAt)}</span>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <span>✏️ Editada: {formatDate(task.updatedAt)}</span>
            )}
            <span>🆔 {task.id.substring(0, 8)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
```

#### Paso 4: Actualizar TaskList para manejar updates
> **Archivo:** `src/components/TaskList.jsx`
> **Acción:** Refrescar datos tras ediciones

```jsx
import { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { getTasks } from '../services/taskService';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔄 Cargar tareas
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError('');

    const result = await getTasks();

    if (result.success) {
      // 📊 Ordenar por fecha de creación (más recientes primero)
      const sortedTasks = result.data.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });

      setTasks(sortedTasks);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // 🔄 Función para que TaskItem refresque la lista
  const handleTaskUpdate = () => {
    console.log('🔄 Refrescando lista tras actualización...');
    loadTasks();
  };

  // ... estados de loading y error (igual que antes)

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="mt-2 text-gray-600">Cargando tareas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>❌ Error:</strong> {error}
        <button onClick={loadTasks} className="ml-4 underline">🔄 Reintentar</button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-2">No hay tareas</h3>
        <p className="text-gray-600">¡Crea tu primera tarea arriba!</p>
      </div>
    );
  }

  // 📊 Calcular estadísticas
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div>
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">📋 Mis Tareas ({tasks.length})</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-600">✅ {completedCount}</span>
          <span className="text-sm text-yellow-600">📋 {pendingCount}</span>
          <button
            onClick={loadTasks}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onTaskUpdate={handleTaskUpdate}  // 👈 Callback para refrescar
          />
        ))}
      </div>

      {/* Estadísticas detalladas */}
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">📊 Estadísticas:</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>📝 Total: {tasks.length}</div>
          <div>✅ Completadas: {completedCount}</div>
          <div>📋 Pendientes: {pendingCount}</div>
        </div>
        {tasks.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            📈 Progreso: {Math.round((completedCount / tasks.length) * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
```

#### Paso 5: Agregar acciones rápidas
> **Archivo:** `src/components/TaskActions.jsx`
> **Acción:** Botones para acciones masivas

```jsx
import { useState } from 'react';
import { updateTask } from '../services/taskService';

const TaskActions = ({ tasks, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  // ✅ Marcar todas como completadas
  const markAllComplete = async () => {
    setLoading(true);
    const pendingTasks = tasks.filter(t => !t.completed);

    for (const task of pendingTasks) {
      await updateTask(task.id, { completed: true });
    }

    setLoading(false);
    onUpdate();
  };

  // 📋 Marcar todas como pendientes
  const markAllPending = async () => {
    setLoading(true);
    const completedTasks = tasks.filter(t => t.completed);

    for (const task of completedTasks) {
      await updateTask(task.id, { completed: false });
    }

    setLoading(false);
    onUpdate();
  };

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  if (tasks.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded flex gap-2">
      <span className="text-sm text-gray-600 mr-4">Acciones rápidas:</span>

      {pendingCount > 0 && (
        <button
          onClick={markAllComplete}
          disabled={loading}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          ✅ Completar todas ({pendingCount})
        </button>
      )}

      {completedCount > 0 && (
        <button
          onClick={markAllPending}
          disabled={loading}
          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
        >
          📋 Marcar pendientes ({completedCount})
        </button>
      )}
    </div>
  );
};

export default TaskActions;
```

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**✏️ Edición completa funcionando**
- ✅ Función `updateDoc` implementada
- ✅ Edición inline en TaskItem
- ✅ Validación de campos al editar

**☑️ Toggle de estado**
- ✅ Cambiar completed/pending con un clic
- ✅ Feedback visual inmediato
- ✅ Persistencia en Firestore

**🔄 UX optimizada**
- ✅ Updates refrescan automáticamente la lista
- ✅ Estados de loading durante operaciones
- ✅ Acciones rápidas masivas

### 🧪 Pruebas de funcionalidad

1. **Editar título** de una tarea existente
2. **Toggle completado** varias veces
3. **Crear nueva tarea** y editarla inmediatamente
4. **Verificar timestamps** de updatedAt en Firebase Console

### 📸 Capturas de verificación
1. **TaskItem en modo edición** con campos editables
2. **Toggle de estados** mostrando cambios visuales
3. **Firebase Console** mostrando campo `updatedAt`
4. **Acciones rápidas** funcionando

### 🔄 Próxima sesión
**Sesión 68:** Repaso CRUD - Organizaremos colecciones y validaremos estructura

---

**🎯 Conceptos clave aprendidos:**
- Operación UPDATE del CRUD
- Función `updateDoc` de Firestore
- Referencias a documentos específicos con `doc()`
- Updates parciales vs completos
- UX de edición inline
- Timestamps automáticos de actualización
