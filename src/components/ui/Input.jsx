import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, className = "", required = false, ...props }, ref) => {
    const inputClasses = `
    input-field
    ${error ? "border-red-300 focus:ring-red-500" : ""}
    ${className}
  `.trim();

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
