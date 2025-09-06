import { useAuth } from "./hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import TasksPage from "./pages/TasksPage";
import Spinner from "./components/ui/Spinner";

function App() {
  const { user, loading } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Renderizar página según el estado de autenticación
  return user ? <TasksPage /> : <AuthPage />;
}

export default App;
