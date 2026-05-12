import { useEffect } from 'react';
import { useJamboardStore } from '../store/useJamboardStore';

export const useYjsSync = (roomId: string) => {
  const initializeYjs = useJamboardStore((state) => state.initializeYjs);
  const doc = useJamboardStore((state) => state.doc);
  
  useEffect(() => {
    if (!doc) {
      const cleanup = initializeYjs(roomId);
      return cleanup;
    }
  }, [roomId, initializeYjs, doc]);
  
  return { doc };
};
