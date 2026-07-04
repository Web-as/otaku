// Performance monitoring utilities

export const measurePerformance = (metricName: string, callback: () => void) => {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`[Performance] ${metricName}: ${(end - start).toFixed(2)}ms`);
};

export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

// Image optimization helper
export const optimizeImageUrl = (url: string, width?: number): string => {
  if (!url) return '';
  
  // For external URLs, add optimization params if supported
  if (url.includes('unsplash.com')) {
    return `${url}${url.includes('?') ? '&' : '?'}w=${width || 800}&q=80&fm=webp`;
  }
  
  return url;
};

// Debounce utility
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

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
