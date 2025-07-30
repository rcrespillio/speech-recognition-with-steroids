# Speech Recognition Plugin Examples

This directory contains examples demonstrating how to use the Speech Recognition plugin with proper error handling.

## React TypeScript Example

The `react-typescript-example.tsx` file shows a complete React component that demonstrates:

- ✅ Proper TypeScript type safety
- ✅ Error handling with the new `onError` listener
- ✅ State management for listening status
- ✅ Permission handling
- ✅ Specific error code handling
- ✅ Clean component lifecycle management

### Features Demonstrated

1. **Error Handling**: Uses the new `onError` listener to catch and display errors
2. **Continuous Recording**: Toggle for continuous recording mode that prevents stopping on silence
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **State Management**: React hooks for managing listening state and errors
5. **Permission Management**: Proper permission request and handling
6. **Error Recovery**: Automatic cleanup and error state management

### Usage

1. Import the component:
```typescript
import SpeechRecognitionExample from './examples/react-typescript-example';
```

2. Use it in your app:
```typescript
function App() {
  return (
    <div>
      <SpeechRecognitionExample />
    </div>
  );
}
```

3. Import the styles:
```typescript
import './examples/styles.css';
```

### Error Handling Flow

When an error occurs during speech recognition:

1. **Automatic Detection**: The plugin automatically detects the error
2. **Listener Notification**: The `onError` listener is fired with error details
3. **State Update**: The component updates its error state
4. **Recording Stop**: The recording automatically stops
5. **User Feedback**: The error is displayed to the user
6. **Recovery**: The component is ready for the next recording attempt

### Error Codes

The example includes handling for common Android error codes:

- `1`: Audio recording error
- `2`: Client side error  
- `3`: Insufficient permissions
- `4`: Network error
- `5`: Network timeout
- `6`: No match found
- `7`: Recognition service busy
- `8`: Server error
- `9`: No speech input

### Best Practices

1. **Always check availability** before starting speech recognition
2. **Request permissions** before attempting to record
3. **Set up listeners** in `useEffect` and clean them up on unmount
4. **Handle errors gracefully** with user-friendly messages
5. **Use TypeScript** for better type safety and developer experience
6. **Test error scenarios** to ensure robust error handling

## Files

- `react-typescript-example.tsx` - Complete React TypeScript example
- `styles.css` - Styling for the example component
- `README.md` - This documentation file 