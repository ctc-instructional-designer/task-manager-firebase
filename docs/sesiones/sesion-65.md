## 🔥 Sesión 65: Escritura en Firestore (addDoc)

### 🎯 Objetivos de la sesión
- Comprender operación CREATE del CRUD
- Implementar `addDoc` para enviar datos a Firestore
- Crear formulario básico de tareas
- Manejar estados de carga y errores
- Verificar datos en Firebase Console

### 📋 Contenidos clave
✅ **Enviar datos desde formulario frontend** a Firestore
✅ **Función addDoc** - Crear documentos en colección

---

### 🏗️ Implementación paso a paso

#### Paso 1: Comprender operación CREATE
> **Concepto:** Enviar datos del frontend a la base de datos

```javascript
// 🎯 FLUJO DE CREACIÓN DE DATOS
Frontend (React)     →     Backend (Firebase)     →     Database (Firestore)
┌─────────────┐            ┌─────────────────┐        ┌──────────────────┐
│ Formulario  │   addDoc   │ Validación      │        │ Nueva colección  │
│ - title     │ ────────→  │ - Timestamps    │ ────→  │ "tasks" creada   │
│ - desc      │            │ - Estructura    │        │ con documento    │
│ - [Submit]  │            │ - Permisos      │        │ único ID: abc123 │
└─────────────┘            └─────────────────┘        └──────────────────┘
```

**¿Qué necesitamos?**
- 📝 **Formulario** para capturar datos
- 🔧 **Función addDoc** para enviar a Firebase
- ⚡ **Estado** para loading y errores
- ✅ **Validación** básica de campos

#### Paso 2: Crear servicio de tareas
> **Archivo:** `src/services/taskService.js`
> **Acción:** Centralizar operaciones CRUD

```javascript
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// 📝 Crear nueva tarea
export const createTask = async (taskData) => {
  try {
    console.log('🚀 Enviando tarea a Firestore...', taskData);

    // 🔥 Agregar documento a colección "tasks"
    const docRef = await addDoc(collection(db, 'tasks'), {
      title: taskData.title,
      description: taskData.description || '',
      completed: false,                    // Por defecto: pendiente
      createdAt: serverTimestamp(),        // Timestamp del servidor
      updatedAt: serverTimestamp()         // Para futuros updates
    });

    console.log('✅ Tarea creada con ID:', docRef.id);
    return { success: true, id: docRef.id };

  } catch (error) {
    console.error('❌ Error al crear tarea:', error);
    return { success: false, error: error.message };
  }
};
```

**¿Qué hace cada parte?**
- `collection(db, 'tasks')`: Referencia a colección "tasks"
- `addDoc()`: Crea documento con ID único automático
- `serverTimestamp()`: Fecha exacta del servidor (no del cliente)
- `try/catch`: Manejo de errores robusto

#### Paso 3: Crear formulario de tareas
> **Archivo:** `src/components/TaskForm.jsx`
> **Acción:** Interfaz para crear tareas

```jsx
import { useState } from 'react';

const TaskForm = ({ onTaskCreate }) => {
  // 📝 Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // ⚡ Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔄 Manejar cambios en inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 📤 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validación básica
    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    setLoading(true);
    setError('');

    // 🚀 Crear tarea (función viene del padre)
    const result = await onTaskCreate(formData);

    if (result.success) {
      // ✅ Limpiar formulario
      setFormData({ title: '', description: '' });
    } else {
      // ❌ Mostrar error
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">➕ Crear nueva tarea</h2>

      {/* Campo título */}
      <div className="mb-4">
        <input
          type="text"
          name="title"
          placeholder="Título de la tarea"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          disabled={loading}
        />
      </div>

      {/* Campo descripción */}
      <div className="mb-4">
        <textarea
          name="description"
          placeholder="Descripción (opcional)"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded h-20"
          disabled={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {/* Botón submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '⏳ Creando...' : '✅ Crear Tarea'}
      </button>
    </form>
  );
};

export default TaskForm;
```

#### Paso 4: Integrar en App.jsx
> **Archivo:** `src/App.jsx`
> **Acción:** Usar formulario y servicio

