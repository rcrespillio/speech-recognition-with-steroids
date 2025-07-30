// Test script for silenceTimeout functionality
// Run this in your app to test the new silence timeout feature

import { SpeechRecognition } from '@capacitor-community/speech-recognition';

// Test function to check silence timeout functionality
async function testSilenceTimeout() {
  console.log('🧪 Testing silence timeout functionality...');
  
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
    console.log('\n🧪 Test 1: Normal recording (no timeout)');
    await SpeechRecognition.start({
      language: 'en-US',
      partialResults: true
    });
    
    console.log('✅ Started normal recording');
    
    // Wait 3 seconds then stop
    setTimeout(async () => {
      console.log('🛑 Stopping normal recording...');
      await SpeechRecognition.stop();
      console.log('✅ Normal recording stopped');
      
      // Test 2: Recording with 2-second silence timeout
      setTimeout(async () => {
        console.log('\n🧪 Test 2: Recording with 2-second silence timeout');
        await SpeechRecognition.start({
          language: 'en-US',
          partialResults: true,
          silenceTimeout: 2000 // 2 seconds
        });
        
        console.log('✅ Started recording with 2s silence timeout');
        console.log('💡 Speak something, then stay silent for 2 seconds...');
        
        // Wait 10 seconds then stop (in case it doesn't auto-stop)
        setTimeout(async () => {
          console.log('🛑 Manually stopping recording...');
          await SpeechRecognition.stop();
          console.log('✅ Recording stopped');
          
          // Test 3: Continuous recording with 3-second silence timeout
          setTimeout(async () => {
            console.log('\n🧪 Test 3: Continuous recording with 3-second silence timeout');
            await SpeechRecognition.start({
              language: 'en-US',
              partialResults: true,
              continuous: true,
              silenceTimeout: 3000 // 3 seconds
            });
            
            console.log('✅ Started continuous recording with 3s silence timeout');
            console.log('💡 Speak something, then stay silent for 3 seconds...');
            
            // Wait 15 seconds then stop (in case it doesn't auto-stop)
            setTimeout(async () => {
              console.log('🛑 Manually stopping continuous recording...');
              await SpeechRecognition.stop();
              console.log('✅ Continuous recording stopped');
              console.log('\n🎉 All silence timeout tests completed!');
            }, 15000);
            
          }, 2000);
          
        }, 10000);
        
      }, 2000);
      
    }, 3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in your app
export { testSilenceTimeout };

// If running directly, execute the test
if (typeof window !== 'undefined') {
  // Browser environment
  window.testSilenceTimeout = testSilenceTimeout;
  console.log('🧪 Test function available as window.testSilenceTimeout()');
} else {
  // Node.js environment
  console.log('🧪 Test function exported as testSilenceTimeout');
} 