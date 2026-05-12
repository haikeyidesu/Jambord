import { useJamboardStore } from '../store/useJamboardStore';
import type { ToolType } from '../types';

// Get the current editor instance from window (set by CanvasContent)
const getEditor = () => (window as any).__jamboardEditor;

interface ToolButtonProps {
  tool: ToolType;
  icon: React.ReactNode;
  label: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, icon, label }) => {
  const activeTool = useJamboardStore((state) => state.activeTool);
  const setActiveTool = useJamboardStore((state) => state.setActiveTool);
  
  const isActive = activeTool === tool;
  
  const handleClick = () => {
    // Update local state
    setActiveTool(tool);
    
    // Directly call editor method
    const editor = getEditor();
    if (editor) {
      const toolMap: Record<string, string> = {
        'select': 'select',
        'draw': 'draw',
        'sticky': 'geo',
        'eraser': 'erase',
      };
      
      editor.setCurrentTool(toolMap[tool] || 'select');
      
      // For sticky notes, set the style
      if (tool === 'sticky') {
        editor.setStyleForNextShapes({ fill: 'solid', color: '#ffff88' });
      }
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
        ${isActive 
          ? 'bg-jamboard-blue text-white shadow-lg scale-105' 
          : 'text-gray-600 hover:bg-white/80 hover:scale-105'
        }
      `}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
};

export const FloatingToolbar = () => {
  return (
    <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-2 p-3 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
        {/* Select Tool */}
        <ToolButton
          tool="select"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          }
          label="Select"
        />
        
        {/* Draw Tool */}
        <ToolButton
          tool="draw"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          }
          label="Draw"
        />
        
        {/* Sticky Note Tool */}
        <ToolButton
          tool="sticky"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          label="Sticky Note"
        />
        
        {/* Eraser Tool */}
        <ToolButton
          tool="eraser"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          label="Eraser"
        />
        
        {/* Divider */}
        <div className="h-px w-full bg-gray-300 my-1" />
        
        {/* Color Palette */}
        <div className="flex flex-col gap-1 mt-2">
          <div className="w-8 h-8 rounded-full bg-jamboard-blue cursor-pointer hover:scale-110 transition-transform ring-2 ring-offset-2 ring-jamboard-blue" />
          <div className="w-8 h-8 rounded-full bg-jamboard-red cursor-pointer hover:scale-110 transition-transform" />
          <div className="w-8 h-8 rounded-full bg-jamboard-green cursor-pointer hover:scale-110 transition-transform" />
          <div className="w-8 h-8 rounded-full bg-jamboard-yellow cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </div>
    </aside>
  );
};
