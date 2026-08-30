import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Square, 
  Trash2, 
  Undo2, 
  Download, 
  Palette, 
  Sparkles,
  Info,
  CircleDot
} from 'lucide-react';

interface WhiteboardCanvasProps {
  isReadOnly?: boolean;
  initialDrawing?: string; // base64 representation
  onDrawingChange?: (base64: string) => void;
  syncIntervalMs?: number;
}

export default function WhiteboardCanvas({
  isReadOnly = false,
  initialDrawing = '',
  onDrawingChange,
  syncIntervalMs = 1500
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#061F48'); // Default brand deep blue
  const [brushSize, setBrushSize] = useState(4);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  
  // Track context and canvas status
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const colors = [
    { value: '#061F48', name: 'Deep Blue' },
    { value: '#D09515', name: 'Board Gold' },
    { value: '#EF4444', name: 'Alert Red' },
    { value: '#10B981', name: 'Forest Green' },
    { value: '#000000', name: 'Pure Black' },
    { value: '#8B5CF6', name: 'Doubt Purple' }
  ];

  const brushSizes = [
    { value: 2, label: 'Thin' },
    { value: 4, label: 'Medium' },
    { value: 8, label: 'Thick' },
    { value: 16, label: 'Marker' }
  ];

  // Initialize Canvas dimensions on mount and window resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      // Create offscreen canvas to preserve state during resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      const rect = canvas.parentElement?.getBoundingClientRect();
      const newWidth = rect?.width || 800;
      const newHeight = rect?.height || 450;
      
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Fill background white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Restore drawing content if existed, stretching slightly to fit container or Centered
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Update canvas when initialDrawing changes (mainly for student viewer)
  useEffect(() => {
    if (isReadOnly && initialDrawing) {
      const img = new Image();
      img.src = initialDrawing;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
      };
    }
  }, [initialDrawing, isReadOnly]);

  // Clean wipe board
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current to undo stack
    saveToUndoStack(canvas.toDataURL());

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Broadcast clear event
    if (onDrawingChange) {
      onDrawingChange(canvas.toDataURL());
    }
  };

  const saveToUndoStack = (dataUrl: string) => {
    setUndoStack(prev => {
      const next = [...(prev || []), dataUrl];
      if (next.length > 20) next.shift(); // Keep limit of 20
      return next;
    });
  };

  // Undo stroke
  const undoLast = () => {
    if ((undoStack || []).length === 0) return;
    const previousState = (undoStack || [])[(undoStack || []).length - 1];
    setUndoStack(prev => (prev || []).slice(0, (prev || []).length - 1));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      if (onDrawingChange) {
        onDrawingChange(canvas.toDataURL());
      }
    };
  };

  // Helper: Get mouse or touch coordinates relative to canvas
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Check if Touch Event
    if ('touches' in e) {
      if ((e.touches || []).length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    e.preventDefault();
    const pos = getCoordinates(e);
    
    const canvas = canvasRef.current;
    if (canvas) {
      saveToUndoStack(canvas.toDataURL());
    }

    setLastPos(pos);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isReadOnly) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pos = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setLastPos(pos);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Trigger change callback for real-time local storage sync
    const canvas = canvasRef.current;
    if (canvas && onDrawingChange) {
      onDrawingChange(canvas.toDataURL());
    }
  };

  // Trigger download of whiteboard sketch
  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whiteboard-boardprep-export.png`;
    link.href = url;
    link.click();
  };

  return (
    <div ref={containerRef} className="space-y-4 w-full">
      
      {/* TOOLBAR CONTROLS (Only visible to drawing users e.g. Teachers) */}
      {!isReadOnly && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#F8F5ED] border border-[#061F48]/15 rounded-2xl shadow-inner">
          
          {/* Colors Palette Picker */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/60 flex items-center gap-1">
              <Palette className="h-3.5 w-3.5 text-[#D09515]" />
              Color:
            </span>
            <div className="flex items-center gap-1.5">
              {colors.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  title={c.name}
                  onClick={() => setColor(c.value)}
                  className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center ${color === c.value ? 'border-[#061F48] scale-110 ring-2 ring-[#061F48]/20' : 'border-[#061F48]/10 hover:scale-105'}`}
                  style={{ backgroundColor: c.value }}
                >
                  {color === c.value && (
                    <CircleDot className="h-3.5 w-3.5 text-white mix-blend-difference" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brush Sizes Slider */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/60">Size:</span>
            <div className="flex items-center bg-white px-2 py-1 rounded-xl border border-[#061F48]/10 gap-1">
              {brushSizes.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setBrushSize(b.value)}
                  className={`px-2 py-1 text-[9px] font-black rounded-md transition-all ${brushSize === b.value ? 'bg-[#061F48] text-white' : 'text-[#061F48]/70 hover:bg-gray-100'}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions (Undo, Wipe, Export) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={undoLast}
              disabled={(undoStack || []).length === 0}
              className="p-2.5 bg-white border border-[#061F48]/10 rounded-xl text-[#061F48] hover:bg-[#061F48]/5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title="Undo Last Stroke"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={clearCanvas}
              className="px-3.5 py-2.5 bg-[#F8F5ED] border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
              title="Clean Whiteboard"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Wipe Board</span>
            </button>
            <button
              type="button"
              onClick={downloadDrawing}
              className="px-3.5 py-2.5 bg-[#061F48] text-white rounded-xl hover:bg-[#D09515] transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm"
              title="Save Image Local"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>

        </div>
      )}

      {/* CANVAS ELEMENT OR RENDERBOX */}
      <div className="relative w-full aspect-[16/9] md:aspect-[16/9.5] bg-white border-2 border-[#061F48]/10 rounded-[2rem] overflow-hidden shadow-inner flex items-center justify-center">
        
        {isReadOnly && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#061F48]/90 text-white px-2.5 py-1 rounded-full text-[9px] font-bold shadow-sm backdrop-blur-sm border border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse"></span>
            <span>Teacher's Live Draw Feed</span>
          </div>
        )}

        {!isReadOnly && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-[#F8F5ED]/90 text-[#061F48] px-2.5 py-1 rounded-full text-[9px] font-bold border border-[#061F48]/10 shadow-sm pointer-events-none select-none">
            <Sparkles className="h-3.5 w-3.5 text-[#D09515] animate-spin" />
            <span>Interactive Draw Active</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-full block bg-white ${isReadOnly ? 'pointer-events-none' : 'cursor-crosshair touch-none'}`}
        />

        {/* Empty placeholder guide (mainly for teacher startup) */}
        {!isReadOnly && (undoStack || []).length === 0 && !isDrawing && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-8 text-[#061F48]/25">
            <Info className="h-10 w-10 text-[#061F48]/15 mb-2" />
            <p className="text-xs font-black uppercase tracking-widest">Draw Whiteboard Canvas</p>
            <p className="text-[10px] font-semibold mt-1">Draw diagrams, write formulas or point concepts with mouse or stylus pen!</p>
          </div>
        )}
      </div>

    </div>
  );
}
