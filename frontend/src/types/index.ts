import * as Y from 'yjs';

export type Slide = {
  id: string;
  name: string;
};

export type AppState = {
  currentSlideIndex: number;
  slides: Slide[];
};

export type ToolType = 'select' | 'draw' | 'sticky' | 'eraser';

export interface JamboardStore {
  // State
  doc: Y.Doc | null;
  provider: any | null;
  slides: Y.Array<any> | null;
  appState: Y.Map<any> | null;
  
  // UI State
  currentSlideIndex: number;
  activeTool: ToolType;
  
  // Actions
  initializeYjs: (roomId: string) => void;
  setCurrentSlideIndex: (index: number) => void;
  setActiveTool: (tool: ToolType) => void;
  addSlide: () => void;
  removeSlide: (index: number) => void;
  getSlideData: (slideId: string) => any;
  setSlideData: (slideId: string, data: any) => void;
}
