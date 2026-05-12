import { useEffect, useState } from 'react';
import { useJamboardStore } from '../store/useJamboardStore';

// Get the current editor instance from window (set by CanvasContent)
const getEditor = () => (window as any).__jamboardEditor;

export const FrameNavigator = () => {
  const [pageCount, setPageCount] = useState(1);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  const currentSlideIndex = useJamboardStore((state) => state.currentSlideIndex);
  const slides = useJamboardStore((state) => state.slides);
  const setCurrentSlideIndex = useJamboardStore((state) => state.setCurrentSlideIndex);
  const addSlide = useJamboardStore((state) => state.addSlide);
  const removeSlide = useJamboardStore((state) => state.removeSlide);
  
  // Sync with tldraw pages
  useEffect(() => {
    const editor = getEditor();
    if (!editor) return;
    
    const updatePageInfo = () => {
      const pages = editor.getPages();
      setPageCount(pages.length);
      
      const currentPage = editor.getCurrentPage();
      if (currentPage) {
        const pageIndex = pages.findIndex(p => p.id === currentPage.id);
        setCurrentPageIndex(pageIndex >= 0 ? pageIndex : 0);
      }
    };
    
    // Initial update
    updatePageInfo();
    
    // Subscribe to page changes
    const unsubscribe = editor.subscribe(updatePageInfo);
    
    return () => unsubscribe();
  }, []);
  
  const handlePrevious = () => {
    const editor = getEditor();
    if (editor && currentPageIndex > 0) {
      const pages = editor.getPages();
      const prevPage = pages[currentPageIndex - 1];
      if (prevPage) {
        editor.setCurrentPage(prevPage.id);
      }
    }
  };
  
  const handleNext = () => {
    const editor = getEditor();
    if (editor && currentPageIndex < pageCount - 1) {
      const pages = editor.getPages();
      const nextPage = pages[currentPageIndex + 1];
      if (nextPage) {
        editor.setCurrentPage(nextPage.id);
      }
    }
  };
  
  const handleAddSlide = () => {
    const editor = getEditor();
    if (editor) {
      const newPage = editor.createPage({ name: `Frame ${pageCount + 1}` });
      editor.setCurrentPage(newPage.id);
    } else {
      // Fallback to store-based slide creation
      addSlide();
    }
  };
  
  const handleRemoveSlide = () => {
    const editor = getEditor();
    if (editor && pageCount > 1) {
      const currentPage = editor.getCurrentPage();
      if (currentPage) {
        editor.deletePage(currentPage.id);
        
        // Navigate to previous or first page
        const pages = editor.getPages();
        if (pages.length > 0) {
          const newIndex = Math.max(0, currentPageIndex - 1);
          editor.setCurrentPage(pages[newIndex].id);
        }
      }
    } else {
      // Fallback to store-based slide removal
      removeSlide(currentSlideIndex);
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
      {/* Left: Navigation Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={currentPageIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
          Frame {currentPageIndex + 1} of {pageCount}
        </span>
        
        <button
          onClick={handleNext}
          disabled={currentPageIndex >= pageCount - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Center: Slide Title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-gray-800">Jambord</h1>
      </div>
      
      {/* Right: Add Slide Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAddSlide}
          className="flex items-center gap-1 px-3 py-2 bg-jamboard-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Frame
        </button>
        
        {pageCount > 1 && (
          <button
            onClick={handleRemoveSlide}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};
