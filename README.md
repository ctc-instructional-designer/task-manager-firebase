# 📋 Firebase Task Manager

Un gestor de tareas moderno y completo construido con **React**, **Firebase** y **Tailwind CSS**.

![Firebase Task Manager](https://img.shields.io/badge/Firebase-Task%20Manager-orange?style=for-the-badge&logo=firebase)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 **Características principales**

### **🔐 Autenticación completa**
- ✅ Registro e inicio de sesión con email/contraseña
- ✅ Autenticación con Google OAuth
- ✅ Gestión de sesiones segura
- ✅ Logout y estados de autenticación

### **📝 Gestión avanzada de tareas**
- ✅ **CRUD completo**: Crear, leer, actualizar y eliminar tareas
- ✅ **Estados**: Marcar como completada/pendiente
- ✅ **Prioridades**: Alta, media y baja con colores distintivos
- ✅ **Fechas límite**: Opcional con detección de vencimiento
- ✅ **Sincronización en tiempo real** con Firebase

### **🎨 Interfaz moderna**
- ✅ **Diseño responsive**: Funciona en móviles, tablets y desktop
- ✅ **Componentes reutilizables**: Arquitectura modular
- ✅ **Estados de carga**: Spinners y feedback visual
- ✅ **Manejo de errores**: Alertas y validaciones
- ✅ **Tailwind CSS**: Estilos modernos y consistentes

### **🔍 Filtros y ordenamiento**
- ✅ **Filtros**: Todas, pendientes, completadas, vencidas
- ✅ **Ordenamiento**: Por fecha, título, prioridad
- ✅ **Búsqueda**: Interfaz intuitiva
- ✅ **Estadísticas**: Contadores y progreso visual

## 🏗️ **Arquitectura técnica**

### **🎯 Consultas simples de Firebase**
Este proyecto utiliza un enfoque de **consultas simples** que:
- **No requiere índices compuestos** en Firestore
- **Funciona inmediatamente** después de la configuración
- **Nunca genera errores** de "query requires an index"
- **Ordenamiento en el cliente** para máxima flexibilidad

### **📦 Estructura del proyecto**
```
src/
├── components/          # Componentes React reutilizables
│   ├── auth/           # Formularios de autenticación
│   ├── tasks/          # Componentes de gestión de tareas
│   ├── ui/             # Componentes de interfaz base
│   └── Layout.jsx      # Layout principal
├── hooks/              # Hooks personalizados
│   ├── useAuth.js      # Hook de autenticación
│   └── useTasks.js     # Hook de gestión de tareas
├── pages/              # Páginas principales
│   ├── AuthPage.jsx    # Página de autenticación
│   └── TasksPage.jsx   # Página principal de tareas
├── services/           # Servicios de Firebase
│   ├── firebase.js     # Configuración de Firebase
│   ├── authService.js  # Servicio de autenticación
│   └── taskService.js  # Servicio de tareas
└── utils/              # Utilidades
    └── dateUtils.js    # Manejo seguro de fechas
```

## 🚀 **Inicio rápido**

### **1. Prerrequisitos**
- Node.js 16+
- Cuenta de Firebase
- Git

### **2. Instalación**
```bash
# Clonar el repositorio
git clone <repository-url>
cd firebase-task-manager

# Instalar dependencias
npm install
```

### **3. Configuración de Firebase**
1. **Crear proyecto** en [Firebase Console](https://console.firebase.google.com/)
2. **Habilitar Authentication** (Email/Password y Google)
3. **Crear Firestore Database** en modo desarrollo
4. **Copiar configuración** del proyecto

### **4. Configurar Firebase**
Editar el archivo `src/services/firebase.js` con tu configuración:
```javascript
const firebaseConfig = {
  apiKey: "tu_api_key",
  authDomain: "tu_proyecto.firebaseapp.com",
  projectId: "tu_proyecto_id",
  storageBucket: "tu_proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu_app_id"
};
```

**Nota**: La configuración se incluye directamente en el código para simplicidad.

### **5. Ejecutar el proyecto**
```bash
npm run dev
```

🎉 **¡Listo!** Tu aplicación estará disponible en `http://localhost:3000`

## 📖 **Documentación**

| Documento | Descripción |
|-----------|-------------|
| [`SETUP.md`](./SETUP.md) | Guía de configuración paso a paso |
| [`SIMPLE_QUERIES_MIGRATION.md`](./SIMPLE_QUERIES_MIGRATION.md) | Explicación del enfoque de consultas simples |
| [`FIRESTORE_RULES.md`](./FIRESTORE_RULES.md) | Reglas de seguridad de Firestore |
| [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) | Solución de problemas comunes |
| [`DATE_ERROR_FIX.md`](./DATE_ERROR_FIX.md) | Solución a errores de fechas |

## 🛠️ **Scripts disponibles**

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Producción
npm run build        # Construir para producción
npm run preview      # Vista previa de la build

# Linting
npm run lint         # Verificar código
```

## 🔒 **Seguridad**

### **Reglas de Firestore**
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

### **Características de seguridad**
- ✅ **Autenticación obligatoria** para todas las operaciones
- ✅ **Aislamiento de datos** por usuario
- ✅ **Validación en cliente y servidor**
- ✅ **Reglas de Firestore** estrictas

## 🎯 **Casos de uso**

Este proyecto es ideal para:
- 📚 **Proyectos educativos** de React + Firebase
- 🏢 **Gestores de tareas** personales o de equipo
- 🚀 **Base para aplicaciones** más complejas
- 💼 **Portfolios** de desarrollo web
- 🎓 **Cursos y tutoriales** de desarrollo

## 🤝 **Contribuir**

1. Fork del proyecto
2. Crear branch de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver [`LICENSE`](./LICENSE) para más detalles.

## 🙏 **Reconocimientos**

- **Firebase** por la infraestructura backend
- **React** por el framework frontend
- **Tailwind CSS** por el sistema de estilos
- **Vite** por el tooling de desarrollo

---

**⭐ Si este proyecto te fue útil, no olvides darle una estrella!**

![Hecho con ❤️](https://img.shields.io/badge/Hecho%20con-❤️-red?style=flat-square)
