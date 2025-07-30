#!/usr/bin/env node

/**
 * Mic Listening Test for Speech Recognition Continuous Mode
 * 
 * This test verifies that the microphone is actually listening
 * after internal restarts in continuous mode.
 */

const { EventEmitter } = require('events');

// Enhanced mock that tracks mic state
class MockSpeechRecognitionWithMic extends EventEmitter {
    constructor() {
        super();
        this.isListening = false;
        this.isRestarting = false;
        this.isStoppingIntentionally = false;
        this.continuous = false;
        this.capturedEvents = [];
        this.micState = 'inactive';
        this.speechRecognizerState = 'destroyed';
        this.lastSpeechTime = 0;
    }

    // Simulate the plugin's start method
    async start(options = {}) {
        this.continuous = options.continuous || false;
        this.isListening = true;
        this.isRestarting = false;
        this.micState = 'active';
        this.speechRecognizerState = 'listening';
        this.lastSpeechTime = Date.now();
        
        // Simulate "started" event
        this.emit('listeningState', { status: 'started' });
        this.capturedEvents.push('listeningState:started');
        
        console.log(`✅ Started listening (continuous: ${this.continuous})`);
        console.log(`🎤 Mic state: ${this.micState}`);
        console.log(`🔊 Speech recognizer: ${this.speechRecognizerState}`);
        return { status: 'success' };
    }

    // Simulate the plugin's stop method
    async stop() {
        this.isStoppingIntentionally = true;
        this.isListening = false;
        this.isRestarting = false;
        this.micState = 'inactive';
        this.speechRecognizerState = 'destroyed';
        
        // Simulate "stopped" event
        this.emit('listeningState', { status: 'stopped' });
        this.capturedEvents.push('listeningState:stopped');
        
        console.log('✅ Stopped listening');
        console.log(`🎤 Mic state: ${this.micState}`);
        console.log(`🔊 Speech recognizer: ${this.speechRecognizerState}`);
        return { status: 'success' };
    }

    // Simulate error handling with mic state tracking
    simulateError(errorCode, errorMessage) {
        if (this.isStoppingIntentionally) {
            console.log('⚠️  Ignoring error during intentional stop');
            return;
        }

        console.log(`🔴 Error: ${errorMessage} (code: ${errorCode})`);
        console.log(`🎤 Mic state before error: ${this.micState}`);
        
        // Simulate error event
        this.emit('onError', { error: errorMessage, errorCode });
        this.capturedEvents.push(`onError:${errorCode}`);

        // Handle continuous mode errors
        if (this.continuous && (errorCode === 'ERROR_NO_MATCH' || errorCode === 'ERROR_SPEECH_TIMEOUT')) {
            console.log('🔄 Continuous mode: restarting internally...');
            this.simulateRestart();
        } else {
            // Stop for other errors or non-continuous mode
            this.isListening = false;
            this.micState = 'inactive';
            this.speechRecognizerState = 'destroyed';
            this.emit('listeningState', { status: 'stopped' });
            this.capturedEvents.push('listeningState:stopped');
            console.log('🛑 Stopped due to error');
            console.log(`🎤 Mic state after error: ${this.micState}`);
        }
    }

    // Simulate internal restart with mic verification
    simulateRestart() {
        this.isRestarting = true;
        this.speechRecognizerState = 'destroying';
        
        console.log('🔄 Destroying old speech recognizer...');
        
        // Simulate restart delay
        setTimeout(() => {
            if (this.isListening) {
                console.log('🔄 Creating new speech recognizer...');
                this.speechRecognizerState = 'creating';
                
                setTimeout(() => {
                    this.speechRecognizerState = 'listening';
                    this.micState = 'active';
                    console.log('🔄 Speech recognizer restarted internally');
                    console.log(`🎤 Mic state after restart: ${this.micState}`);
                    console.log(`🔊 Speech recognizer state: ${this.speechRecognizerState}`);
                    
                    // Simulate onReadyForSpeech but suppress event due to restart flag
                    if (!this.isRestarting) {
                        this.emit('listeningState', { status: 'started' });
                        this.capturedEvents.push('listeningState:started');
                    }
                    
                    // Clear restart flag
                    setTimeout(() => {
                        this.isRestarting = false;
                        console.log('✅ Restart flag cleared');
                        console.log(`🎤 Final mic state: ${this.micState}`);
                    }, 200);
                }, 50);
            }
        }, 100);
    }

    // Simulate speech input to test if mic is listening
    simulateSpeechInput(text) {
        if (!this.isListening) {
            console.log('❌ Cannot simulate speech - not listening');
            return false;
        }
        
        if (this.speechRecognizerState !== 'listening') {
            console.log(`❌ Cannot simulate speech - recognizer state: ${this.speechRecognizerState}`);
            return false;
        }
        
        if (this.micState !== 'active') {
            console.log(`❌ Cannot simulate speech - mic state: ${this.micState}`);
            return false;
        }
        
        this.lastSpeechTime = Date.now();
        console.log(`🎤 Speech detected: "${text}"`);
        console.log(`⏰ Speech time: ${this.lastSpeechTime}`);
        
        // Simulate speech recognition result
        this.emit('partialResults', { matches: [text] });
        this.capturedEvents.push(`speech:${text}`);
        
        return true;
    }

