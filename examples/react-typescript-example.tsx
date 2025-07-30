import React, { useEffect, useState, useCallback } from 'react';
import { 
  SpeechRecognition, 
  SpeechRecognitionError,
  SpeechRecognitionPartialResults,
  SpeechRecognitionListeningState,
  SpeechRecognitionOptions
} from '@capacitor-community/speech-recognition';

/**
 * React TypeScript example demonstrating error handling with the Speech Recognition plugin
 */
const SpeechRecognitionExample: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [continuousMode, setContinuousMode] = useState(false);
  const [silenceTimeout, setSilenceTimeout] = useState<number | undefined>(undefined);

  // Check availability on component mount
  useEffect(() => {
    checkAvailability();
  }, []);

  // Set up listeners
  useEffect(() => {
    setupListeners();
    
    // Cleanup listeners on unmount
    return () => {
      cleanupListeners();
    };
  }, []);

  const checkAvailability = async (): Promise<void> => {
    try {
      const { available } = await SpeechRecognition.available();
      setIsAvailable(available);
      
      if (!available) {
        setError('Speech recognition is not available on this device');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability');
    }
  };

  const setupListeners = async (): Promise<void> => {
    try {
      // Listen for partial results
      await SpeechRecognition.addListener('partialResults', (data: SpeechRecognitionPartialResults) => {
        setResults(data.matches);
        console.log('Partial results received:', data.matches);
      });

      // Listen for listening state changes
      await SpeechRecognition.addListener('listeningState', (data: SpeechRecognitionListeningState) => {
        setIsListening(data.status === 'started');
        console.log('Listening state changed:', data.status);
        
        if (data.status === 'stopped') {
          setError(null); // Clear any previous errors
        }
      });

      // Listen for errors
      await SpeechRecognition.addListener('onError', (data: SpeechRecognitionError) => {
        setError(data.error);
        setIsListening(false);
        console.error('Speech recognition error:', data.error, 'Code:', data.errorCode);
        
        // Handle specific error codes
        handleSpecificError(data.errorCode);
      });
    } catch (err) {
      console.error('Failed to setup listeners:', err);
    }
  };

  const cleanupListeners = async (): Promise<void> => {
    try {
      await SpeechRecognition.removeAllListeners();
    } catch (err) {
      console.error('Failed to cleanup listeners:', err);
    }
  };

  const handleSpecificError = (errorCode?: number): void => {
    if (!errorCode) return;

    switch (errorCode) {
      case 1: // ERROR_AUDIO
        console.warn('Audio recording error - check microphone permissions');
        break;
      case 2: // ERROR_CLIENT
        console.warn('Client side error - try restarting the app');
        break;
      case 3: // ERROR_INSUFFICIENT_PERMISSIONS
        console.warn('Insufficient permissions - request microphone access');
        break;
      case 4: // ERROR_NETWORK
        console.warn('Network error - check internet connection');
        break;
      case 5: // ERROR_NETWORK_TIMEOUT
        console.warn('Network timeout - try again');
        break;
      case 6: // ERROR_NO_MATCH
        console.warn('No speech detected - try speaking more clearly');
        break;
      case 7: // ERROR_RECOGNIZER_BUSY
        console.warn('Recognition service busy - try again later');
        break;
      case 8: // ERROR_SERVER
        console.warn('Server error - try again later');
        break;
      case 9: // ERROR_SPEECH_TIMEOUT
        console.warn('No speech input - try speaking');
        break;
      default:
        console.warn('Unknown error occurred');
    }
  };

  const requestPermissions = async (): Promise<void> => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      
      if (speechRecognition === 'granted') {
        setError(null);
        console.log('Permissions granted');
      } else {
        setError('Microphone permission denied');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permissions');
    }
  };

  const startListening = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setResults([]);
      
      const options: SpeechRecognitionOptions = {
        language: 'en-US',
        partialResults: true,
        maxResults: 5,
        continuous: continuousMode, // Use the state value
        silenceTimeout: silenceTimeout, // Use the state value
        prompt: 'Say something...'
      };
      
      await SpeechRecognition.start(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start listening');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async (): Promise<void> => {
    try {
      await SpeechRecognition.stop();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop listening');
    }
  }, []);

  const checkListeningStatus = async (): Promise<void> => {
    try {
      const { listening } = await SpeechRecognition.isListening();
      setIsListening(listening);
    } catch (err) {
      console.error('Failed to check listening status:', err);
    }
  };

  // Don't render if speech recognition is not available
  if (isAvailable === false) {
    return (
      <div className="speech-recognition-container">
        <h2>Speech Recognition</h2>
        <div className="error-message">
          Speech recognition is not available on this device.
        </div>
      </div>
    );
  }

  return (
    <div className="speech-recognition-container">
      <h2>Speech Recognition with Error Handling</h2>
      
      <div className="controls">
        <button 
          onClick={requestPermissions}
          className="permission-button"
        >
          Request Permissions
        </button>
        
        <button 
          onClick={startListening} 
          disabled={isListening}
          className="start-button"
        >
          Start Listening
        </button>
        
        <button 
          onClick={stopListening} 
          disabled={!isListening}
          className="stop-button"
        >
          Stop Listening
        </button>
        
        <button 
          onClick={checkListeningStatus}
          className="status-button"
        >
          Check Status
        </button>
      </div>

      <div className="options">
        <label className="continuous-toggle">
          <input
            type="checkbox"
            checked={continuousMode}
            onChange={(e) => setContinuousMode(e.target.checked)}
            disabled={isListening}
          />
          Continuous Recording Mode
          <span className="tooltip">
            When enabled, recording continues even during silence
          </span>
        </label>
        
        <div className="silence-timeout">
          <label>
            Silence Timeout (ms):
            <input
              type="number"
              min="0"
              step="1000"
              value={silenceTimeout || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSilenceTimeout(value ? parseInt(value) : undefined);
              }}
              disabled={isListening}
              placeholder="e.g., 5000"
            />
          </label>
          <span className="tooltip">
            Stop recording after this many milliseconds of silence (0 = no timeout)
          </span>
        </div>
      </div>

      <div className="status">
        {isListening && (
          <div className="listening-indicator">
            🎤 Listening...
          </div>
        )}
        
        {error && (
          <div className="error-message">
            ❌ Error: {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="results">
          <h3>Results:</h3>
          <ul>
            {results.map((result, index) => (
              <li key={index} className="result-item">
                {result}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="info">
        <h3>Error Handling Features:</h3>
        <ul>
          <li>✅ Automatic error detection and notification</li>
          <li>✅ Specific error code handling</li>
          <li>✅ Automatic recording stop on error</li>
          <li>✅ TypeScript type safety</li>
          <li>✅ React state management</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechRecognitionExample; 