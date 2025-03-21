
// Utility functions

/**
 * Combines multiple class names into a single string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Format a date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  
  return new Date(date).toLocaleDateString(
    undefined, 
    { ...defaultOptions, ...options }
  );
}

/**
 * Format a time string
 */
export function formatTime(date, options = {}) {
  const defaultOptions = {
    hour: "2-digit",
    minute: "2-digit"
  };
  
  return new Date(date).toLocaleTimeString(
    undefined, 
    { ...defaultOptions, ...options }
  );
}
