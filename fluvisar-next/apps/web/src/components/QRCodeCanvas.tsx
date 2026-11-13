import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({ value, size = 160, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch((err) => {
        console.error('Failed to generate QR code:', err);
      });
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`rounded shadow-xs border border-slate-200 bg-white ${className}`}
      title={value}
    />
  );
};

