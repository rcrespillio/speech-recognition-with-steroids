#!/usr/bin/env node

/**
 * Manual Test Script for Speech Recognition Continuous Mode
 * 
 * This script provides step-by-step instructions for manually testing
 * the continuous mode functionality in a real environment.
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function runManualTests() {
    console.log('🧪 Manual Test for Speech Recognition Continuous Mode\n');
    console.log('This test will guide you through testing the plugin manually.\n');

    // Test 1: Basic Continuous Mode
    console.log('📋 Test 1: Basic Continuous Mode');
    console.log('Steps:');
    console.log('1. Start your app with the plugin');
    console.log('2. Call SpeechRecognition.start({ continuous: true })');
    console.log('3. Speak some words and verify they are recognized');
    console.log('4. Wait for silence (should trigger "No match" error)');
    console.log('5. Speak again - should continue listening');
    console.log('6. Call SpeechRecognition.stop() to end');
    
    const test1Result = await question('\nDid the continuous mode work correctly? (y/n): ');
    console.log('');

    // Test 2: Error Handling
    console.log('📋 Test 2: Error Handling');
    console.log('Steps:');
    console.log('1. Start continuous mode again');
    console.log('2. Check console/logs for error events');
    console.log('3. Verify that "No match" errors don\'t stop listening');
    console.log('4. Verify that network errors DO stop listening');
    
    const test2Result = await question('\nDid error handling work correctly? (y/n): ');
    console.log('');

    // Test 3: Event Suppression
    console.log('📋 Test 3: Event Suppression');
    console.log('Steps:');
    console.log('1. Start continuous mode');
    console.log('2. Monitor for "started" events');
    console.log('3. Trigger "No match" error (speak gibberish)');
    console.log('4. Verify NO duplicate "started" events appear');
    console.log('5. Verify only ONE initial "started" event');
    
    const test3Result = await question('\nWere events suppressed correctly? (y/n): ');
    console.log('');

    // Test 4: Non-Continuous Mode
    console.log('📋 Test 4: Non-Continuous Mode');
    console.log('Steps:');
    console.log('1. Call SpeechRecognition.start({ continuous: false })');
    console.log('2. Speak some words');
    console.log('3. Wait for silence or "No match" error');
    console.log('4. Verify that listening stops automatically');
    
    const test4Result = await question('\nDid non-continuous mode work correctly? (y/n): ');
    console.log('');

    // Test 5: Intentional Stop
    console.log('📋 Test 5: Intentional Stop');
    console.log('Steps:');
    console.log('1. Start continuous mode');
    console.log('2. Call SpeechRecognition.stop()');
    console.log('3. Verify that no error events are triggered');
    console.log('4. Verify that "stopped" event is sent');
    
    const test5Result = await question('\nDid intentional stop work correctly? (y/n): ');
    console.log('');

    // Summary
    const results = [test1Result, test2Result, test3Result, test4Result, test5Result];
    const passed = results.filter(r => r.toLowerCase() === 'y').length;
    
    console.log('📊 Test Summary:');
    console.log(`   Test 1 (Basic Continuous Mode): ${test1Result === 'y' ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 2 (Error Handling): ${test2Result === 'y' ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 3 (Event Suppression): ${test3Result === 'y' ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 4 (Non-Continuous Mode): ${test4Result === 'y' ? 'PASS' : 'FAIL'}`);
    console.log(`   Test 5 (Intentional Stop): ${test5Result === 'y' ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`🎯 Overall: ${passed}/5 tests passed`);
    
    if (passed === 5) {
        console.log('🎉 ALL TESTS PASSED! The continuous mode is working correctly.');
    } else {
        console.log('❌ Some tests failed. Please review the implementation.');
    }

    rl.close();
}

// Helper function to generate test code
function generateTestCode() {
    console.log('\n📝 Sample Test Code for Your App:\n');
    console.log(`
// Test continuous mode
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
    `);
}

// Run the manual tests
runManualTests().then(() => {
    generateTestCode();
}).catch(console.error); 