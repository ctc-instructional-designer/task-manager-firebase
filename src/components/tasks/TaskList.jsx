import { useState, useMemo } from "react";
import TaskItem from "./TaskItem";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { compareFirebaseDates } from "../../utils/dateUtils";

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, loading = false }) => {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    switch (filter) {
      case "pending":
        filtered = filtered.filter((task) => !task.completed);
        break;
      case "completed":
        filtered = filtered.filter((task) => task.completed);
        break;
      case "overdue":
        filtered = filtered.filter(
          (task) =>
            !task.completed &&
            task.dueDate &&
            new Date(task.dueDate) < new Date()
        );
        break;
      default:
        // 'all' - no filtrar
        break;
    }

    // Ordenar tareas
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "createdAt":
        default:
          return compareFirebaseDates(a.createdAt, b.createdAt);
      }
    });

    return filtered;
  }, [tasks, filter, sortBy]);

  const getTaskCounts = () => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(
      (task) =>
        !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
    ).length;

    return { total, completed, pending, overdue };
  };

  const counts = getTaskCounts();

  const filterOptions = [
    { value: "all", label: `Todas (${counts.total})` },
    { value: "pending", label: `Pendientes (${counts.pending})` },
    { value: "completed", label: `Completadas (${counts.completed})` },
    { value: "overdue", label: `Vencidas (${counts.overdue})` },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Fecha de creación" },
    { value: "title", label: "Título" },
    { value: "priority", label: "Prioridad" },
    { value: "dueDate", label: "Fecha límite" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando tareas...</span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No hay tareas
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando tu primera tarea.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles de filtro y ordenamiento */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Ordenar por:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de tareas */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No hay tareas que coincidan con el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Estadísticas resumen */}
      {tasks.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {counts.total}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {counts.pending}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {counts.completed}
              </div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {counts.overdue}
              </div>
              <div className="text-sm text-gray-600">Vencidas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
