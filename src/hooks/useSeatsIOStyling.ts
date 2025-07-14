import { useEffect, useRef } from 'react';

interface SeatsIOStyleConfig {
  height?: string;
  width?: string;
  left?: string;
  top?: string;
  perspectiveXCenter?: string;
  touchAction?: string;
  userSelect?: string;
  cursor?: string;
  clipPath?: string;
}

export const useSeatsIOStyling = (config: SeatsIOStyleConfig) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyStyles = () => {
      if (!containerRef.current) return;

      // Find the SeatsIO iframe container
      const seatsIOContainer = containerRef.current.querySelector('[class*="Floors"]') as HTMLElement;
      
      if (seatsIOContainer) {
        // Apply styles to the container that holds the iframe
        if (config.height) seatsIOContainer.style.height = config.height;
        if (config.width) seatsIOContainer.style.width = config.width;
        if (config.left) seatsIOContainer.style.left = config.left;
        if (config.top) seatsIOContainer.style.top = config.top;
        if (config.perspectiveXCenter) {
          seatsIOContainer.style.setProperty('--perspective-x-center', config.perspectiveXCenter);
        }
        if (config.touchAction) seatsIOContainer.style.touchAction = config.touchAction;
        if (config.userSelect) seatsIOContainer.style.userSelect = config.userSelect;
        if (config.cursor) seatsIOContainer.style.cursor = config.cursor;
        if (config.clipPath) seatsIOContainer.style.clipPath = config.clipPath;

        console.log('✅ SeatsIO styles applied successfully');
      } else {
        // Retry after a short delay if the container isn't ready yet
        setTimeout(applyStyles, 100);
      }
    };

    // Apply styles when the component mounts
    applyStyles();

    // Set up a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      applyStyles();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [config]);

  return containerRef;
};

export default useSeatsIOStyling; 
