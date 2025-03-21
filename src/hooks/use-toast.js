
// Simple toast implementation for JavaScript

// Toast container
let toastContainer = null;

// Create toast container if it doesn't exist
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed bottom-4 right-4 flex flex-col gap-2 z-50';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration = 3000 }) => {
    const container = getToastContainer();
    
    // Create toast element
    const toastElement = document.createElement('div');
    toastElement.className = `
      p-4 rounded-md shadow-lg min-w-[300px] max-w-md flex flex-col gap-1 
      ${variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-white text-gray-900 border'}
      transform translate-y-2 opacity-0 transition-all duration-300
    `;
    
    // Create title if provided
    if (title) {
      const titleElement = document.createElement('div');
      titleElement.className = 'font-semibold';
      titleElement.textContent = title;
      toastElement.appendChild(titleElement);
    }
    
    // Create description if provided
    if (description) {
      const descElement = document.createElement('div');
      descElement.className = 'text-sm';
      descElement.textContent = description;
      toastElement.appendChild(descElement);
    }
    
    // Add to container
    container.appendChild(toastElement);
    
    // Animate in
    setTimeout(() => {
      toastElement.classList.replace('translate-y-2', 'translate-y-0');
      toastElement.classList.replace('opacity-0', 'opacity-100');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      toastElement.classList.replace('translate-y-0', 'translate-y-2');
      toastElement.classList.replace('opacity-100', 'opacity-0');
      
      // Remove element after animation completes
      setTimeout(() => {
        container.removeChild(toastElement);
      }, 300);
    }, duration);
  };
  
  return { toast };
}