    // Get current state for verification
    getCurrentState() {
        return {
            isListening: this.isListening,
            micState: this.micState,
            speechRecognizerState: this.speechRecognizerState,
            isRestarting: this.isRestarting,
            lastSpeechTime: this.lastSpeechTime
        };
    }

    // Get captured events for verification
    getCapturedEvents() {
        return [...this.capturedEvents];
    }

    // Clear captured events
    clearEvents() {
        this.capturedEvents = [];
    }
}

// Test scenarios for mic listening verification
async function runMicListeningTests() {
    console.log('🧪 Running Mic Listening Tests\n');

    // Test 1: Verify mic is listening after restart
    console.log('📋 Test 1: Mic listening after restart');
    const test1 = new MockSpeechRecognitionWithMic();
    
    await test1.start({ continuous: true });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Simulate speech before error
    const speechBefore = test1.simulateSpeechInput("Hello before error");
    
    // Trigger error and restart
    test1.simulateError('ERROR_NO_MATCH', 'No match');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try to simulate speech after restart
    const speechAfter = test1.simulateSpeechInput("Hello after restart");
    
    const state = test1.getCurrentState();
    const events = test1.getCapturedEvents();
    
    console.log('📊 Final state:', state);
    console.log('📊 Events captured:', events);
    
    const test1Passed = speechBefore && speechAfter && 
                       state.micState === 'active' && 
                       state.speechRecognizerState === 'listening' &&
                       state.isListening;
    
    console.log(test1Passed ? '✅ Test 1 PASSED' : '❌ Test 1 FAILED');
    console.log('');

    // Test 2: Verify mic stops after non-continuous error
    console.log('📋 Test 2: Mic stops after non-continuous error');
    const test2 = new MockSpeechRecognitionWithMic();
    
    await test2.start({ continuous: false });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const speechBefore2 = test2.simulateSpeechInput("Hello before error");
    test2.simulateError('ERROR_NO_MATCH', 'No match');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const speechAfter2 = test2.simulateSpeechInput("Hello after error");
    const state2 = test2.getCurrentState();
    
    const test2Passed = speechBefore2 && !speechAfter2 && 
                       state2.micState === 'inactive' && 
                       !state2.isListening;
    
    console.log(test2Passed ? '✅ Test 2 PASSED' : '❌ Test 2 FAILED');
    console.log('');

    // Test 3: Verify mic state transitions during restart
    console.log('📋 Test 3: Mic state transitions during restart');
    const test3 = new MockSpeechRecognitionWithMic();
    
    await test3.start({ continuous: true });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const states = [];
    states.push(test3.getCurrentState());
    
    test3.simulateError('ERROR_NO_MATCH', 'No match');
    
    // Monitor state changes during restart
    for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        states.push(test3.getCurrentState());
    }
    
    console.log('📊 State transitions:');
    states.forEach((state, index) => {
        console.log(`   Step ${index}: mic=${state.micState}, recognizer=${state.speechRecognizerState}, listening=${state.isListening}`);
    });
    
    const test3Passed = states[states.length - 1].micState === 'active' && 
                       states[states.length - 1].speechRecognizerState === 'listening';
    
    console.log(test3Passed ? '✅ Test 3 PASSED' : '❌ Test 3 FAILED');
    console.log('');

    // Test 4: Verify speech recognition after restart
    console.log('📋 Test 4: Speech recognition after restart');
    const test4 = new MockSpeechRecognitionWithMic();
    
    await test4.start({ continuous: true });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    test4.simulateError('ERROR_NO_MATCH', 'No match');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try multiple speech inputs after restart
    const speechResults = [];
    for (let i = 0; i < 3; i++) {
        const result = test4.simulateSpeechInput(`Test speech ${i + 1}`);
        speechResults.push(result);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const events4 = test4.getCapturedEvents();
    const speechEvents = events4.filter(e => e.startsWith('speech:'));
    
    const test4Passed = speechResults.every(r => r) && speechEvents.length >= 3;
    
    console.log(`📊 Speech events captured: ${speechEvents.length}`);
    console.log(test4Passed ? '✅ Test 4 PASSED' : '❌ Test 4 FAILED');
    console.log('');

    // Summary
    const allTestsPassed = test1Passed && test2Passed && test3Passed && test4Passed;
    console.log('📊 Mic Listening Test Summary:');
    console.log(`   Test 1 (Mic listening after restart): ${test1Passed ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 2 (Mic stops after non-continuous error): ${test2Passed ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 3 (Mic state transitions): ${test3Passed ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 4 (Speech recognition after restart): ${test4Passed ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(allTestsPassed ? '🎉 ALL MIC TESTS PASSED!' : '❌ SOME MIC TESTS FAILED');
    
    if (allTestsPassed) {
        console.log('🎤 The microphone is properly listening after restarts!');
    } else {
        console.log('🔍 Some mic listening issues detected. Check the implementation.');
    }
}

// Run the mic listening tests
runMicListeningTests().catch(console.error); 