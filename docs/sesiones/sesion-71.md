## 🔒 Sesión 71: Reglas de seguridad de Firestore

### 🎯 Objetivos de la sesión
- Entender la importancia de las reglas de seguridad
- Configurar reglas básicas para colección de tareas
- Proteger datos contra accesos no autorizados
- Preparar base para futura autenticación de usuarios
- Establecer permisos de lectura y escritura

### 📋 Contenidos clave
✅ **Firestore Security Rules** - Protección a nivel de base de datos
✅ **Configuración básica** - Reglas para desarrollo y producción
✅ **Testing de reglas** - Verificar permisos correctamente

---

### 🏗️ Implementación paso a paso

#### Paso 1: Comprender las reglas de seguridad
> **Concepto:** Las reglas de seguridad son el firewall de tu base de datos

```javascript
// 🎯 ¿QUÉ SON LAS FIRESTORE SECURITY RULES?
┌─────────────────────────────────────────────────────────────┐
│  🌐 Cliente (React)              🔥 Firestore               │
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │ Solicitud CRUD  │ ──────────→  │ Security Rules      │   │
│  │ - read()        │              │ ┌─────────────────┐ │   │
│  │ - write()       │              │ │ ✅ Permitir?    │ │   │
│  │ - update()      │              │ │ ❌ Rechazar?    │ │   │
│  │ - delete()      │              │ │ 🔍 Validar?     │ │   │
│  └─────────────────┘              │ └─────────────────┘ │   │
│                                   │         │           │   │
│                                   │         ▼           │   │
│                                   │ ┌─────────────────┐ │   │
│                                   │ │   Documentos    │ │   │
│                                   │ │   📄📄📄📄    │ │   │
│                                   │ └─────────────────┘ │   │
│                                   └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

// ⚡ VENTAJAS DE LAS SECURITY RULES
├── 🛡️ Protección automática 24/7
├── 🚀 Validación del lado servidor (no hackeable)
├── 📝 Validación de estructura de datos
├── 🔐 Control granular por documento/campo
└── 🎯 No requiere código backend adicional
```

**Niveles de seguridad que configuraremos:**
- 🚪 **Acceso básico** - Quién puede leer/escribir
- 📝 **Validación de datos** - Qué estructura es válida
- 🔐 **Control de usuario** - Preparar para autenticación
- 🛡️ **Protección contra spam** - Límites básicos

#### Paso 2: Configuración inicial de reglas
> **Archivo:** Firebase Console > Firestore Database > Rules
> **Acción:** Definir reglas básicas de seguridad

```javascript
// 🔥 FIRESTORE SECURITY RULES - CONFIGURACIÓN BÁSICA
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 📋 REGLAS PARA COLECCIÓN DE TAREAS
    match /tasks/{taskId} {

      // 👀 REGLAS DE LECTURA (READ)
      allow read: if true; // 🎯 Por ahora permitir lectura a todos

      // ✍️ REGLAS DE ESCRITURA (CREATE, UPDATE, DELETE)
      allow create: if
        // ✅ Validar estructura del documento
        validateTaskStructure(resource.data) &&
        // ✅ Validar contenido de los campos
        validateTaskContent(resource.data) &&
        // ✅ Verificar campos requeridos
        validateRequiredFields(resource.data);

      allow update: if
        // ✅ Mantener validaciones de estructura
        validateTaskStructure(resource.data) &&
        validateTaskContent(resource.data) &&
        // ✅ No permitir cambios en campos del sistema
        !('createdAt' in resource.data) &&
        // ✅ Verificar que updatedAt se actualice
        resource.data.updatedAt == request.time;

      allow delete: if
        // 🗑️ Por ahora permitir eliminación (cambiaremos con auth)
        true;
    }

    // 🚫 DENEGAR TODO LO DEMÁS
    match /{document=**} {
      allow read, write: if false;
    }
  }

  // 🎯 FUNCIONES DE VALIDACIÓN

  // ✅ Validar estructura básica de tarea
  function validateTaskStructure(data) {
    return data.keys().hasAll(['title', 'description', 'completed', 'createdAt', 'updatedAt']) &&
           data.keys().hasOnly(['title', 'description', 'completed', 'createdAt', 'updatedAt']);
  }

  // ✅ Validar contenido de campos
  function validateTaskContent(data) {
    return
      // 📝 Título: string, no vacío, máximo 100 caracteres
      data.title is string &&
      data.title.size() > 0 &&
      data.title.size() <= 100 &&

      // 📄 Descripción: string, máximo 500 caracteres
      data.description is string &&
      data.description.size() <= 500 &&

      // ☑️ Completado: boolean
      data.completed is bool &&

      // 📅 Timestamps: son timestamps válidos
      data.createdAt is timestamp &&
      data.updatedAt is timestamp;
  }

  // ✅ Validar campos requeridos en creación
  function validateRequiredFields(data) {
    return
      // 📝 Título es requerido y no vacío
      data.title != null &&
      data.title != '' &&

      // 📅 CreatedAt debe ser tiempo actual
      data.createdAt == request.time &&

      // 📅 UpdatedAt debe ser igual a createdAt en creación
      data.updatedAt == request.time &&

      // ☑️ Completed debe iniciar en false
      data.completed == false;
  }
}
```

