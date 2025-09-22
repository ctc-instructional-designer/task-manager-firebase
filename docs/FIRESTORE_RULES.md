# Reglas de Firestore para el Gestor de Tareas

## Para configurar las reglas en Firebase Console:

1. Ve a **Firestore Database** > **Rules**
2. Reemplaza el contenido actual con las siguientes reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para la colección de tareas
    match /tasks/{taskId} {
      // Permitir lectura y escritura solo al usuario propietario
      allow read, write: if request.auth != null &&
                           request.auth.uid == resource.data.userId;

      // Permitir crear solo si el usuario está autenticado y
      // es el propietario de la tarea que está creando
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.userId &&
                       validateTaskData(request.resource.data);

      // Permitir actualizar solo si el usuario está autenticado y
      // es el propietario de la tarea
      allow update: if request.auth != null &&
                       request.auth.uid == resource.data.userId &&
                       request.auth.uid == request.resource.data.userId &&
                       validateTaskData(request.resource.data);
    }

    // Función para validar los datos de la tarea
    function validateTaskData(data) {
      return data.keys().hasAll(['title', 'userId', 'completed', 'priority']) &&
             data.title is string &&
             data.title.size() > 0 &&
             data.title.size() <= 100 &&
             data.userId is string &&
             data.completed is bool &&
             data.priority in ['low', 'medium', 'high'] &&
             ((!('description' in data)) || (data.description is string && data.description.size() <= 500)) &&
             ((!('dueDate' in data)) || data.dueDate is string);
    }
  }
}
```

## Reglas simplificadas para desarrollo (menos estrictas):

Si tienes problemas con las reglas anteriores, puedes usar estas más simples:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null &&
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Para testing (NO usar en producción):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Instrucciones:

1. **Para desarrollo**: Usar las reglas simplificadas
2. **Para producción**: Usar las reglas completas con validación
3. **Para testing rápido**: Usar las reglas de testing (temporal)

⚠️ **Importante**: Después de cambiar las reglas, puede tomar unos minutos en propagarse.

## Verificar que las reglas funcionan:

Si tienes problemas para guardar tareas, verifica en la consola del navegador:
- Mensajes de error relacionados con permisos
- Errores de "permission-denied"

También puedes verificar en Firebase Console > Firestore > Rules:
- El simulador de reglas para probar consultas
- Los logs de reglas para ver qué está fallando
