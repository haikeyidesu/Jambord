import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { JamboardStore, ToolType } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export const useJamboardStore = create<JamboardStore>((set, get) => ({
  // Initial State
  doc: null,
  provider: null,
  slides: null,
  appState: null,
  
  // UI State
  currentSlideIndex: 0,
  activeTool: 'select',
  
  // Initialize Yjs with WebSocket provider
  initializeYjs: (roomId: string) => {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider(`${WS_URL}?room=${roomId}`, roomId, doc);
    
    // Get or create shared types
    const slides = doc.getArray('slides');
    const appState = doc.getMap('appState');
    
    // Initialize slides if empty
    if (slides.length === 0) {
      const firstSlideId = uuidv4();
      slides.push([{ id: firstSlideId, name: 'Slide 1' }]);
      appState.set('currentSlideIndex', 0);
    }
    
    // Subscribe to appState changes (Observer Pattern)
    appState.observe((event) => {
      event.changes.keys.forEach((change, key) => {
        if (key === 'currentSlideIndex') {
          const newIndex = appState.get('currentSlideIndex');
          set({ currentSlideIndex: newIndex });
        }
      });
    });
    
    set({ 
      doc, 
      provider, 
      slides, 
      appState,
      currentSlideIndex: appState.get('currentSlideIndex') || 0
    });
    
    return () => {
      provider.destroy();
      doc.destroy();
    };
  },
  
  // Update current slide index in Yjs (triggers sync to all clients)
  setCurrentSlideIndex: (index: number) => {
    const { appState } = get();
    if (appState) {
      appState.set('currentSlideIndex', index);
      set({ currentSlideIndex: index });
    }
  },
  
  // Set active tool (local state only)
  setActiveTool: (tool: ToolType) => {
    set({ activeTool: tool });
  },
  
  // Add new slide
  addSlide: () => {
    const { slides, currentSlideIndex } = get();
    if (slides) {
      const newSlideId = uuidv4();
      const newSlide = { id: newSlideId, name: `Slide ${slides.length + 1}` };
      slides.insert(currentSlideIndex + 1, [newSlide]);
      
      // Update current index to new slide
      const { appState } = get();
      if (appState) {
        appState.set('currentSlideIndex', currentSlideIndex + 1);
      }
    }
  },
  
  // Remove slide
  removeSlide: (index: number) => {
    const { slides, currentSlideIndex } = get();
    if (slides && slides.length > 1) {
      slides.delete(index);
      
      // Adjust current index if needed
      const { appState } = get();
      if (appState) {
        if (index < currentSlideIndex) {
          appState.set('currentSlideIndex', currentSlideIndex - 1);
        } else if (index === currentSlideIndex) {
          appState.set('currentSlideIndex', Math.max(0, currentSlideIndex - 1));
        }
      }
    }
  },
  
  // Get slide data from Y.Map
  getSlideData: (slideId: string) => {
    const { doc } = get();
    if (doc) {
      const slideMap = doc.getMap(`slide:${slideId}`);
      return slideMap.toJSON();
    }
    return {};
  },
  
  // Set slide data in Y.Map
  setSlideData: (slideId: string, data: any) => {
    const { doc } = get();
    if (doc) {
      const slideMap = doc.getMap(`slide:${slideId}`);
      Object.entries(data).forEach(([key, value]) => {
        slideMap.set(key, value);
      });
    }
  },
}));