#### Paso 3: Reglas de desarrollo vs producción
> **Concepto:** Diferentes niveles de seguridad según el entorno

```javascript
// 🔧 REGLAS PARA DESARROLLO (MÁS PERMISIVAS)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /tasks/{taskId} {
      // 🚀 DESARROLLO: Más permisivo para testing
      allow read, write: if
        // ✅ Validar estructura básica
        validateBasicTaskStructure() &&
        // ⚠️ Logs para debugging (solo desarrollo)
        debug(resource.data);

      // 🛡️ Prevenir spam básico incluso en desarrollo
      allow create: if
        validateBasicTaskStructure() &&
        // 📏 Límite de tamaño total del documento
        resource.data.size() < 1000;
    }

    // 🔍 COLECCIÓN DE LOGS DE DESARROLLO (temporal)
    match /dev-logs/{logId} {
      allow read, write: if true; // Solo para debugging
    }

    function validateBasicTaskStructure() {
      return request.resource.data != null &&
             'title' in request.resource.data &&
             request.resource.data.title is string;
    }

    function debug(data) {
      // 🔍 En desarrollo, siempre retorna true pero loggea
      return true;
    }
  }
}

// 🔒 REGLAS PARA PRODUCCIÓN (MÁS ESTRICTAS)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /tasks/{taskId} {
      // 👀 Lectura: Preparada para autenticación futura
      allow read: if
        // 🔐 TODO: Agregar validación de usuario
        // request.auth != null &&
        true; // Por ahora permitir, cambiar cuando tengamos auth

      // ✍️ Escritura: Estricta validación
      allow create: if
        validateFullTaskStructure() &&
        validateTaskLimits() &&
        validateNoMaliciousContent();

      allow update: if
        validateFullTaskStructure() &&
        validateUpdatePermissions() &&
        validateNoMaliciousContent();

      allow delete: if
        // 🔐 TODO: Solo el creador puede eliminar
        // request.auth != null &&
        // request.auth.uid == resource.data.createdBy
        true; // Por ahora permitir, cambiar con auth
    }

    // 🚫 DENEGAR acceso a colecciones no definidas
    match /{document=**} {
      allow read, write: if false;
    }
  }

  // 🎯 FUNCIONES ESTRICTAS DE PRODUCCIÓN

  function validateFullTaskStructure() {
    let data = request.resource.data;
    return
      // ✅ Estructura exacta requerida
      data.keys().hasAll(['title', 'description', 'completed', 'createdAt', 'updatedAt']) &&
      data.keys().hasOnly(['title', 'description', 'completed', 'createdAt', 'updatedAt']) &&

      // ✅ Tipos correctos
      data.title is string &&
      data.description is string &&
      data.completed is bool &&
      data.createdAt is timestamp &&
      data.updatedAt is timestamp;
  }

  function validateTaskLimits() {
    let data = request.resource.data;
    return
      // 📏 Límites de longitud
      data.title.size() >= 1 && data.title.size() <= 100 &&
      data.description.size() <= 500 &&

      // 📅 Timestamps válidos
      data.createdAt <= request.time &&
      data.updatedAt <= request.time;
  }

  function validateUpdatePermissions() {
    let existingData = resource.data;
    let newData = request.resource.data;

    return
      // 🚫 No cambiar createdAt
      newData.createdAt == existingData.createdAt &&

      // ✅ Actualizar updatedAt
      newData.updatedAt == request.time &&

      // 🔍 Cambios lógicos (al menos un campo diferente)
      (newData.title != existingData.title ||
       newData.description != existingData.description ||
       newData.completed != existingData.completed);
  }

  function validateNoMaliciousContent() {
    let data = request.resource.data;
    return
      // 🚫 Prevenir contenido sospechoso
      !data.title.matches('.*<script.*') &&
      !data.title.matches('.*javascript:.*') &&
      !data.description.matches('.*<script.*') &&
      !data.description.matches('.*javascript:.*') &&

      // 📏 Tamaño total del documento
      request.resource.data.size() < 2000;
  }
}
```

