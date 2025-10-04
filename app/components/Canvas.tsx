'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const CanvasComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading X-RAI...');
  const initializingRef = useRef(false);
  const canvasInstanceRef = useRef<any>(null);

  useEffect(() => {
    let disposed = false;

    if (canvasRef.current && typeof window !== 'undefined' && !initializingRef.current) {
      initializingRef.current = true;

      import('../../src/canvas').then(({ default: Canvas }) => {
        try {
          // Global singleton guard for dev HMR and double mounts
          if (typeof window !== 'undefined' && (window as any).__XRAI_CANVAS_ACTIVE__) {
            console.warn('⚠️ Canvas already active, skipping second initialization');
            setIsLoaded(true);
            return;
          }

          console.log('🎮 Initializing Canvas...');
          setLoadingMessage('Loading 3D medical model...');
          
          if (!canvasInstanceRef.current) {
            canvasInstanceRef.current = new Canvas(canvasRef.current!);
          }
          if (typeof window !== 'undefined') {
            (window as any).__XRAI_CANVAS_ACTIVE__ = true;
          }
          console.log('✅ Canvas initialized successfully');
          
          // Show UI after canvas initialization
          setTimeout(() => {
            setLoadingMessage('🏥 Loading patient data...');
            setTimeout(() => {
              setIsLoaded(true);
            }, 1000);
          }, 1500);
        } catch (error) {
          console.error('❌ Canvas initialization failed:', error);
          initializingRef.current = false;
        }
      }).catch(error => {
        console.error('❌ Failed to import Canvas:', error);
        initializingRef.current = false;
      });
    }

    return () => {
      // Cleanup on unmount to avoid duplicate WebGL contexts and listeners
      if (canvasInstanceRef.current && typeof canvasInstanceRef.current.dispose === 'function') {
        try { canvasInstanceRef.current.dispose(); } catch {}
      }
      canvasInstanceRef.current = null;
      if (typeof window !== 'undefined') {
        (window as any).__XRAI_CANVAS_ACTIVE__ = false;
      }
      initializingRef.current = false;
      disposed = true;
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="webgl" style={{ display: isLoaded ? 'block' : 'none' }} />
      {!isLoaded && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem' }}>🏥</div>
          <div>{loadingMessage}</div>
        </div>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(CanvasComponent), {
  ssr: false,
});
