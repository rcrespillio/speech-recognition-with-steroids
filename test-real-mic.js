#!/usr/bin/env node

/**
 * Real-World Mic Testing for Speech Recognition
 * 
 * This script provides code and instructions for testing
 * mic listening in a real app environment.
 */

console.log('🎤 Real-World Mic Testing Guide\n');

console.log('📋 Copy this code into your app to test mic listening after restart:\n');

console.log(`
// ===== REAL-WORLD MIC TESTING CODE =====

import { SpeechRecognition } from '@capacitor-community/speech-recognition';

class MicListeningTester {
    constructor() {
        this.isListening = false;
        this.errorCount = 0;
        this.restartCount = 0;
        this.speechCount = 0;
        this.lastSpeechTime = 0;
        this.testResults = [];
    }

    async startTest() {
        console.log('🧪 Starting Real-World Mic Test...');
        
        try {
            // Add all listeners
            this.setupListeners();
            
            // Start continuous mode
            await SpeechRecognition.start({
                continuous: true,
                partialResults: true
            });
            
            console.log('✅ Continuous mode started');
            this.isListening = true;
            
            // Run test scenarios
            await this.runTestScenarios();
            
        } catch (error) {
            console.error('❌ Test failed:', error);
        }
    }

    setupListeners() {
        // Listening state listener
        SpeechRecognition.addListener('listeningState', (state) => {
            console.log('📡 Listening state:', state.status);
            this.testResults.push({
                type: 'listeningState',
                status: state.status,
                timestamp: Date.now()
            });
            
            if (state.status === 'started') {
                console.log('🎤 Mic should be active now');
            } else if (state.status === 'stopped') {
                console.log('🔇 Mic should be inactive now');
                this.isListening = false;
            }
        });

        // Error listener
        SpeechRecognition.addListener('onError', (error) => {
            console.log('🔴 Error:', error.error, '(code:', error.errorCode, ')');
            this.errorCount++;
            this.testResults.push({
                type: 'error',
                error: error.error,
                errorCode: error.errorCode,
                timestamp: Date.now()
            });
            
            // Check if this should trigger a restart
            if (error.errorCode === 'ERROR_NO_MATCH' || error.errorCode === 'ERROR_SPEECH_TIMEOUT') {
                console.log('🔄 This error should trigger restart in continuous mode');
                this.restartCount++;
            }
        });

        // Partial results listener
        SpeechRecognition.addListener('partialResults', (results) => {
            console.log('🎤 Speech detected:', results.matches);
            this.speechCount++;
            this.lastSpeechTime = Date.now();
            this.testResults.push({
                type: 'speech',
                matches: results.matches,
                timestamp: Date.now()
            });
        });
    }

    async runTestScenarios() {
        console.log('\\n📋 Running test scenarios...');
        
        // Scenario 1: Wait for "No match" error and verify restart
        console.log('\\n🎯 Scenario 1: Wait for "No match" error');
        console.log('   - Stay silent for 10-15 seconds');
        console.log('   - Should see "No match" error');
        console.log('   - Should see restart (no duplicate "started" events)');
        
        await this.wait(15000);
        
        // Scenario 2: Test speech after restart
        console.log('\\n🎯 Scenario 2: Test speech after restart');
        console.log('   - Speak clearly: "Testing microphone after restart"');
        console.log('   - Should see speech recognition results');
        
        await this.wait(10000);
        
        // Scenario 3: Multiple errors and restarts
        console.log('\\n🎯 Scenario 3: Multiple errors and restarts');
        console.log('   - Stay silent again for 10-15 seconds');
        console.log('   - Should see another "No match" error');
        console.log('   - Should restart again');
        
        await this.wait(15000);
        
        // Scenario 4: Final speech test
        console.log('\\n🎯 Scenario 4: Final speech test');
        console.log('   - Speak: "Final test after multiple restarts"');
        console.log('   - Should still recognize speech');
        
        await this.wait(10000);
        
        // End test
        await this.endTest();
    }

    async endTest() {
        console.log('\\n📊 Test Results:');
        console.log('   Errors encountered:', this.errorCount);
        console.log('   Restarts triggered:', this.restartCount);
        console.log('   Speech events:', this.speechCount);
        console.log('   Total events:', this.testResults.length);
        
        // Analyze results
        this.analyzeResults();
        
        // Stop listening
        await SpeechRecognition.stop();
        console.log('\\n✅ Test completed');
    }

    analyzeResults() {
        console.log('\\n🔍 Analysis:');
        
        // Check for duplicate "started" events
        const startedEvents = this.testResults.filter(r => 
            r.type === 'listeningState' && r.status === 'started'
        );
        
        if (startedEvents.length === 1) {
            console.log('✅ Only one "started" event (no duplicates)');
        } else {
            console.log('❌ Multiple "started" events detected:', startedEvents.length);
        }
        
        // Check for proper error handling
        const noMatchErrors = this.testResults.filter(r => 
            r.type === 'error' && 
            (r.errorCode === 'ERROR_NO_MATCH' || r.errorCode === 'ERROR_SPEECH_TIMEOUT')
        );
        
        if (noMatchErrors.length > 0) {
            console.log('✅ "No match" errors properly handled');
        } else {
            console.log('⚠️  No "No match" errors encountered');
        }
        
        // Check for speech recognition after errors
        const speechAfterErrors = this.testResults.filter(r => 
            r.type === 'speech' && 
            r.timestamp > (noMatchErrors[noMatchErrors.length - 1]?.timestamp || 0)
        );
        
        if (speechAfterErrors.length > 0) {
            console.log('✅ Speech recognized after errors/restarts');
        } else {
            console.log('❌ No speech recognized after errors');
        }
        
        // Overall assessment
        const micWorking = startedEvents.length === 1 && speechAfterErrors.length > 0;
        console.log('\\n🎤 Mic Listening Assessment:', micWorking ? 'WORKING' : 'NOT WORKING');
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ===== USAGE =====
// const tester = new MicListeningTester();
// tester.startTest();
`);

console.log('\n📋 Manual Testing Instructions:\n');

console.log('1. **Setup Test Environment:**');
console.log('   - Copy the code above into your app');
console.log('   - Ensure microphone permissions are granted');
console.log('   - Run on a real device (not simulator)');

console.log('\n2. **Run the Test:**');
console.log('   const tester = new MicListeningTester();');
console.log('   tester.startTest();');

console.log('\n3. **Test Scenarios:**');
console.log('   - Scenario 1: Stay silent for 10-15 seconds');
console.log('   - Scenario 2: Speak clearly after error');
console.log('   - Scenario 3: Stay silent again');
console.log('   - Scenario 4: Speak again');

console.log('\n4. **Expected Results:**');
console.log('   ✅ Only one "started" event');
console.log('   ✅ "No match" errors trigger restarts');
console.log('   ✅ Speech recognized after restarts');
console.log('   ✅ Mic stays active throughout');

console.log('\n5. **Troubleshooting:**');
console.log('   - Check console logs for detailed analysis');
console.log('   - Verify microphone permissions');
console.log('   - Test in quiet environment');
console.log('   - Use clear, loud speech');

console.log('\n🎯 **Key Indicators of Success:**');
console.log('   - Mic indicator stays active after errors');
console.log('   - Speech recognition works after "No match" errors');
console.log('   - No duplicate "started" events in logs');
console.log('   - Continuous listening without manual restart');

console.log('\n📊 **Test Results Interpretation:**');
console.log('   - "WORKING": Mic properly listening after restarts');
console.log('   - "NOT WORKING": Issues with restart or mic state');
console.log('   - Check logs for specific failure points'); 