#### Paso 4: Testing de reglas localmente
> **Archivo:** `FIRESTORE_RULES.md` (documentación)
> **Acción:** Guía de testing y validación

```markdown
# 🔒 Testing de Reglas de Seguridad de Firestore

## 🎯 Comandos básicos de testing

### Instalar Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Configurar proyecto local
```bash
firebase init firestore
# Elegir proyecto existente
# Usar rules por defecto
```

### Ejecutar tests locales
```bash
# 🧪 Modo interactivo
firebase emulators:start --only firestore

# 🔍 Con UI de testing
firebase emulators:start --only firestore --import=./seed-data
```

## ✅ Casos de prueba críticos

### 1. Crear tarea válida ✅
```javascript
// Debe PERMITIR
{
  "title": "Tarea válida",
  "description": "Descripción normal",
  "completed": false,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

### 2. Crear tarea inválida ❌
```javascript
// Debe RECHAZAR - título vacío
{
  "title": "",
  "description": "Sin título",
  "completed": false,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}

// Debe RECHAZAR - estructura incorrecta
{
  "titulo": "Error en nombre de campo",
  "completed": false
}

// Debe RECHAZAR - tipo incorrecto
{
  "title": 123, // Debe ser string
  "completed": "true" // Debe ser boolean
}
```

### 3. Actualizar tarea ✅/❌
```javascript
// Debe PERMITIR - actualización normal
{
  "title": "Nuevo título",
  "description": "Nueva descripción",
  "completed": true,
  "createdAt": "2024-01-01T10:00:00Z", // Sin cambios
  "updatedAt": "2024-01-01T11:00:00Z"  // Actualizado
}

// Debe RECHAZAR - cambiar createdAt
{
  "title": "Título",
  "createdAt": "2024-01-01T11:00:00Z", // ❌ Cambió
  "updatedAt": "2024-01-01T11:00:00Z"
}
```

## 🔍 Debugging de reglas

### Logs en Firebase Console
1. Ir a Firebase Console > Firestore > Reglas
2. Ver "Logs de reglas" para errores
3. Buscar operaciones rechazadas

### Testing con código JavaScript
```javascript
// 🧪 Test básico de creación
const testCreateTask = async () => {
  try {
    const result = await addDoc(collection(db, 'tasks'), {
      title: "Test task",
      description: "Testing security rules",
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log("✅ Tarea creada:", result.id);
  } catch (error) {
    console.error("❌ Error de reglas:", error.code, error.message);
  }
};
```

## ⚠️ Errores comunes y soluciones

### Error: "Missing or insufficient permissions"
- **Causa**: Reglas muy estrictas o mal configuradas
- **Solución**: Verificar que las reglas coinciden con la estructura de datos

### Error: "Invalid argument in function call"
- **Causa**: Validación de tipos incorrecta en reglas
- **Solución**: Usar `is string`, `is number`, `is bool` correctamente

### Error: "Function not defined"
- **Causa**: Función personalizada mal definida
- **Solución**: Verificar sintaxis y ubicación de funciones

## 🔄 Flujo de deployment

### Desarrollo local → Testing → Producción
1. **Desarrollo**: Reglas permisivas para testing
2. **Testing**: Ejecutar suite completa de pruebas
3. **Staging**: Reglas de producción con datos de prueba
4. **Producción**: Reglas finales con autenticación

### Comando de deploy
```bash
firebase deploy --only firestore:rules
```

## 📋 Checklist pre-deployment

- [ ] ✅ Crear tarea válida funciona
- [ ] ❌ Crear tarea inválida es rechazada
- [ ] ✅ Actualizar tarea válida funciona
- [ ] ❌ Actualizar createdAt es rechazada
- [ ] ✅ Leer tareas funciona
- [ ] ❌ Acceder a otras colecciones es rechazado
- [ ] 🔍 Logs no muestran errores inesperados
```

#### Paso 5: Implementar reglas en el proyecto
> **Acción:** Aplicar reglas al Firebase Console

```javascript
// 🚀 REGLAS FINALES PARA EL PROYECTO ACTUAL
// Copiar y pegar en Firebase Console > Firestore > Reglas

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 📋 COLECCIÓN DE TAREAS
    match /tasks/{taskId} {

      // 👀 LECTURA: Abierta por ahora (cambiar con autenticación)
      allow read: if true;

      // ✍️ CREACIÓN: Validación estricta
      allow create: if
        validateTaskCreate(request.resource.data);

      // 📝 ACTUALIZACIÓN: Mantener integridad
      allow update: if
        validateTaskUpdate(request.resource.data, resource.data);

      // 🗑️ ELIMINACIÓN: Abierta por ahora (cambiar con autenticación)
      allow delete: if true;
    }

    // 🚫 DENEGAR todo lo demás
    match /{document=**} {
      allow read, write: if false;
    }
  }

  // 🎯 FUNCIÓN: Validar creación de tarea
  function validateTaskCreate(data) {
    return
      // ✅ Estructura correcta
      data.keys().hasAll(['title', 'description', 'completed', 'createdAt', 'updatedAt']) &&
      data.keys().hasOnly(['title', 'description', 'completed', 'createdAt', 'updatedAt']) &&

      // ✅ Tipos correctos
      data.title is string &&
      data.description is string &&
      data.completed is bool &&
      data.createdAt is timestamp &&
      data.updatedAt is timestamp &&

      // ✅ Validaciones de contenido
      data.title.size() > 0 && data.title.size() <= 100 &&
      data.description.size() <= 500 &&

      // ✅ Valores iniciales correctos
      data.completed == false &&
      data.createdAt == request.time &&
      data.updatedAt == request.time &&

      // 🛡️ Sin contenido malicioso básico
      !data.title.matches('.*<script.*') &&
      !data.description.matches('.*<script.*');
  }

  // 🎯 FUNCIÓN: Validar actualización de tarea
  function validateTaskUpdate(newData, oldData) {
    return
      // ✅ Mantener estructura
      newData.keys().hasAll(['title', 'description', 'completed', 'createdAt', 'updatedAt']) &&
      newData.keys().hasOnly(['title', 'description', 'completed', 'createdAt', 'updatedAt']) &&

      // ✅ Tipos correctos
      newData.title is string &&
      newData.description is string &&
      newData.completed is bool &&
      newData.createdAt is timestamp &&
      newData.updatedAt is timestamp &&

      // ✅ Validaciones de contenido
      newData.title.size() > 0 && newData.title.size() <= 100 &&
      newData.description.size() <= 500 &&

      // 🚫 No cambiar createdAt
      newData.createdAt == oldData.createdAt &&

      // ✅ Actualizar updatedAt
      newData.updatedAt == request.time &&

      // 🛡️ Sin contenido malicioso
      !newData.title.matches('.*<script.*') &&
      !newData.description.matches('.*<script.*');
  }
}
```

---

### ✅ Resultado de la sesión

Al completar esta sesión tendrás:

**🔒 Seguridad implementada**
- ✅ Reglas de seguridad configuradas en Firestore
- ✅ Validación automática de estructura de datos
- ✅ Protección contra contenido malicioso básico
- ✅ Control de acceso preparado para autenticación

**🛡️ Protección de datos**
- ✅ Validación de tipos y tamaños
- ✅ Prevención de modificación de campos del sistema
- ✅ Límites para prevenir spam
- ✅ Estructura consistente garantizada

**📋 Documentación**
- ✅ Guía de testing de reglas
- ✅ Casos de prueba definidos
- ✅ Proceso de deployment documentado

### 🧪 Pruebas críticas

1. **Crear tarea válida** → Debe permitir
2. **Crear tarea sin título** → Debe rechazar
3. **Actualizar createdAt** → Debe rechazar
4. **Acceder a otra colección** → Debe rechazar
5. **Crear tarea con script** → Debe rechazar

### 📸 Capturas de verificación
1. **Firebase Console** → Reglas aplicadas
2. **Console del navegador** → Sin errores de permisos
3. **Firestore data** → Estructura consistente
4. **Testing local** → Pruebas pasando
5. **Logs de Firebase** → Sin errores de reglas

### ✨ CRUD completado

**¡Felicitaciones! Has completado el CRUD completo:**
- ✅ **CREATE** - Crear tareas con validación (Sesión 65)
- ✅ **READ** - Leer y mostrar tareas (Sesión 66)
- ✅ **UPDATE** - Editar tareas existentes (Sesión 67)
- ✅ **DELETE** - Eliminar con confirmación (Sesión 69)
- ✅ **VALIDATION** - Validar entradas (Sesión 70)
- ✅ **SECURITY** - Proteger con reglas (Sesión 71) 👈 **COMPLETADO**

### 🔄 Próxima sesión
**Sesión 73:** Introducción a Firebase Authentication - Preparar sistema de usuarios

---

**🎯 Conceptos clave aprendidos:**
- Firestore Security Rules básicas
- Validación a nivel de base de datos
- Protección contra contenido malicioso
- Diferencias entre desarrollo y producción
- Testing de reglas de seguridad
- Preparación para autenticación futura
