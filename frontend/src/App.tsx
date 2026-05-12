import { useEffect } from 'react';
import { FrameNavigator } from './components/FrameNavigator';
import { FloatingToolbar } from './components/FloatingToolbar';
import { CanvasContent } from './components/CanvasContent';
import { useYjsSync } from './hooks/useYjsSync';
import { useJamboardStore } from './store/useJamboardStore';

// Default room ID for demo purposes
const DEFAULT_ROOM_ID = 'jamboard-room-1';

function App() {
  // Initialize Yjs sync
  const { doc } = useYjsSync(DEFAULT_ROOM_ID);
  
  // Get current slide info
  const currentSlideIndex = useJamboardStore((state) => state.currentSlideIndex);
  const slides = useJamboardStore((state) => state.slides);
  
  // Get current slide ID
  const currentSlideId = slides?.get(currentSlideIndex)?.id || null;
  
  // Show loading state while Yjs initializes
  if (!doc || !currentSlideId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jamboard-blue mx-auto mb-4" />
          <p className="text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full relative">
      {/* Top Header with Frame Navigator */}
      <FrameNavigator />
      
      {/* Left Floating Toolbar with glassmorphism */}
      <FloatingToolbar />
      
      {/* Main Canvas Area */}
      <main className="pt-[60px] w-full h-full">
        <CanvasContent slideId={currentSlideId} />
      </main>
    </div>
  );
}

export default App;
