## 🔥 Sesión 69: Eliminación de datos (deleteDoc)

### 🎯 Objetivos de la sesión
- Comprender operación DELETE del CRUD
- Implementar `deleteDoc` para eliminar datos de Firestore
- Crear sistema de confirmación antes de eliminar
- Manejar eliminación masiva con precaución
- Completar funcionalidad CRUD básica

### 📋 Contenidos clave
✅ **Lógica de eliminación + confirmación** segura
✅ **Función deleteDoc** - Remover documentos específicos

---

### 🏗️ Implementación paso a paso

#### Paso 1: Comprender operación DELETE
> **Concepto:** Eliminar datos de forma segura y permanente

```javascript
// 🎯 FLUJO DE ELIMINACIÓN DE DATOS
Frontend (React)     →     Backend (Firebase)     →     Database (Firestore)
┌─────────────┐            ┌─────────────────┐        ┌──────────────────┐
│ Confirm UI  │  deleteDoc │ Validación      │        │ Documento abc123 │
│ ⚠️ ¿Seguro? │ ────────→  │ - Existe?       │ ────→  │ 🗑️ ELIMINADO    │
│ [Sí] [No]   │            │ - Permisos      │        │ (no recuperable) │
│             │            │ - Referencias   │        │                  │
└─────────────┘            └─────────────────┘        └──────────────────┘

// ⚠️ CONSIDERACIONES CRÍTICAS
├── Eliminación es PERMANENTE (no hay papelera)
├── Confirmar SIEMPRE antes de eliminar
├── Verificar permisos del usuario
└── Manejar referencias a otros documentos
```

**Tipos de eliminación que implementaremos:**
- 🗑️ **Eliminación individual** - Una tarea específica
- ⚠️ **Eliminación con confirmación** - Doble verificación
- 🧹 **Eliminación masiva** - Completadas o todas (cuidado)

#### Paso 2: Agregar función DELETE al servicio
> **Archivo:** `src/services/taskService.js`
> **Acción:** Añadir `deleteTask` con validación

```javascript
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,       // 👈 Nueva importación
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { validateTaskData, COLLECTIONS } from '../utils/firestoreStructure';

// ... funciones anteriores (createTask, getTasks, updateTask)

// 🗑️ Eliminar tarea individual
export const deleteTask = async (taskId) => {
  try {
    // ✅ Validar que taskId existe y es válido
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('ID de tarea inválido');
    }

    console.log('🗑️ Eliminando tarea:', taskId);

    // 📍 Referencia al documento específico
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);

    // 🔥 Eliminar documento de Firestore
    await deleteDoc(taskRef);

    console.log('✅ Tarea eliminada exitosamente');
    return { success: true, deletedId: taskId };

  } catch (error) {
    console.error('❌ Error al eliminar tarea:', error);

    // 🎯 Manejo específico de errores de eliminación
    let userMessage = error.message;
    if (error.code === 'permission-denied') {
      userMessage = 'No tienes permisos para eliminar esta tarea';
    } else if (error.code === 'not-found') {
      userMessage = 'La tarea ya no existe';
    } else if (error.code === 'unavailable') {
      userMessage = 'Servicio no disponible, intenta más tarde';
    }

    return { success: false, error: userMessage };
  }
};

// 🧹 Eliminar múltiples tareas (CUIDADO: Operación peligrosa)
export const deleteMultipleTasks = async (taskIds) => {
  try {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error('Lista de IDs inválida');
    }

    console.log(`🧹 Eliminando ${taskIds.length} tareas:`, taskIds);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // 🔄 Eliminar una por una (más seguro que batch)
    for (const taskId of taskIds) {
      const result = await deleteTask(taskId);
      results.push({ taskId, result });

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    console.log(`✅ Eliminación masiva completada: ${successCount} exitosas, ${errorCount} fallidas`);

    return {
      success: errorCount === 0,
      successCount,
      errorCount,
      results
    };

  } catch (error) {
    console.error('❌ Error en eliminación masiva:', error);
    return { success: false, error: error.message };
  }
};

// 🧹 Eliminar tareas completadas
export const deleteCompletedTasks = async () => {
  try {
    // 📖 Obtener todas las tareas
    const tasksResult = await getTasks();
    if (!tasksResult.success) {
      throw new Error('No se pudieron obtener las tareas');
    }

    // 🔍 Filtrar solo las completadas
    const completedTasks = tasksResult.data.filter(task => task.completed);

    if (completedTasks.length === 0) {
      return { success: true, message: 'No hay tareas completadas para eliminar' };
    }

    // 🗑️ Eliminar tareas completadas
    const taskIds = completedTasks.map(task => task.id);
    const result = await deleteMultipleTasks(taskIds);

    return {
      ...result,
      deletedCompletedCount: result.successCount
    };

  } catch (error) {
    console.error('❌ Error eliminando tareas completadas:', error);
    return { success: false, error: error.message };
  }
};
```

