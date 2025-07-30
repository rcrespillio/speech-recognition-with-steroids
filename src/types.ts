/**
 * Additional TypeScript types for the Speech Recognition plugin
 * These types provide better developer experience in React/TypeScript projects
 */

export interface SpeechRecognitionError {
  error: string;
  errorCode?: number;
}

export interface SpeechRecognitionPartialResults {
  matches: string[];
}

export interface SpeechRecognitionListeningState {
  status: 'started' | 'stopped';
}

export interface SpeechRecognitionAvailability {
  available: boolean;
}

export interface SpeechRecognitionResults {
  matches?: string[];
}

export interface SpeechRecognitionLanguages {
  languages: any[];
}

export interface SpeechRecognitionListeningStatus {
  listening: boolean;
}

export interface SpeechRecognitionPermissions {
  speechRecognition: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';
}

// Event listener function types
export type PartialResultsListener = (data: SpeechRecognitionPartialResults) => void;
export type ListeningStateListener = (data: SpeechRecognitionListeningState) => void;
export type ErrorListener = (data: SpeechRecognitionError) => void;

// Event names
export type SpeechRecognitionEventName = 'partialResults' | 'listeningState' | 'onError';

// Listener function union type
export type SpeechRecognitionListener = 
  | PartialResultsListener 
  | ListeningStateListener 
  | ErrorListener;

// Configuration options
export interface SpeechRecognitionOptions {
  language?: string;
  maxResults?: number;
  prompt?: string;
  popup?: boolean;
  partialResults?: boolean;
  continuous?: boolean;
  silenceTimeout?: number;
} 