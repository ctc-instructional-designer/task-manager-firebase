import { useState, useEffect } from "react";

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar animación
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles =
      "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 max-w-sm";

    if (!isVisible) return `${baseStyles} translate-x-full opacity-0`;

    switch (type) {
      case "success":
        return `${baseStyles} bg-green-100 border border-green-300 text-green-800`;
      case "error":
        return `${baseStyles} bg-red-100 border border-red-300 text-red-800`;
      case "warning":
        return `${baseStyles} bg-yellow-100 border border-yellow-300 text-yellow-800`;
      default:
        return `${baseStyles} bg-blue-100 border border-blue-300 text-blue-800`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