```jsx
import TaskForm from './components/TaskForm';
import { createTask } from './services/taskService';

function App() {
  // 🎯 Función para manejar creación de tareas
  const handleTaskCreate = async (taskData) => {
    console.log('📝 Datos del formulario:', taskData);

    // 🚀 Enviar a Firebase
    const result = await createTask(taskData);

    if (result.success) {
      console.log('✅ Tarea creada exitosamente!');
      alert('✅ Tarea creada exitosamente!');
    } else {
      console.error('❌ Error:', result.error);
    }

    return result;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">🔥 Firebase Task Manager</h1>

      {/* Formulario de creación */}
      <TaskForm onTaskCreate={handleTaskCreate} />

      {/* Lista de tareas (próxima sesión) */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        📋 Lista de tareas se mostrará en la próxima sesión...
      </div>
    </div>
  );
}

export default App;
```

#### Paso 5: Probar la funcionalidad
> **Acción:** Verificar que los datos llegan a Firestore

**5.1. Ejecutar aplicación**
```bash
npm run dev
```

**5.2. Probar formulario**
1. Llenar título: "Mi primera tarea"
2. Descripción: "Aprender Firebase addDoc"
3. Clic en "Crear Tarea"
4. Ver alerta de éxito

**5.3. Verificar en Firebase Console**
1. Ir a Firebase Console → Firestore Database
2. Debería aparecer:
   ```
   📊 Colección: "tasks"
     📄 Documento: [ID automático, ej: xYz123]
       - title: "Mi primera tarea"
       - description: "Aprender Firebase addDoc"
       - completed: false
       - createdAt: [timestamp]
       - updatedAt: [timestamp]
   ```

#### Paso 6: Comprender la estructura creada
> **Concepto:** Cómo se organiza Firestore

```javascript
// 🏗️ ESTRUCTURA RESULTANTE EN FIRESTORE
{
  "tasks": {                                    // 📁 Colección
    "kM2p8nQ4rX7wE9vT": {                      // 📄 Documento (ID único)
      "title": "Mi primera tarea",              // 📝 Campo
      "description": "Aprender Firebase addDoc", // 📝 Campo
      "completed": false,                        // 📝 Campo
      "createdAt": "2024-01-15T10:30:00Z",     // 📝 Campo (timestamp)
      "updatedAt": "2024-01-15T10:30:00Z"      // 📝 Campo (timestamp)
    },
    "aB9c1dE2fG3hI4j": {                       // 📄 Otro documento
      "title": "Segunda tarea",
      "description": "Continuar aprendiendo",
      "completed": false,
      "createdAt": "2024-01-15T10:32:00Z",
      "updatedAt": "2024-01-15T10:32:00Z"
    }
  }
}
```

**Conceptos clave:**
- **Colección**: Contenedor de documentos (como tabla SQL)
- **Documento**: Objeto con datos (como fila SQL)
- **ID único**: Firebase genera automáticamente
- **Timestamp**: Fecha exacta del servidor

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**📝 Formulario funcional**
- ✅ Captura título y descripción
- ✅ Validación básica implementada
- ✅ Estados de carga y error

**🚀 Integración Firebase**
- ✅ Función `addDoc` funcionando
- ✅ Servicio `taskService.js` creado
- ✅ Datos enviándose a Firestore

**📊 Datos en Firestore**
- ✅ Colección "tasks" creada
- ✅ Documentos con estructura definida
- ✅ Timestamps automáticos

### 🧪 Pruebas adicionales

Crear varias tareas para probar:
```
Tarea 1: "Configurar Firebase" / "Completado en sesión anterior"
Tarea 2: "Aprender addDoc" / "En proceso..."
Tarea 3: "Crear formulario" / ""
```

### 📸 Capturas de verificación
1. **Formulario** mostrando campos y botón
2. **Alerta de éxito** tras crear tarea
3. **Firebase Console** con colección "tasks" y documentos
4. **Console del navegador** mostrando logs

### 🔄 Próxima sesión
**Sesión 66:** Lectura de datos (getDocs) - Mostraremos las tareas creadas en tiempo real

---

**🎯 Conceptos clave aprendidos:**
- Operación CREATE del CRUD
- Función `addDoc` de Firestore
- `serverTimestamp` para fechas precisas
- Manejo de estados async en React
- Estructura de documentos NoSQL
