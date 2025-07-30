# TypeScript Troubleshooting: Continuous Option Not Found

## Issue
The `continuous` option is not showing up in TypeScript intellisense for `SpeechRecognition.start()`.

## Verification

### 1. **Check Generated Types**
The types are generated in `dist/esm/` directory:

```bash
# Check if continuous option exists in definitions
grep -n "continuous" dist/esm/definitions.d.ts

# Check if continuous option exists in types
grep -n "continuous" dist/esm/types.d.ts
```

### 2. **Verify Import Path**
Make sure you're importing from the correct location:

```typescript
// ✅ Correct import
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

// ❌ Wrong import (if you have a local types file)
import { SpeechRecognition } from './src/types/speech-recognition';
```

### 3. **Check TypeScript Configuration**
Ensure your `tsconfig.json` includes the correct types:

```json
{
  "compilerOptions": {
    "types": ["@capacitor-community/speech-recognition"]
  }
}
```

## Solutions

### **Solution 1: Restart TypeScript Language Server**

**VS Code:**
1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

**Other IDEs:**
- Restart your IDE
- Clear TypeScript cache

### **Solution 2: Clear Node Modules Cache**

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Or if using yarn
rm -rf node_modules
yarn install
```

### **Solution 3: Rebuild the Plugin**

```bash
# In the plugin directory
npm run build

# In your project directory
npx cap sync
```

### **Solution 4: Check Package Version**

Make sure you're using the latest version with the continuous option:

```bash
npm list @capacitor-community/speech-recognition
```

### **Solution 5: Manual Type Declaration**

If the types still don't work, you can create a manual declaration:

```typescript
// types/speech-recognition.d.ts
declare module '@capacitor-community/speech-recognition' {
  interface UtteranceOptions {
    language?: string;
    maxResults?: number;
    prompt?: string;
    popup?: boolean;
    partialResults?: boolean;
    continuous?: boolean; // Add this line
  }
  
  // ... rest of the types
}
```

## Testing the Types

Create a test file to verify the types work:

```typescript
// test-types.ts
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

// This should compile without errors
async function test() {
  await SpeechRecognition.start({
    language: 'en-US',
    partialResults: true,
    continuous: true, // This should be recognized
    maxResults: 5
  });
}
```

## Expected Behavior

After fixing the issue, you should see:

1. **Intellisense**: When typing `SpeechRecognition.start({`, you should see `continuous` in the autocomplete
2. **Type Checking**: TypeScript should recognize `continuous: true` as valid
3. **No Errors**: No TypeScript errors when using the continuous option

## Common Issues

### **Issue 1: "Property 'continuous' does not exist"**
- **Cause**: Types not updated or cached
- **Solution**: Restart TypeScript server and rebuild

### **Issue 2: "Cannot find module"**
- **Cause**: Wrong import path
- **Solution**: Use the correct import path

### **Issue 3: "Type 'boolean' is not assignable"**
- **Cause**: TypeScript version compatibility
- **Solution**: Update TypeScript to latest version

## Verification Commands

```bash
# Check if types are generated correctly
ls -la dist/esm/

# Check if continuous option is in the generated types
grep -A 5 -B 5 "continuous" dist/esm/definitions.d.ts

# Test TypeScript compilation
npx tsc --noEmit verify-types.ts
```

If you're still having issues, please provide:
1. Your TypeScript version
2. Your IDE/editor
3. The exact error message
4. Your import statement 