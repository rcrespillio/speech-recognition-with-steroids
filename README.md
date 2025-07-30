# Speech Recognition

A native plugin for speech recognition.

## Install

```bash
npm install @capacitor-community/speech-recognition
npx cap sync
```

## API

<docgen-index>

* [`available()`](#available)
* [`start(...)`](#start)
* [`stop()`](#stop)
* [`getSupportedLanguages()`](#getsupportedlanguages)
* [`isListening()`](#islistening)
* [`checkPermissions()`](#checkpermissions)
* [`requestPermissions()`](#requestpermissions)
* [`addListener('partialResults', ...)`](#addlistenerpartialresults-)
* [`addListener('listeningState', ...)`](#addlistenerlisteningstate-)
* [`addListener('onError', ...)`](#addlisteneronerror-)
* [`removeAllListeners()`](#removealllisteners)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### available()

```typescript
available() => Promise<{ available: boolean; }>
```

This method will check if speech recognition feature is available on the device.

**Returns:** <code>Promise&lt;{ available: boolean; }&gt;</code>

--------------------


### start(...)

```typescript
start(options?: UtteranceOptions | undefined) => Promise<{ matches?: string[]; }>
```

This method will start to listen for utterance.

if `partialResults` is `true`, the function respond directly without result and
event `partialResults` will be emit for each partial result, until stopped.

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#utteranceoptions">UtteranceOptions</a></code> |

**Returns:** <code>Promise&lt;{ matches?: string[]; }&gt;</code>

--------------------


### stop()

```typescript
stop() => Promise<void>
```

This method will stop listening for utterance

--------------------


### getSupportedLanguages()

```typescript
getSupportedLanguages() => Promise<{ languages: any[]; }>
```

This method will return list of languages supported by the speech recognizer.

It's not available on Android 13 and newer.

**Returns:** <code>Promise&lt;{ languages: any[]; }&gt;</code>

--------------------


### isListening()

```typescript
isListening() => Promise<{ listening: boolean; }>
```

This method will check if speech recognition is listening.

**Returns:** <code>Promise&lt;{ listening: boolean; }&gt;</code>

**Since:** 5.1.0

--------------------


### checkPermissions()

```typescript
checkPermissions() => Promise<PermissionStatus>
```

Check the speech recognition permission.

**Returns:** <code>Promise&lt;<a href="#permissionstatus">PermissionStatus</a>&gt;</code>

**Since:** 5.0.0

--------------------


### requestPermissions()

```typescript
requestPermissions() => Promise<PermissionStatus>
```

Request the speech recognition permission.

**Returns:** <code>Promise&lt;<a href="#permissionstatus">PermissionStatus</a>&gt;</code>

**Since:** 5.0.0

--------------------


### addListener('partialResults', ...)

```typescript
addListener(eventName: 'partialResults', listenerFunc: (data: { matches: string[]; }) => void) => Promise<PluginListenerHandle>
```

Called when partialResults set to true and result received.

On Android it doesn't work if popup is true.

Provides partial result.

| Param              | Type                                                   |
| ------------------ | ------------------------------------------------------ |
| **`eventName`**    | <code>'partialResults'</code>                          |
| **`listenerFunc`** | <code>(data: { matches: string[]; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 2.0.2

--------------------


### addListener('listeningState', ...)

```typescript
addListener(eventName: 'listeningState', listenerFunc: (data: { status: 'started' | 'stopped'; }) => void) => Promise<PluginListenerHandle>
```

Called when listening state changed.

| Param              | Type                                                                |
| ------------------ | ------------------------------------------------------------------- |
| **`eventName`**    | <code>'listeningState'</code>                                       |
| **`listenerFunc`** | <code>(data: { status: 'started' \| 'stopped'; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.1.0

--------------------


### addListener('onError', ...)

```typescript
addListener(eventName: 'onError', listenerFunc: (data: { error: string; errorCode?: number; }) => void) => Promise<PluginListenerHandle>
```

Called when an error occurs during speech recognition.

This event is fired when recording stops due to an error.
The recording state will also be set to 'stopped' via the listeningState event.

| Param              | Type                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| **`eventName`**    | <code>'onError'</code>                                                 |
| **`listenerFunc`** | <code>(data: { error: string; errorCode?: number; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.2.0

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

Remove all the listeners that are attached to this plugin.

**Since:** 4.0.0

--------------------


### Interfaces


#### UtteranceOptions

| Prop                 | Type                 | Description                                                                                                                                                                                                                                                                                                                                               | Since |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`language`**       | <code>string</code>  | key returned from `getSupportedLanguages()`                                                                                                                                                                                                                                                                                                               |       |
| **`maxResults`**     | <code>number</code>  | maximum number of results to return (5 is max)                                                                                                                                                                                                                                                                                                            |       |
| **`prompt`**         | <code>string</code>  | prompt message to display on popup (Android only)                                                                                                                                                                                                                                                                                                         |       |
| **`popup`**          | <code>boolean</code> | display popup window when listening for utterance (Android only)                                                                                                                                                                                                                                                                                          |       |
| **`partialResults`** | <code>boolean</code> | return partial results if found                                                                                                                                                                                                                                                                                                                           |       |
| **`continuous`**     | <code>boolean</code> | keep recording continuously without stopping on silence When true, the recording will continue even when there are pauses in speech. The recording will only stop when explicitly called via the stop() method.                                                                                                                                           | 5.3.0 |
| **`silenceTimeout`** | <code>number</code>  | silence timeout in milliseconds before stopping recording When set, the recording will stop after this many milliseconds of silence. This overrides the default system timeout and works even when continuous is true. Examples: - 1000: Stop after 1 second of silence - 5000: Stop after 5 seconds of silence - 10000: Stop after 10 seconds of silence | 5.4.0 |


#### PermissionStatus

| Prop                    | Type                                                        | Description                                                                                                                                                                      | Since |
| ----------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`speechRecognition`** | <code><a href="#permissionstate">PermissionState</a></code> | Permission state for speechRecognition alias. On Android it requests/checks RECORD_AUDIO permission On iOS it requests/checks the speech recognition and microphone permissions. | 5.0.0 |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### PermissionState

<code>'prompt' | 'prompt-with-rationale' | 'granted' | 'denied'</code>

</docgen-api>

## Continuous Recording

The plugin supports continuous recording mode, which allows the recording to continue even when there are pauses in speech. This is useful for:

- Long-form dictation
- Continuous conversation recording
- Applications that need to capture speech over extended periods

### Usage

Set the `continuous` option to `true` when starting speech recognition:

```typescript
await SpeechRecognition.start({
  language: 'en-US',
  partialResults: true,
  continuous: true // Keep recording on silence
});
```

### How It Works

- **Normal Mode** (`continuous: false`): Recording stops automatically when speech ends or there's silence
- **Continuous Mode** (`continuous: true`): Recording continues until explicitly stopped via `stop()` method
- **Silence Timeout**: When set, recording stops after the specified milliseconds of silence

### Silence Timeout

The `silenceTimeout` option allows you to set a custom timeout for silence detection:

```typescript
// Stop after 1 second of silence
await SpeechRecognition.start({
  language: 'en-US',
  partialResults: true,
  silenceTimeout: 1000
});

// Stop after 5 seconds of silence
await SpeechRecognition.start({
  language: 'en-US',
  partialResults: true,
  silenceTimeout: 5000
});

// Continuous recording with 10-second silence timeout
await SpeechRecognition.start({
  language: 'en-US',
  partialResults: true,
  continuous: true,
  silenceTimeout: 10000
});
```

**Important**: The silence timeout only starts counting **after speech has been detected**. This means:
- Initial silence at the beginning of recording won't trigger the timeout
- The timeout only applies after the user has started speaking
- This prevents premature stopping when users are preparing to speak

### Best Practices

- Use continuous mode for long-form content or when you want to capture multiple speech segments
- Use silence timeout for more precise control over when recording stops
- Combine continuous mode with silence timeout for flexible recording behavior
- Always provide a way for users to manually stop recording
- Consider battery usage when using continuous mode for extended periods

## Error Handling

The plugin now provides comprehensive error handling through the `onError` listener. When an error occurs during speech recognition, the plugin will:

1. Stop the recording automatically
2. Fire the `onError` event with error details
3. Fire the `listeningState` event with status 'stopped'

### React/TypeScript Example

Here's a complete example showing how to handle errors in a React application:

```typescript
import React, { useEffect, useState } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

interface ErrorData {
  error: string;
  errorCode?: number;
}

const SpeechRecognitionComponent: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    // Set up listeners
    const setupListeners = async () => {
      // Listen for partial results
      await SpeechRecognition.addListener('partialResults', (data) => {
        setResults(data.matches);
      });

      // Listen for listening state changes
      await SpeechRecognition.addListener('listeningState', (data) => {
        setIsListening(data.status === 'started');
        if (data.status === 'stopped') {
          setError(null); // Clear any previous errors
        }
      });

      // Listen for errors
      await SpeechRecognition.addListener('onError', (data: ErrorData) => {
        setError(data.error);
        setIsListening(false);
        console.error('Speech recognition error:', data.error, 'Code:', data.errorCode);
      });
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      SpeechRecognition.removeAllListeners();
    };
  }, []);

  const startListening = async () => {
    try {
      setError(null);
      await SpeechRecognition.start({
        language: 'en-US',
        partialResults: true,
        maxResults: 5,
        continuous: false, // Set to true to keep recording on silence
        silenceTimeout: 5000 // Stop after 5 seconds of silence
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const stopListening = async () => {
    try {
      await SpeechRecognition.stop();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div>
      <h2>Speech Recognition</h2>
      
      <div>
        <button 
          onClick={startListening} 
          disabled={isListening}
        >
          Start Listening
        </button>
        
        <button 
          onClick={stopListening} 
          disabled={!isListening}
        >
          Stop Listening
        </button>
      </div>

      {isListening && (
        <div style={{ color: 'green' }}>
          Listening...
        </div>
      )}

      {error && (
        <div style={{ color: 'red' }}>
          Error: {error}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h3>Results:</h3>
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognitionComponent;
```

### Common Error Codes (Android)

- `ERROR_AUDIO`: Audio recording error
- `ERROR_CLIENT`: Client side error
- `ERROR_INSUFFICIENT_PERMISSIONS`: Insufficient permissions
- `ERROR_NETWORK`: Network error
- `ERROR_NETWORK_TIMEOUT`: Network timeout
- `ERROR_NO_MATCH`: No match found
- `ERROR_RECOGNIZER_BUSY`: RecognitionService busy
- `ERROR_SERVER`: Server error
- `ERROR_SPEECH_TIMEOUT`: No speech input

### Common Error Codes (iOS)

iOS errors are typically more descriptive and include localized error messages. The `errorCode` will contain the underlying system error code.

## Permissions

### Android

Add the following permission to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### iOS

Add the following keys to your `ios/App/App/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone to record speech.</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>This app needs access to speech recognition to convert speech to text.</string>
```

## License

MIT
