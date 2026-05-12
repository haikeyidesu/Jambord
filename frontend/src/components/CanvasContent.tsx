import { Tldraw } from '@tldraw/tldraw';
import { useEffect, useState } from 'react';
import { useJamboardStore } from '../store/useJamboardStore';

interface CanvasContentProps {
  slideId: string;
}

export const CanvasContent: React.FC<CanvasContentProps> = ({ slideId }) => {
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const getSlideData = useJamboardStore((state) => state.getSlideData);
  const setSlideData = useJamboardStore((state) => state.setSlideData);
  
  // Handle tool changes from toolbar - sync to editor instance
  useEffect(() => {
    if (!editorInstance) return;
    
    const handleToolChange = (tool: string) => {
      // Map our tool names to tldraw tools
      const toolMap: Record<string, string> = {
        'select': 'select',
        'draw': 'draw',
        'sticky': 'geo',
        'eraser': 'erase',
      };
      
      const tldrawTool = toolMap[tool] || 'select';
      editorInstance.setCurrentTool(tldrawTool);
      
      // For sticky notes, set the style
      if (tool === 'sticky') {
        editorInstance.setStyleForNextShapes({ fill: 'solid', color: '#ffff88' });
      }
    };
    
    // Subscribe to tool changes from store
    const unsubscribe = useJamboardStore.subscribe(
      (state) => state.activeTool,
      (tool) => handleToolChange(tool)
    );
    
    // Set initial tool
    const initialTool = useJamboardStore.getState().activeTool;
    handleToolChange(initialTool);
    
    return () => unsubscribe();
  }, [editorInstance]);
  
  return (
    <div className="w-full h-full relative">
      <Tldraw
        persistenceKey={`slide:${slideId}`}
        onMount={(editor) => {
          // Store editor instance globally for other components to access
          (window as any).__jamboardEditor = editor;
          setEditorInstance(editor);
          
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
