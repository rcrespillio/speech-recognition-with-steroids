package com.getcapacitor.community.speechrecognition;

import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.SpeechRecognizer;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 28)
public class SpeechRecognitionTest {

    @Mock
    private PluginCall mockCall;
    
    @Mock
    private SpeechRecognizer mockSpeechRecognizer;
    
    private SpeechRecognition speechRecognition;
    private SpeechRecognition.SpeechRecognitionListener listener;
    private ArrayList<String> capturedEvents;
    private CountDownLatch eventLatch;

    @Before
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        speechRecognition = new SpeechRecognition();
        capturedEvents = new ArrayList<>();
        eventLatch = new CountDownLatch(1);
    }

    @Test
    public void testContinuousMode_NoMatchError_ShouldRestartInternally() throws InterruptedException {
        // Arrange
        setupContinuousMode();
        
        // Act - Simulate "No match" error
        listener.onError(SpeechRecognizer.ERROR_NO_MATCH);
        
        // Wait for restart logic
        Thread.sleep(150);
        
        // Assert
        // Should not have stopped listening
        assertTrue("Should still be listening after No match error", speechRecognition.isListening());
        
        // Should have sent error event but not stopped event
        assertTrue("Should have captured error event", capturedEvents.contains("onError"));
        assertFalse("Should not have sent stopped event", capturedEvents.contains("listeningState:stopped"));
    }

    @Test
    public void testContinuousMode_SpeechTimeoutError_ShouldRestartInternally() throws InterruptedException {
        // Arrange
        setupContinuousMode();
        
        // Act - Simulate "Speech timeout" error
        listener.onError(SpeechRecognizer.ERROR_SPEECH_TIMEOUT);
        
        // Wait for restart logic
        Thread.sleep(150);
        
        // Assert
        assertTrue("Should still be listening after Speech timeout error", speechRecognition.isListening());
        assertTrue("Should have captured error event", capturedEvents.contains("onError"));
        assertFalse("Should not have sent stopped event", capturedEvents.contains("listeningState:stopped"));
    }

    @Test
    public void testNonContinuousMode_NoMatchError_ShouldStop() {
        // Arrange
        setupNonContinuousMode();
        
        // Act - Simulate "No match" error
        listener.onError(SpeechRecognizer.ERROR_NO_MATCH);
        
        // Assert
        assertFalse("Should stop listening after No match error", speechRecognition.isListening());
        assertTrue("Should have captured error event", capturedEvents.contains("onError"));
        assertTrue("Should have sent stopped event", capturedEvents.contains("listeningState:stopped"));
    }

    @Test
    public void testContinuousMode_NetworkError_ShouldStop() {
        // Arrange
        setupContinuousMode();
        
        // Act - Simulate network error
        listener.onError(SpeechRecognizer.ERROR_NETWORK);
        
        // Assert
        assertFalse("Should stop listening after network error", speechRecognition.isListening());
        assertTrue("Should have captured error event", capturedEvents.contains("onError"));
        assertTrue("Should have sent stopped event", capturedEvents.contains("listeningState:stopped"));
    }

    @Test
    public void testRestartFlag_ShouldSuppressStartedEvent() {
        // Arrange
        setupContinuousMode();
        speechRecognition.isRestarting = true;
        
        // Act - Simulate ready for speech (restart)
        listener.onReadyForSpeech(new Bundle());
        
        // Assert
        assertFalse("Should not send started event during restart", 
                   capturedEvents.contains("listeningState:started"));
    }

    @Test
    public void testNormalStart_ShouldSendStartedEvent() {
        // Arrange
        setupContinuousMode();
        speechRecognition.isRestarting = false;
        
        // Act - Simulate ready for speech (normal start)
        listener.onReadyForSpeech(new Bundle());
        
        // Assert
        assertTrue("Should send started event for normal start", 
                  capturedEvents.contains("listeningState:started"));
    }

    @Test
    public void testIntentionalStop_ShouldNotTriggerError() {
        // Arrange
        setupContinuousMode();
        speechRecognition.isStoppingIntentionally = true;
        
        // Act - Simulate error during intentional stop
        listener.onError(SpeechRecognizer.ERROR_NO_MATCH);
        
        // Assert
        assertFalse("Should not capture error during intentional stop", 
                   capturedEvents.contains("onError"));
    }

    @Test
    public void testPartialResults_ShouldNotifyListeners() {
        // Arrange
        setupContinuousMode();
        Bundle partialResults = new Bundle();
        ArrayList<String> matches = new ArrayList<>();
        matches.add("partial result");
        partialResults.putStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION, matches);
        
        // Act
        listener.onPartialResults(partialResults);
        
        // Assert
        assertTrue("Should have captured partial results event", 
                  capturedEvents.contains("partialResults"));
    }

    @Test
    public void testFinalResults_ContinuousMode_ShouldNotStop() {
        // Arrange
        setupContinuousMode();
        Bundle results = new Bundle();
        ArrayList<String> matches = new ArrayList<>();
        matches.add("final result");
        results.putStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION, matches);
        
        // Act
        listener.onResults(results);
        
        // Assert
        assertTrue("Should still be listening after results in continuous mode", 
                  speechRecognition.isListening());
    }

    @Test
    public void testFinalResults_NonContinuousMode_ShouldStop() {
        // Arrange
        setupNonContinuousMode();
        Bundle results = new Bundle();
        ArrayList<String> matches = new ArrayList<>();
        matches.add("final result");
        results.putStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION, matches);
        
        // Act
        listener.onResults(results);
        
        // Assert
        assertFalse("Should stop listening after results in non-continuous mode", 
                   speechRecognition.isListening());
    }

    // Helper methods
    private void setupContinuousMode() {
        // Mock the speech recognizer
        when(mockSpeechRecognizer.createSpeechRecognizer(any())).thenReturn(mockSpeechRecognizer);
        
        // Setup listener with continuous mode
        listener = speechRecognition.new SpeechRecognitionListener();
        listener.setCall(mockCall);
        listener.setContinuous(true);
        listener.setPartialResults(true);
        
        // Mock event capturing
        doAnswer(invocation -> {
            String eventName = invocation.getArgument(0);
            JSObject data = invocation.getArgument(1);
            capturedEvents.add(eventName + ":" + data.getString("status", ""));
            return null;
        }).when(speechRecognition).notifyListeners(anyString(), any(JSObject.class));
    }

    private void setupNonContinuousMode() {
        // Mock the speech recognizer
        when(mockSpeechRecognizer.createSpeechRecognizer(any())).thenReturn(mockSpeechRecognizer);
        
        // Setup listener with non-continuous mode
        listener = speechRecognition.new SpeechRecognitionListener();
        listener.setCall(mockCall);
        listener.setContinuous(false);
        listener.setPartialResults(false);
        
        // Mock event capturing
        doAnswer(invocation -> {
            String eventName = invocation.getArgument(0);
            JSObject data = invocation.getArgument(1);
            capturedEvents.add(eventName + ":" + data.getString("status", ""));
            return null;
        }).when(speechRecognition).notifyListeners(anyString(), any(JSObject.class));
    }
} 