#### Paso 3: Crear componente de confirmación
> **Archivo:** `src/components/ConfirmDialog.jsx`
> **Acción:** Modal de confirmación reutilizable

```jsx
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '⚠️ Confirmar acción',
  message = '¿Estás seguro de que quieres continuar?',
  confirmText = 'Sí, continuar',
  cancelText = 'Cancelar',
  isDangerous = false
}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-mx mx-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {title}
          </h3>
        </div>

        {/* Mensaje */}
        <div className="mb-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white ${
              isDangerous
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
```

#### Paso 4: Agregar eliminación a TaskItem
> **Archivo:** `src/components/TaskItem.jsx`
> **Acción:** Botón de eliminar con confirmación

```jsx
import { useState } from 'react';
import { updateTaskText, toggleTaskComplete, deleteTask } from '../services/taskService';
import ConfirmDialog from './ConfirmDialog';

const TaskItem = ({ task, onTaskUpdate, onTaskDelete }) => {
  // Estados existentes...
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || ''
  });

  // 🗑️ Nuevo estado para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ... funciones existentes (formatDate, handleToggleComplete, handleSaveEdit, handleCancelEdit)

  // 🗑️ Manejar eliminación con confirmación
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setShowDeleteConfirm(false);

    const result = await deleteTask(task.id);

    if (result.success) {
      console.log('✅ Tarea eliminada:', task.id);
      // 🔄 Notificar al padre para refrescar o remover de lista
      onTaskDelete?.(task.id);
    } else {
      alert('❌ Error al eliminar: ' + result.error);
    }

    setLoading(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className={`border rounded p-4 mb-3 shadow-sm transition-colors ${
        task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
      } ${loading ? 'opacity-50' : ''}`}>

        {editing ? (
          // 🔧 MODO EDICIÓN (código existente)
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
          // 👀 MODO VISTA (mejorado con botón eliminar)
          <div>
            {/* Header con título y acciones */}
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold text-lg ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-800'
              }`}>
                {task.completed ? '✅' : '📋'} {task.title}
              </h3>

              {/* Botones de acción */}
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
                  disabled={loading}
                  className="text-blue-500 hover:text-blue-700 text-sm disabled:opacity-50"
                >
                  ✏️ Editar
                </button>

                {/* Botón eliminar */}
                <button
                  onClick={handleDeleteClick}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                >
                  🗑️ Eliminar
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

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="🗑️ Eliminar tarea"
        message={`¿Estás seguro de que quieres eliminar "${task.title}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isDangerous={true}
      />
    </>
  );
};

export default TaskItem;
```

#### Paso 5: Agregar eliminación masiva a TaskList
> **Archivo:** `src/components/TaskList.jsx`
> **Acción:** Opciones de eliminación masiva

```jsx
import { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import ConfirmDialog from './ConfirmDialog';
import { getTasks, deleteCompletedTasks, deleteMultipleTasks } from '../services/taskService';

const TaskList = () => {
  // Estados existentes...
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🗑️ Nuevos estados para eliminación masiva
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteCompletedConfirm, setShowDeleteCompletedConfirm] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  // ... funciones existentes (useEffect, loadTasks)

  // 🗑️ Eliminar tareas completadas
  const handleDeleteCompleted = async () => {
    setOperationLoading(true);
    setShowDeleteCompletedConfirm(false);

    const result = await deleteCompletedTasks();

    if (result.success) {
      alert(`✅ ${result.deletedCompletedCount || 0} tareas completadas eliminadas`);
      loadTasks(); // Refrescar lista
    } else {
      alert('❌ Error: ' + result.error);
    }

    setOperationLoading(false);
  };

  // 🗑️ Eliminar todas las tareas (MUY PELIGROSO)
  const handleDeleteAll = async () => {
    setOperationLoading(true);
    setShowDeleteAllConfirm(false);

    const taskIds = tasks.map(task => task.id);
    const result = await deleteMultipleTasks(taskIds);

    if (result.success) {
      alert(`✅ Todas las tareas (${result.successCount}) eliminadas`);
      setTasks([]); // Limpiar lista local
    } else {
      alert(`❌ Error: ${result.errorCount} tareas no se pudieron eliminar`);
      loadTasks(); // Refrescar para ver estado real
    }

    setOperationLoading(false);
  };

  // 🗑️ Manejar eliminación individual desde TaskItem
  const handleTaskDelete = (deletedTaskId) => {
    // ✨ Eliminación optimista: remover de la lista local inmediatamente
    setTasks(currentTasks => currentTasks.filter(task => task.id !== deletedTaskId));
  };

  // ... código de estados loading/error (igual que antes)

  if (tasks.length === 0 && !loading) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-2">No hay tareas</h3>
        <p className="text-gray-600">¡Crea tu primera tarea arriba!</p>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <>
      <div>
        {/* Header con estadísticas y acciones */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">📋 Mis Tareas ({tasks.length})</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-600">✅ {completedCount}</span>
            <span className="text-sm text-yellow-600">📋 {pendingCount}</span>
            <button
              onClick={loadTasks}
              disabled={operationLoading}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Acciones de eliminación masiva */}
        {tasks.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700 font-medium">⚠️ Zona peligrosa</span>
              <div className="flex gap-2">
                {completedCount > 0 && (
                  <button
                    onClick={() => setShowDeleteCompletedConfirm(true)}
                    disabled={operationLoading}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    🗑️ Eliminar completadas ({completedCount})
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  disabled={operationLoading}
                  className="bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-800 disabled:opacity-50"
                >
                  🗑️ Eliminar todas ({tasks.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de tareas */}
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onTaskUpdate={loadTasks}
              onTaskDelete={handleTaskDelete}  // 👈 Nueva prop
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

      {/* Confirmaciones de eliminación masiva */}
      <ConfirmDialog
        isOpen={showDeleteCompletedConfirm}
        onClose={() => setShowDeleteCompletedConfirm(false)}
        onConfirm={handleDeleteCompleted}
        title="🗑️ Eliminar tareas completadas"
        message={`¿Eliminar ${completedCount} tarea${completedCount > 1 ? 's' : ''} completada${completedCount > 1 ? 's' : ''}? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar completadas"
        cancelText="Cancelar"
        isDangerous={true}
      />

      <ConfirmDialog
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={handleDeleteAll}
        title="🗑️ Eliminar TODAS las tareas"
        message={`⚠️ ATENCIÓN: Vas a eliminar TODAS las ${tasks.length} tareas. Esta acción NO se puede deshacer. ¿Estás completamente seguro?`}
        confirmText="SÍ, ELIMINAR TODAS"
        cancelText="NO, cancelar"
        isDangerous={true}
      />
    </>
  );
};

