/**
 * Performance monitoring utilities
 */

// Performance timing helper
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const start = performance.now();
  
  const finish = () => {
    const end = performance.now();
    const duration = end - start;
    console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
  };

  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(finish);
    } else {
      finish();
      return result;
    }
  } catch (error) {
    finish();
    throw error;
  }
};

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory usage monitoring (for development)
export const logMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('🧠 Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
    });
  }
};

// Component render tracking
export const trackRender = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${componentName} rendered at ${new Date().toLocaleTimeString()}`);
  }
};

// Network performance monitoring
export const measureNetworkRequest = async <T>(
  name: string,
  request: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await request();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`🌐 ${name}: ${duration.toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    console.error(`❌ ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};