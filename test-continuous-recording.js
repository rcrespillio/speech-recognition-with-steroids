// Test script for continuous recording functionality
// Run this in your app to test if the issue is fixed

import { SpeechRecognition } from '@capacitor-community/speech-recognition';

// Test function to check if recording starts and doesn't stop immediately
async function testContinuousRecording() {
  console.log('🧪 Testing continuous recording...');
  
  try {
    // Check availability
    const { available } = await SpeechRecognition.available();
    console.log('✅ Speech recognition available:', available);
    
    if (!available) {
      console.error('❌ Speech recognition not available');
      return;
    }
    
    // Check permissions
    const { speechRecognition } = await SpeechRecognition.checkPermissions();
    console.log('🔐 Permission status:', speechRecognition);
    
    if (speechRecognition !== 'granted') {
      console.log('🔐 Requesting permissions...');
      const { speechRecognition: newStatus } = await SpeechRecognition.requestPermissions();
      console.log('🔐 New permission status:', newStatus);
      
      if (newStatus !== 'granted') {
        console.error('❌ Permission denied');
        return;
      }
    }
    
    // Set up listeners
    await SpeechRecognition.addListener('listeningState', (data) => {
      console.log('🎧 Listening state changed:', data.status);
    });
    
    await SpeechRecognition.addListener('partialResults', (data) => {
      console.log('📝 Partial results:', data.matches);
    });
    
    await SpeechRecognition.addListener('onError', (data) => {
      console.error('❌ Error occurred:', data.error, 'Code:', data.errorCode);
    });
    
    // Test 1: Normal recording (should stop on silence)
    console.log('\n🧪 Test 1: Normal recording (continuous: false)');
    await SpeechRecognition.start({
      language: 'en-US',
      partialResults: true,
      continuous: false
    });
    
    console.log('✅ Started normal recording');
    
    // Wait 5 seconds then stop
    setTimeout(async () => {
      console.log('🛑 Stopping normal recording...');
      await SpeechRecognition.stop();
      console.log('✅ Normal recording stopped');
      
      // Test 2: Continuous recording (should NOT stop on silence)
      setTimeout(async () => {
        console.log('\n🧪 Test 2: Continuous recording (continuous: true)');
        await SpeechRecognition.start({
          language: 'en-US',
          partialResults: true,
          continuous: true
        });
        
        console.log('✅ Started continuous recording');
        
        // Wait 10 seconds then stop
        setTimeout(async () => {
          console.log('🛑 Stopping continuous recording...');
          await SpeechRecognition.stop();
          console.log('✅ Continuous recording stopped');
          console.log('\n🎉 Test completed!');
        }, 10000);
        
      }, 2000);
      
    }, 5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in your app
export { testContinuousRecording };

// If running directly, execute the test
if (typeof window !== 'undefined') {
  // Browser environment
  window.testContinuousRecording = testContinuousRecording;
  console.log('🧪 Test function available as window.testContinuousRecording()');
} else {
  // Node.js environment
  console.log('🧪 Test function exported as testContinuousRecording');
} 