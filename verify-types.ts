// TypeScript verification script for continuous option
// This file should compile without errors if types are correct

import { SpeechRecognition, UtteranceOptions } from '@capacitor-community/speech-recognition';

// Test 1: Verify UtteranceOptions includes continuous
const options: UtteranceOptions = {
  language: 'en-US',
  partialResults: true,
  continuous: true, // This should be recognized
  maxResults: 5
};

// Test 2: Verify SpeechRecognition.start accepts continuous option
async function testStartMethod() {
  await SpeechRecognition.start({
    language: 'en-US',
    partialResults: true,
    continuous: false, // This should be recognized
    maxResults: 5
  });
}

// Test 3: Verify SpeechRecognitionOptions from types.ts
import { SpeechRecognitionOptions } from '@capacitor-community/speech-recognition';

const typedOptions: SpeechRecognitionOptions = {
  language: 'en-US',
  partialResults: true,
  continuous: true, // This should be recognized
  maxResults: 5
};

console.log('✅ All type checks passed! The continuous option is properly typed.');

export { options, typedOptions, testStartMethod }; 