export default TaskList;
```

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**🗑️ CRUD completo funcionando**
- ✅ CREATE - Crear tareas (Sesión 65)
- ✅ READ - Leer tareas (Sesión 66)
- ✅ UPDATE - Editar tareas (Sesión 67)
- ✅ DELETE - Eliminar tareas (Sesión 69) 👈 **NUEVO**

**🛡️ Eliminación segura**
- ✅ Confirmación obligatoria antes de eliminar
- ✅ Manejo robusto de errores
- ✅ Eliminación individual y masiva

**✨ UX mejorada**
- ✅ Modal de confirmación reutilizable
- ✅ Eliminación optimista en UI
- ✅ Zona de peligro claramente marcada

### 🧪 Pruebas críticas

1. **Eliminar tarea individual** → Confirmar que desaparece
2. **Cancelar eliminación** → Verificar que no se elimina
3. **Eliminar tareas completadas** → Solo se borran las completadas
4. **Verificar en Firebase Console** → Documentos efectivamente eliminados

### ⚠️ Advertencias importantes

- **Eliminación es PERMANENTE** - No hay manera de recuperar
- **Siempre confirmar** antes de eliminar
- **Cuidado con eliminación masiva** - Puede borrar mucho trabajo
- **Verificar permisos** en producción con autenticación

### 📸 Capturas de verificación
1. **Botón eliminar** en TaskItem
2. **Modal de confirmación** funcionando
3. **Zona peligrosa** para eliminación masiva
4. **Firebase Console** mostrando documentos eliminados

### 🔄 Próxima sesión
**Sesión 70:** Validación de entradas y manejo de errores - Mejoraremos la robustez del sistema

---

**🎯 Conceptos clave aprendidos:**
- Operación DELETE del CRUD completa
- Función `deleteDoc` de Firestore
- Confirmación obligatoria para operaciones peligrosas
- Eliminación optimista vs pesimista
- Manejo de operaciones masivas
- UX de "zona peligrosa"
