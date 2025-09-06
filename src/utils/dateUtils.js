// Utilidades para manejo de fechas de Firebase
export const formatFirebaseDate = (timestamp, options = {}) => {
  if (!timestamp) {
    return options.fallback || "Fecha no disponible";
  }

  try {
    // Si es un timestamp de Firebase, convertir a Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...options.format,
    });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return options.fallback || "Fecha inválida";
  }
};

export const isFirebaseDateValid = (timestamp) => {
  return timestamp && (timestamp.toDate || timestamp instanceof Date);
};

export const compareFirebaseDates = (a, b) => {
  // Si ambas fechas no existen, son iguales
  if (!isFirebaseDateValid(a) && !isFirebaseDateValid(b)) return 0;

  // Si solo una fecha no existe, ponerla al final
  if (!isFirebaseDateValid(a)) return 1;
  if (!isFirebaseDateValid(b)) return -1;

  try {
    const dateA = a.toDate ? a.toDate() : new Date(a);
    const dateB = b.toDate ? b.toDate() : new Date(b);

    return dateB - dateA; // Orden descendente (más reciente primero)
  } catch (error) {
    console.error("Error al comparar fechas:", error);
    return 0;
  }
};
