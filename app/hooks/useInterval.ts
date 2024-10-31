import { useEffect, useRef } from 'react';
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useInterval(callback: any, delay:number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedCallback = useRef<any | null>( null );
 
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
 
  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}