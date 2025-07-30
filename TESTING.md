# Testing Guide for Speech Recognition Plugin

This document outlines the various testing approaches available for the speech recognition plugin, particularly focusing on the continuous mode functionality.

## 🧪 Testing Approaches

### 1. **Integration Tests (Recommended)**

Run automated integration tests that simulate the plugin's behavior:

```bash
# Run integration tests
npm run test:integration

# Or run all tests
npm run test:all
```

**What it tests:**
- ✅ Continuous mode with "No match" errors
- ✅ Non-continuous mode behavior
- ✅ Error handling for different error types
- ✅ Event suppression during internal restarts
- ✅ Intentional stop behavior

**Output example:**
```
🧪 Running Speech Recognition Continuous Mode Tests

📋 Test 1: Continuous mode with "No match" error
✅ Started listening (continuous: true)
🔴 Error: No match (code: ERROR_NO_MATCH)
🔄 Continuous mode: restarting internally...
✅ Test 1 PASSED

🎉 ALL TESTS PASSED!
```

### 2. **Manual Tests**

Run interactive manual tests with step-by-step instructions:

```bash
npm run test:manual
```

**What it provides:**
- 📋 Step-by-step testing instructions
- 🎯 Specific scenarios to test
- 📊 Test result tracking
- 📝 Sample code for your app

### 3. **Unit Tests (Android)**

Run JUnit tests for Android-specific functionality:

```bash
cd android && ./gradlew test
```

**Test coverage:**
- Speech recognition listener behavior
- Error handling logic
- Event suppression mechanisms
- State management

### 4. **Build Verification**

Verify the plugin builds correctly:

```bash
# Full verification (iOS, Android, Web)
npm run verify

# Android only
npm run verify:android

# iOS only
npm run verify:ios
```

## 🎯 Test Scenarios

### **Scenario 1: Continuous Mode - "No Match" Error**

**Expected Behavior:**
1. Start continuous mode
2. "No match" error occurs
3. Error event is sent to user
4. Speech recognizer restarts internally
5. No duplicate "started" events
6. Listening continues

**Test Command:**
```bash
npm run test:integration
```

### **Scenario 2: Non-Continuous Mode - "No Match" Error**

**Expected Behavior:**
1. Start non-continuous mode
2. "No match" error occurs
3. Error event is sent to user
4. "Stopped" event is sent
5. Listening stops

### **Scenario 3: Network Error (Both Modes)**

**Expected Behavior:**
1. Any mode with network error
2. Error event is sent to user
3. "Stopped" event is sent
4. Listening stops (network errors are fatal)

### **Scenario 4: Intentional Stop**

**Expected Behavior:**
1. Start any mode
2. Call `stop()` method
3. "Stopped" event is sent
4. No error events triggered
5. Clean shutdown

## 🔧 Testing in Your App

### **Sample Test Code**

```typescript
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

async function testContinuousMode() {
    try {
        // Start continuous mode
        await SpeechRecognition.start({
            continuous: true,
            partialResults: true
        });
        
        console.log('✅ Continuous mode started');
        
        // Add listeners
        SpeechRecognition.addListener('listeningState', (state) => {
            console.log('📡 Listening state:', state.status);
        });
        
        SpeechRecognition.addListener('onError', (error) => {
            console.log('🔴 Error:', error.error, '(code:', error.errorCode, ')');
        });
        
        SpeechRecognition.addListener('partialResults', (results) => {
            console.log('🎤 Partial results:', results.matches);
        });
        
        // Stop after 30 seconds
        setTimeout(async () => {
            await SpeechRecognition.stop();
            console.log('✅ Test completed');
        }, 30000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testContinuousMode();
```

### **Manual Testing Checklist**

- [ ] **Basic Functionality**
  - [ ] Plugin starts without errors
  - [ ] Microphone permission is requested
  - [ ] Speech is recognized correctly

- [ ] **Continuous Mode**
  - [ ] `continuous: true` keeps listening after errors
  - [ ] "No match" errors don't stop listening
  - [ ] Only one "started" event is sent
  - [ ] Error events are still received for debugging

- [ ] **Non-Continuous Mode**
  - [ ] `continuous: false` stops on errors
  - [ ] "Stopped" event is sent after errors
  - [ ] Normal behavior is maintained

- [ ] **Error Handling**
  - [ ] Network errors stop listening (both modes)
  - [ ] Permission errors are handled gracefully
  - [ ] Intentional stops don't trigger error events

- [ ] **Event Suppression**
  - [ ] No duplicate "started" events during restarts
  - [ ] Error events are still sent for debugging
  - [ ] Clean event sequence

## 🐛 Debugging Tips

### **Enable Debug Logging**

Add debug logging to see internal behavior:

```typescript
// In your app
SpeechRecognition.addListener('onError', (error) => {
    console.log('🔴 Error event:', error);
});

SpeechRecognition.addListener('listeningState', (state) => {
    console.log('📡 State change:', state);
});
```

### **Common Issues**

1. **"No match" errors stopping listening in continuous mode**
   - Check that `continuous: true` is set
   - Verify restart logic is working

2. **Duplicate "started" events**
   - Check that `isRestarting` flag is working
   - Verify event suppression logic

3. **Mic not staying active**
   - Check that speech recognizer is being recreated
   - Verify restart timing

### **Log Analysis**

Look for these log patterns:

```
✅ Normal start: "listeningState:started"
🔴 Error: "onError:ERROR_NO_MATCH"
🔄 Restart: "Continuous mode: restarting internally..."
✅ Restart complete: "Speech recognizer restarted internally"
```

## 📊 Test Results

### **Expected Test Output**

```
🧪 Running Speech Recognition Continuous Mode Tests

📋 Test 1: Continuous mode with "No match" error
✅ Test 1 PASSED

📋 Test 2: Non-continuous mode with "No match" error
✅ Test 2 PASSED

📋 Test 3: Continuous mode with network error (should stop)
✅ Test 3 PASSED

📋 Test 4: Intentional stop should not trigger error events
✅ Test 4 PASSED

🎉 ALL TESTS PASSED!
```

### **Interpreting Results**

- **✅ PASS**: Expected behavior confirmed
- **❌ FAIL**: Implementation issue detected
- **⚠️ WARNING**: Potential edge case identified

## 🚀 Continuous Integration

Add these tests to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Test Speech Recognition Plugin

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - run: npm install
      - run: npm run build
      - run: npm run test:integration
      - run: npm run verify:android
```

## 📝 Contributing

When adding new features:

1. **Add integration tests** in `test-continuous-mode.js`
2. **Update manual test instructions** in `test-manual.js`
3. **Add unit tests** for Android functionality
4. **Update this documentation**

### **Test Naming Convention**

- `test[Feature]_[Scenario]_[ExpectedResult]`
- Example: `testContinuousMode_NoMatchError_ShouldRestartInternally`

---

**Need help?** Check the [issues](https://github.com/capacitor-community/speech-recognition/issues) or create a new one with test results. 