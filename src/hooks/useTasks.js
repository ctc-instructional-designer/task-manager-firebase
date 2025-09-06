import { useState, useEffect } from "react";
import {
  subscribeToTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

export const useTasks = (userId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const unsubscribe = subscribeToTasks(
      userId,
      (tasksData) => {
        console.log("Tareas recibidas en el hook:", tasksData.length);
        setTasks(tasksData);
        setLoading(false);
        setError("");
      },
      (error) => {
        console.error("Error en el listener de tareas:", error);

        let errorMessage = "Error al cargar las tareas.";

        if (error.code === "permission-denied") {
          errorMessage =
            "Sin permisos para acceder a las tareas. Verifica las reglas de Firestore.";
        } else if (error.code === "unauthenticated") {
          errorMessage = "Sesión expirada. Vuelve a iniciar sesión.";
        }

        setError(errorMessage);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addTask = async (taskData) => {
    if (!userId) return { success: false, error: "Usuario no autenticado" };

    try {
      const result = await createTask(taskData, userId);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (error) {
      const errorMessage = "Error al crear la tarea";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const editTask = async (taskId, updates) => {
    try {
      const result = await updateTask(taskId, updates);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (error) {
      const errorMessage = "Error al actualizar la tarea";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const removeTask = async (taskId) => {
    try {
      const result = await deleteTask(taskId);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (error) {
      const errorMessage = "Error al eliminar la tarea";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setError("");
  };

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return {
    tasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    addTask,
    editTask,
    removeTask,
    clearError,
  };
};
