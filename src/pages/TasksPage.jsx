import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import Layout from "../components/Layout";
import TaskList from "../components/tasks/TaskList";
import TaskForm from "../components/tasks/TaskForm";
import Button from "../components/ui/Button";
import ErrorBoundary from "../components/ErrorBoundary";

const TasksPage = () => {
  const { user } = useAuth();
  const { tasks, loading, error, addTask, editTask, removeTask, clearError } =
    useTasks(user?.uid);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleCreateTask = async (taskData) => {
    setFormLoading(true);
    setActionError("");

    const result = await addTask(taskData);

    if (result.success) {
      setIsFormOpen(false);
      setActionError("");
    } else {
      console.error("Error creating task:", result.error);
      setActionError(result.error || "Error al crear la tarea");
    }

    setFormLoading(false);
  };

  const handleUpdateTask = async (taskId, updateData) => {
    // Si updateData es 'edit', significa que queremos editar la tarea
    if (updateData === "edit") {
      const taskToEdit = tasks.find((task) => task.id === taskId);
      setEditingTask(taskToEdit);
      setIsFormOpen(true);
      return;
    }

    setFormLoading(true);

    const result = await editTask(taskId, updateData);

    if (!result.success) {
      console.error("Error updating task:", result.error);
      setActionError(result.error || "Error al actualizar la tarea");
    } else {
      setActionError("");
    }

    setFormLoading(false);
  };

  const handleEditSubmit = async (taskData) => {
    if (!editingTask) return;

    setFormLoading(true);
    setActionError("");

    const result = await editTask(editingTask.id, taskData);

    if (result.success) {
      setIsFormOpen(false);
      setEditingTask(null);
      setActionError("");
    } else {
      console.error("Error updating task:", result.error);
      setActionError(result.error || "Error al actualizar la tarea");
    }

    setFormLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    const result = await removeTask(taskId);

    if (!result.success) {
      console.error("Error deleting task:", result.error);
      setActionError(result.error || "Error al eliminar la tarea");
    } else {
      setActionError("");
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setActionError("");
  };

  const handleClearError = () => {
    setActionError("");
    clearError();
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Alertas de error */}
        {(error || actionError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error || actionError}</p>
                </div>
              </div>
              <button
                onClick={handleClearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header con estadísticas */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Tareas</h1>
              <p className="mt-1 text-sm text-gray-600">
                Bienvenido de vuelta,{" "}
                {user?.displayName || user?.email || "Usuario"}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tasks.length}
                  </div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {pendingTasks}
                  </div>
                  <div className="text-gray-600">Pendientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {completedTasks}
                  </div>
                  <div className="text-gray-600">Completadas</div>
                </div>
              </div>

              <Button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Nueva Tarea
              </Button>
            </div>
          </div>

          {/* Barra de progreso */}
          {tasks.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progreso del día</span>
                <span className="font-medium text-gray-900">
                  {completedTasks} de {tasks.length} completadas
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      tasks.length > 0
                        ? (completedTasks / tasks.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Lista de tareas */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <ErrorBoundary>
            <TaskList
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              loading={loading}
            />
          </ErrorBoundary>
        </div>

        {/* Modal del formulario */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingTask ? handleEditSubmit : handleCreateTask}
          initialData={editingTask}
          loading={formLoading}
          error={actionError}
        />
      </div>
    </Layout>
  );
};

export default TasksPage;
