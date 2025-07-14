import { useEffect, useRef } from 'react';

interface PostMessageStyleConfig {
  styles: Record<string, string>;
  targetOrigin?: string;
}

export const usePostMessageStyling = (config: PostMessageStyleConfig) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const sendStyleMessage = () => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      // Send styling message to iframe
      const message = {
        type: 'APPLY_STYLES',
        styles: config.styles,
        timestamp: Date.now()
      };

      try {
        iframe.contentWindow.postMessage(message, config.targetOrigin || '*');
        console.log('📤 Style message sent to iframe:', message);
      } catch (error) {
        console.warn('⚠️ Failed to send style message:', error);
      }
    };

    const handleLoad = () => {
      // Wait a bit for the iframe content to fully load
      setTimeout(sendStyleMessage, 1000);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      if (iframe.contentDocument?.readyState === 'complete') {
        handleLoad();
      } else {
        iframe.addEventListener('load', handleLoad);
      }
    }

    // Listen for responses from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'STYLES_APPLIED') {
        console.log('✅ Styles applied successfully in iframe');
      } else if (event.data.type === 'STYLES_ERROR') {
        console.error('❌ Error applying styles in iframe:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
    };
  }, [config]);

  return iframeRef;
};

export default usePostMessageStyling; 
