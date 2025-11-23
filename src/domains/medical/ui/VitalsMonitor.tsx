import React, { useEffect, useRef, useState } from 'react';
import { VitalSigns } from '../types';

interface VitalsMonitorProps {
  vitalSigns: VitalSigns;
  criticality: 'stable' | 'deteriorating' | 'critical' | 'terminal';
  className?: string;
}

export const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ 
  vitalSigns, 
  criticality,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<number[]>([]);
  
  // Configuration based on criticality
  const getConfig = () => {
    switch (criticality) {
      case 'terminal': return { color: '#ff0000', speed: 2, noise: 0.5 };
      case 'critical': return { color: '#ff4400', speed: 1.5, noise: 0.3 };
      case 'deteriorating': return { color: '#ffcc00', speed: 1.2, noise: 0.1 };
      default: return { color: '#00ff00', speed: 1, noise: 0.05 };
    }
  };

  // ECG Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    let lastTime = Date.now();
    
    // ECG Parameters
    // P-QRS-T wave simulation
    const drawECG = () => {
      const config = getConfig();
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Clear previous column to create "scan" effect
      ctx.clearRect(x, 0, 5, canvas.height);
      
      // Calculate Y position (ECG wave)
      // Base rhythm driven by Heart Rate
      const bps = vitalSigns.heartRate / 60;
      const cycleTime = (now / 1000) * bps % 1;
      
      let y = canvas.height / 2;
      
      // Simple QRS complex simulation
      if (cycleTime < 0.1) y -= 5; // P wave
      else if (cycleTime > 0.15 && cycleTime < 0.2) y += 20; // Q
      else if (cycleTime > 0.2 && cycleTime < 0.25) y -= 60; // R (Spike)
      else if (cycleTime > 0.25 && cycleTime < 0.3) y += 15; // S
      else if (cycleTime > 0.4 && cycleTime < 0.5) y -= 10; // T wave
      
      // Add noise/jitter based on criticality
      y += (Math.random() - 0.5) * config.noise * 20;

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      // We need the previous point to draw a line, but for simplicity in this scan-line approach,
      // we can just draw dots or short lines. 
      // Better: Keep track of prevY.
      
      // For this implementation, let's just draw pixels for now or short segments.
      // A proper ECG needs a buffer. 
      // Let's use a simplified approach: Draw a point.
      ctx.fillStyle = config.color;
      ctx.fillRect(x, y, 2, 2);
      
      // Move X
      x += config.speed;
      if (x > canvas.width) {
        x = 0;
      }

      animationFrameId = requestAnimationFrame(drawECG);
    };

    animationFrameId = requestAnimationFrame(drawECG);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [vitalSigns, criticality]);

  return (
    <div className={`bg-black/80 border border-gray-800 rounded-lg p-4 font-mono ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider">Patient Vitals</h3>
        <div className={`w-2 h-2 rounded-full ${
          criticality === 'stable' ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-ping'
        }`} />
      </div>
      
      {/* ECG Canvas */}
      <div className="relative h-24 w-full bg-black/50 rounded border border-gray-900 mb-4 overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={96} 
          className="w-full h-full"
        />
        <div className="absolute top-2 right-2 text-xs font-bold" style={{ color: getConfig().color }}>
          ECG II
        </div>
      </div>

      {/* Numeric Vitals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">HR (bpm)</span>
          <span className={`text-2xl font-bold ${
            vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60 ? 'text-red-500' : 'text-green-500'
          }`}>
            {Math.round(vitalSigns.heartRate)}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">BP (mmHg)</span>
          <span className="text-xl font-bold text-blue-400">
            {vitalSigns.bloodPressure}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500">SpO2 (%)</span>
          <span className={`text-xl font-bold ${
            vitalSigns.oxygenSaturation < 95 ? 'text-yellow-500' : 'text-cyan-500'
          }`}>
            {Math.round(vitalSigns.oxygenSaturation)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500">RR (bpm)</span>
          <span className="text-xl font-bold text-purple-400">
            {Math.round(vitalSigns.respiratoryRate)}
          </span>
        </div>
      </div>
    </div>
  );
};
