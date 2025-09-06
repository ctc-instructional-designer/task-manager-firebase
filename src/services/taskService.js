import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { compareFirebaseDates } from "../utils/dateUtils";

// Crear nueva tarea
export const createTask = async (taskData, userId) => {
  try {
    console.log("Intentando crear tarea:", { taskData, userId });

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const taskToCreate = {
      ...taskData,
      userId,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("Datos de tarea a crear:", taskToCreate);

    const docRef = await addDoc(collection(db, "tasks"), taskToCreate);

    console.log("Tarea creada exitosamente con ID:", docRef.id);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error detallado al crear tarea:", error);
    console.error("Código de error:", error.code);
    console.error("Mensaje de error:", error.message);

    // Traducir errores comunes
    let errorMessage = error.message;
    if (error.code === "permission-denied") {
      errorMessage =
        "No tienes permisos para crear tareas. Verifica las reglas de Firestore.";
    } else if (error.code === "unauthenticated") {
      errorMessage = "Debes estar autenticado para crear tareas.";
    }

    return { success: false, error: errorMessage };
  }
};

// Leer todas las tareas de un usuario
export const getTasks = async (userId) => {
  try {
    // Consulta simple sin ordenamiento (no requiere índice)
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Ordenar manualmente en el cliente
    tasks.sort((a, b) => compareFirebaseDates(a.createdAt, b.createdAt));

    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return { success: false, error: error.message };
  }
};

// Escuchar cambios en tiempo real para un usuario
export const subscribeToTasks = (userId, callback, errorCallback) => {
  if (!userId) {
    console.warn("No userId provided to subscribeToTasks");
    return () => {};
  }

  console.log("Suscribiéndose a tareas para usuario:", userId);

  // Consulta simple sin ordenamiento (no requiere índice)
  const q = query(collection(db, "tasks"), where("userId", "==", userId));

  return onSnapshot(
    q,
    (querySnapshot) => {
      console.log(
        "Snapshot recibido, número de documentos:",
        querySnapshot.size
      );

      const tasks = [];
      querySnapshot.forEach((doc) => {
        const taskData = {
          id: doc.id,
          ...doc.data(),
        };
        console.log("Tarea encontrada:", taskData);
        tasks.push(taskData);
      });

      // Ordenar manualmente en el cliente por fecha de creación (más reciente primero)
      tasks.sort((a, b) => compareFirebaseDates(a.createdAt, b.createdAt));

      console.log("Total de tareas obtenidas:", tasks.length);
      callback(tasks);
    },
    (error) => {
      console.error("Error en el listener de tareas:", error);
      console.error("Código de error:", error.code);

      if (error.code === "permission-denied") {
        console.error("Error de permisos: Verifica las reglas de Firestore");
      }

      if (errorCallback) {
        errorCallback(error);
      } else {
        callback([]);
      }
    }
  );
};

// Actualizar tarea
export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
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
    await deleteDoc(doc(db, "tasks", taskId));
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return { success: false, error: error.message };
  }
};

// Validar datos de tarea
export const validateTaskData = (title, description) => {
  const errors = [];

  if (!title || !title.trim()) {
    errors.push("El título es obligatorio");
  }

  if (title && title.trim().length > 100) {
    errors.push("El título no puede exceder 100 caracteres");
  }

  if (description && description.length > 500) {
    errors.push("La descripción no puede exceder 500 caracteres");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
