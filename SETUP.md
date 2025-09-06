# Configuración Rápida de Firebase

## Pasos para configurar Firebase en este proyecto:

### 1. Crear un proyecto en Firebase Console
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Hacer clic en "Crear un proyecto"
3. Seguir el asistente de configuración

### 2. Configurar Authentication
1. En el panel de Firebase, ir a **Authentication**
2. Hacer clic en **Get started**
3. En la pestaña **Sign-in method**, habilitar:
   - **Email/Password**
   - **Google** (opcional pero recomendado)

### 3. Configurar Firestore Database
1. En el panel de Firebase, ir a **Firestore Database**
2. Hacer clic en **Create database**
3. Seleccionar **Start in test mode** (para desarrollo)
4. Elegir una ubicación cercana

### 4. Obtener la configuración del proyecto
1. En el panel de Firebase, ir a **Project settings** (ícono de engranaje)
2. En la sección **Your apps**, hacer clic en **Web** (`</>`)
3. Registrar la app con un nombre
4. Copiar la configuración que se muestra

### 5. Configurar la aplicación
1. Abrir el archivo `src/services/firebase.js`
2. Reemplazar la configuración con los datos de tu proyecto Firebase:

```javascript
const firebaseConfig = {
  apiKey: "tu_api_key_aqui",
  authDomain: "tu_project.firebaseapp.com",
  projectId: "tu_project_id",
  storageBucket: "tu_project.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu_app_id"
};
```

**Nota**: La configuración se incluye directamente en el código. Para mayor seguridad en producción, considera usar variables de entorno.

### 6. Instalar dependencias y ejecutar el proyecto
```bash
npm install
npm run dev
```

## Reglas de Firestore recomendadas

En Firestore Database > Rules, usar estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir sus propias tareas
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

**Nota importante**: Este proyecto usa consultas simples que NO requieren índices compuestos. Todo el ordenamiento se hace en el cliente, por lo que no necesitas crear índices adicionales en Firebase.

## Estructura de datos

Las tareas se almacenan en Firestore con esta estructura:

```javascript
{
  id: "documento_auto_generado",
  title: "Título de la tarea",
  description: "Descripción opcional",
  completed: false,
  priority: "medium", // "low", "medium", "high"
  dueDate: "2024-12-31", // opcional
  createdAt: timestamp,
  updatedAt: timestamp,
  userId: "uid_del_usuario"
}
```

## Arquitectura de consultas

Este proyecto utiliza un enfoque de **consultas simples** con las siguientes ventajas:

### ✅ **Ventajas del enfoque actual:**
- **Sin índices compuestos**: No necesitas crear índices adicionales en Firebase
- **Configuración simple**: Funciona inmediatamente después de la configuración básica
- **Sin errores de índices**: Nunca verás errores de "query requires an index"
- **Flexibilidad**: Todo el ordenamiento y filtrado se hace en el cliente
- **Rendimiento adecuado**: Eficiente para aplicaciones con volumen moderado de datos

### 🔧 **Cómo funciona:**
1. **Consulta simple**: Solo filtra por `userId` (no requiere índice)
2. **Ordenamiento en cliente**: Las tareas se ordenan después de obtenerlas
3. **Tiempo real**: Los cambios se sincronizan automáticamente
4. **Filtros locales**: Todos los filtros (completadas, pendientes, etc.) se aplican en el frontend

### 📊 **Consideraciones de rendimiento:**
- **Óptimo para**: Hasta 1000-5000 tareas por usuario
- **Escalable**: Para más datos, se puede migrar a consultas con índices
- **Eficiente**: Solo se transfieren las tareas del usuario actual

## Funcionalidades implementadas

✅ **Autenticación**
- Registro con email/password
- Login con email/password
- Login con Google
- Logout

✅ **Gestión de tareas**
- Crear tareas
- Editar tareas
- Eliminar tareas
- Marcar como completada
- Filtros (todas, pendientes, completadas, vencidas)
- Ordenamiento (fecha, título, prioridad)
- Fechas límite
- Prioridades

✅ **Interfaz**
- Diseño responsive
- Componentes reutilizables
- Loading states
- Validación de formularios
- Feedback visual

## Comandos útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la build
npm run preview
```

¡El proyecto está listo para usar! Solo necesitas configurar Firebase siguiendo los pasos anteriores.
