# Debugging Guide: Speech Recognition Immediate Stop Issue

## Problem Description
The speech recognition recording stops immediately after starting, even when `continuous: true` is set.

## Potential Causes and Solutions

### 1. **Android Implementation Issue** ✅ FIXED
**Problem**: The `onResults` method was not properly handling continuous mode.

**Fix Applied**: 
- Modified `onResults` to only stop listening when `continuous: false`
- Added check in `onEndOfSpeech` to only stop if actually listening

**Files Modified**:
- `android/src/main/java/com/getcapacitor/community/speechrecognition/SpeechRecognition.java`

### 2. **iOS Implementation Issue** ✅ FIXED
**Problem**: The recognition task was stopping on final results even in continuous mode.

**Fix Applied**:
- Modified the recognition task to check `continuous` flag before stopping

**Files Modified**:
- `ios/Plugin/Plugin.swift`

### 3. **Testing the Fix**

#### Quick Test
```javascript
// Import the test function
import { testContinuousRecording } from './test-continuous-recording.js';

// Run the test
testContinuousRecording();
```

#### Manual Test
```javascript
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

// Set up listeners
await SpeechRecognition.addListener('listeningState', (data) => {
  console.log('Listening state:', data.status);
});

await SpeechRecognition.addListener('onError', (data) => {
  console.error('Error:', data.error);
});

// Test continuous recording
await SpeechRecognition.start({
  language: 'en-US',
  partialResults: true,
  continuous: true // This should prevent immediate stopping
});
```

### 4. **Common Issues to Check**

#### A. Permission Issues
```javascript
// Check permissions first
const { speechRecognition } = await SpeechRecognition.checkPermissions();
if (speechRecognition !== 'granted') {
  await SpeechRecognition.requestPermissions();
}
```

#### B. Availability Issues
```javascript
// Check if speech recognition is available
const { available } = await SpeechRecognition.available();
if (!available) {
  console.error('Speech recognition not available');
}
```

#### C. Platform-Specific Issues
- **Android**: Make sure `RECORD_AUDIO` permission is granted
- **iOS**: Make sure microphone and speech recognition permissions are granted

### 5. **Debugging Steps**

1. **Check Console Logs**
   - Look for error messages
   - Check if `listeningState` events are firing
   - Verify if `onError` events are firing

2. **Test Both Modes**
   ```javascript
   // Test normal mode
   await SpeechRecognition.start({ continuous: false });
   
   // Test continuous mode
   await SpeechRecognition.start({ continuous: true });
   ```

3. **Check Platform**
   - Test on both Android and iOS
   - Check if the issue is platform-specific

### 6. **Expected Behavior**

#### Normal Mode (`continuous: false`)
- Recording starts
- Recording stops automatically when speech ends
- `listeningState` changes to 'stopped'

#### Continuous Mode (`continuous: true`)
- Recording starts
- Recording continues even during silence
- Recording only stops when `stop()` is called manually
- `listeningState` stays 'started' until manual stop

### 7. **If Issue Persists**

1. **Check Version**
   - Make sure you're using the latest version with the fix
   - Rebuild the project: `npm run build`

2. **Clear Cache**
   ```bash
   # For Capacitor projects
   npx cap clean
   npx cap sync
   ```

3. **Test on Different Device**
   - Try on a different Android/iOS device
   - Check if it's device-specific

4. **Check Device Settings**
   - Ensure microphone is not muted
   - Check if any other app is using the microphone

### 8. **Reporting Issues**

If the issue persists after trying these steps, please provide:

1. **Platform**: Android/iOS version
2. **Device**: Device model
3. **Code**: The exact code you're using
4. **Console Logs**: Any error messages or logs
5. **Steps to Reproduce**: Detailed steps to reproduce the issue

### 9. **Workaround**

If the continuous mode is still not working, you can implement a workaround:

```javascript
// Manual continuous recording
let isRecording = false;

async function startContinuousRecording() {
  isRecording = true;
  
  while (isRecording) {
    try {
      await SpeechRecognition.start({
        language: 'en-US',
        partialResults: true,
        continuous: false // Use normal mode
      });
      
      // Wait for results or error
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 5000); // 5 second timeout
        
        SpeechRecognition.addListener('listeningState', (data) => {
          if (data.status === 'stopped') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });
      
    } catch (error) {
      console.error('Recording error:', error);
      break;
    }
  }
}

function stopContinuousRecording() {
  isRecording = false;
  SpeechRecognition.stop();
}
```

This workaround manually restarts recording when it stops, simulating continuous behavior. 