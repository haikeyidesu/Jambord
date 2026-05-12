import { Tldraw, useEditor } from '@tldraw/tldraw';
import { useEffect } from 'react';
import { useJamboardStore } from '../store/useJamboardStore';

// Custom shape for sticky notes with square aspect ratio and yellow background
const StickyNoteShape = {
  type: 'sticky' as const,
  props: {
    w: 200,
    h: 200,
    color: '#ffff88',
    text: '',
  },
};

interface CanvasContentProps {
  slideId: string;
}

export const CanvasContent: React.FC<CanvasContentProps> = ({ slideId }) => {
  const activeTool = useJamboardStore((state) => state.activeTool);
  const getSlideData = useJamboardStore((state) => state.getSlideData);
  const setSlideData = useJamboardStore((state) => state.setSlideData);
  
  return (
    <div className="w-full h-full">
      <Tldraw
        persistenceKey={`slide:${slideId}`}
        onMount={(editor) => {
          // Set up custom tools and shapes
          editor.updateInstanceState({ toolId: `geo:${activeTool}` });
          
          // Load existing slide data
          const slideData = getSlideData(slideId);
          if (slideData && Object.keys(slideData).length > 0) {
            // Restore slide content from Yjs
            // This would involve converting Yjs data to tldraw format
          }
          
          // Listen for changes and sync to Yjs
          const handleChange = () => {
            const snapshot = editor.store.getSnapshot();
            setSlideData(slideId, snapshot);
          };
          
          editor.on('change', handleChange);
          
          return () => {
            editor.off('change', handleChange);
          };
        }}
        hideUi={false}
        className="w-full h-full"
      />
    </div>
  );
};

// Internal component to react to tool changes
const ToolSync: React.FC = () => {
  const editor = useEditor();
  const activeTool = useJamboardStore((state) => state.activeTool);
  
  useEffect(() => {
    if (activeTool === 'sticky') {
      // Switch to rectangle/shape tool for sticky notes
      editor.setCurrentTool('geo');
      editor.setStyleForNextShapes({ fill: 'solid', color: 'yellow' });
    } else if (activeTool === 'draw') {
      editor.setCurrentTool('draw');
    } else if (activeTool === 'select') {
      editor.setCurrentTool('select');
    } else if (activeTool === 'eraser') {
      editor.setCurrentTool('erase');
    }
  }, [activeTool, editor]);
  
  return null;
};
