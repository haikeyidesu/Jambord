import { useJamboardStore } from '../store/useJamboardStore';

export const FrameNavigator = () => {
  const currentSlideIndex = useJamboardStore((state) => state.currentSlideIndex);
  const slides = useJamboardStore((state) => state.slides);
  const setCurrentSlideIndex = useJamboardStore((state) => state.setCurrentSlideIndex);
  const addSlide = useJamboardStore((state) => state.addSlide);
  const removeSlide = useJamboardStore((state) => state.removeSlide);
  
  const slideCount = slides?.length || 0;
  
  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (currentSlideIndex < slideCount - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
      {/* Left: Navigation Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={currentSlideIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
          Slide {currentSlideIndex + 1} of {slideCount}
        </span>
        
        <button
          onClick={handleNext}
          disabled={currentSlideIndex >= slideCount - 1}
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
        <h1 className="text-lg font-semibold text-gray-800">Jamboard Clone</h1>
      </div>
      
      {/* Right: Add Slide Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={addSlide}
          className="flex items-center gap-1 px-3 py-2 bg-jamboard-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Slide
        </button>
        
        {slideCount > 1 && (
          <button
            onClick={() => removeSlide(currentSlideIndex)}
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
