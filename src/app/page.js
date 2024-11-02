'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export default function Home() {
  /* TODO: Add state variables */
  // Keep track of the classification result and the model loading status.
const [result, setResult] = useState(null);
const [ready, setReady] = useState(null);
  // Create a reference to the worker object.
  const worker = useRef(null);

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted through use effect .
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          break;
        case 'ready':
          setReady(true);
          break;
        case 'complete':
          setResult(e.data.output[0])
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => worker.current.removeEventListener('message', onMessageReceived);
  });

  const classify = useCallback((text) => {
    if (worker.current) {
      worker.current.postMessage({ text });
    }
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 w-screen bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-12 shadow-lg relative overflow-hidden w-3/4 h-3/4">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-75 animate-pulse"></div>
        <div className="relative z-10 h-full flex flex-col justify-between">
          <h1 className="text-white text-5xl font-extrabold mb-8 text-center">Sentiment Analysis</h1>
          <input
            className="w-full h-16 rounded-md p-4 mb-8 text-lg outline-none focus:ring-4 focus:ring-blue-300"
            type="text"
            placeholder="Enter text here"
            onInput={e => {
              classify(e.target.value);
            }}
          />
          {ready !== null && (
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-white">
                {(!ready || !result) ? 'Loading...' : `Your sentence seems to be ${Math.floor((result?.score * 100))}% ${result?.label}`}
              </h2>
            </div>
          )}
        </div>
      </div>
    </main>

  )
}