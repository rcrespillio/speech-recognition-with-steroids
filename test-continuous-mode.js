#!/usr/bin/env node

/**
 * Integration Test for Speech Recognition Continuous Mode
 * 
 * This script tests the continuous mode functionality by simulating
 * the plugin's behavior and verifying the expected event sequences.
 */

const { EventEmitter } = require('events');

// Mock the plugin for testing
class MockSpeechRecognition extends EventEmitter {
    constructor() {
        super();
        this.isListening = false;
        this.isRestarting = false;
        this.isStoppingIntentionally = false;
        this.continuous = false;
        this.capturedEvents = [];
    }

    // Simulate the plugin's start method
    async start(options = {}) {
        this.continuous = options.continuous || false;
        this.isListening = true;
        this.isRestarting = false;
        
        // Simulate "started" event
        this.emit('listeningState', { status: 'started' });
        this.capturedEvents.push('listeningState:started');
        
        console.log(`✅ Started listening (continuous: ${this.continuous})`);
        return { status: 'success' };
    }

    // Simulate the plugin's stop method
    async stop() {
        this.isStoppingIntentionally = true;
        this.isListening = false;
        this.isRestarting = false;
        
        // Simulate "stopped" event
        this.emit('listeningState', { status: 'stopped' });
        this.capturedEvents.push('listeningState:stopped');
        
        console.log('✅ Stopped listening');
        return { status: 'success' };
    }

    // Simulate error handling (like the Android implementation)
    simulateError(errorCode, errorMessage) {
        if (this.isStoppingIntentionally) {
            console.log('⚠️  Ignoring error during intentional stop');
            return;
        }

        console.log(`🔴 Error: ${errorMessage} (code: ${errorCode})`);
        
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
            this.emit('listeningState', { status: 'stopped' });
            this.capturedEvents.push('listeningState:stopped');
            console.log('🛑 Stopped due to error');
        }
    }

    // Simulate internal restart
    simulateRestart() {
        this.isRestarting = true;
        
        // Simulate restart delay
        setTimeout(() => {
            if (this.isListening) {
                console.log('🔄 Speech recognizer restarted internally');
                
                // Simulate onReadyForSpeech but suppress event due to restart flag
                if (!this.isRestarting) {
                    this.emit('listeningState', { status: 'started' });
                    this.capturedEvents.push('listeningState:started');
                }
                
                // Clear restart flag
                setTimeout(() => {
                    this.isRestarting = false;
                    console.log('✅ Restart flag cleared');
                }, 200);
            }
        }, 100);
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

// Test scenarios
async function runTests() {
    console.log('🧪 Running Speech Recognition Continuous Mode Tests\n');

    // Test 1: Continuous mode with "No match" error
    console.log('📋 Test 1: Continuous mode with "No match" error');
    const test1 = new MockSpeechRecognition();
    
    await test1.start({ continuous: true });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    test1.simulateError('ERROR_NO_MATCH', 'No match');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const events1 = test1.getCapturedEvents();
    console.log('📊 Events captured:', events1);
    
    const test1Passed = events1.includes('onError:ERROR_NO_MATCH') && 
                       !events1.includes('listeningState:stopped') &&
                       test1.isListening;
    
    console.log(test1Passed ? '✅ Test 1 PASSED' : '❌ Test 1 FAILED');
    console.log('');

    // Test 2: Non-continuous mode with "No match" error
    console.log('📋 Test 2: Non-continuous mode with "No match" error');
    const test2 = new MockSpeechRecognition();
    
    await test2.start({ continuous: false });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    test2.simulateError('ERROR_NO_MATCH', 'No match');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const events2 = test2.getCapturedEvents();
    console.log('📊 Events captured:', events2);
    
    const test2Passed = events2.includes('onError:ERROR_NO_MATCH') && 
                       events2.includes('listeningState:stopped') &&
                       !test2.isListening;
    
    console.log(test2Passed ? '✅ Test 2 PASSED' : '❌ Test 2 FAILED');
    console.log('');

    // Test 3: Continuous mode with network error (should stop)
    console.log('📋 Test 3: Continuous mode with network error (should stop)');
    const test3 = new MockSpeechRecognition();
    
    await test3.start({ continuous: true });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    test3.simulateError('ERROR_NETWORK', 'Network error');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const events3 = test3.getCapturedEvents();
    console.log('📊 Events captured:', events3);
    
    const test3Passed = events3.includes('onError:ERROR_NETWORK') && 
                       events3.includes('listeningState:stopped') &&
                       !test3.isListening;
    
    console.log(test3Passed ? '✅ Test 3 PASSED' : '❌ Test 3 FAILED');
    console.log('');

    // Test 4: Intentional stop should not trigger error events
    console.log('📋 Test 4: Intentional stop should not trigger error events');
    const test4 = new MockSpeechRecognition();
    
    await test4.start({ continuous: true });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    await test4.stop();
    test4.simulateError('ERROR_NO_MATCH', 'No match');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const events4 = test4.getCapturedEvents();
    console.log('📊 Events captured:', events4);
    
    const test4Passed = !events4.includes('onError:ERROR_NO_MATCH') && 
                       events4.includes('listeningState:stopped');
    
    console.log(test4Passed ? '✅ Test 4 PASSED' : '❌ Test 4 FAILED');
    console.log('');

    // Summary
    const allTestsPassed = test1Passed && test2Passed && test3Passed && test4Passed;
    console.log('📊 Test Summary:');
    console.log(`   Test 1 (Continuous + No Match): ${test1Passed ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 2 (Non-Continuous + No Match): ${test2Passed ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 3 (Continuous + Network Error): ${test3Passed ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 4 (Intentional Stop): ${test4Passed ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(allTestsPassed ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');
}

// Run the tests
runTests().catch(console.error); 