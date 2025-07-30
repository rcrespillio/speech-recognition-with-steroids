import type { PermissionState, PluginListenerHandle } from '@capacitor/core';

export interface PermissionStatus {
  /**
   * Permission state for speechRecognition alias.
   *
   * On Android it requests/checks RECORD_AUDIO permission
   *
   * On iOS it requests/checks the speech recognition and microphone permissions.
   *
   * @since 5.0.0
   */
  speechRecognition: PermissionState;
}

export interface SpeechRecognitionPlugin {
  /**
   * This method will check if speech recognition feature is available on the device.
   * @param none
   * @returns available - boolean true/false for availability
   */
  available(): Promise<{ available: boolean }>;
  /**
   * This method will start to listen for utterance.
   *
   * if `partialResults` is `true`, the function respond directly without result and
   * event `partialResults` will be emit for each partial result, until stopped.
   *
   * @param options
   * @returns void or array of string results
   */
  start(options?: UtteranceOptions): Promise<{ matches?: string[] }>;
  /**
   * This method will stop listening for utterance
   * @param none
   * @returns void
   */
  stop(): Promise<void>;
  /**
   * This method will return list of languages supported by the speech recognizer.
   *
   * It's not available on Android 13 and newer.
   *
   * @param none
   * @returns languages - array string of languages
   */
  getSupportedLanguages(): Promise<{ languages: any[] }>;
  /**
   * This method will check if speech recognition is listening.
   * @param none
   * @returns boolean true/false if speech recognition is currently listening
   *
   * @since 5.1.0
   */
  isListening(): Promise<{ listening: boolean }>;
  /**
   * Check the speech recognition permission.
   *
   * @since 5.0.0
   */
  checkPermissions(): Promise<PermissionStatus>;
  /**
   * Request the speech recognition permission.
   *
   * @since 5.0.0
   */
  requestPermissions(): Promise<PermissionStatus>;
  /**
   * Called when partialResults set to true and result received.
   *
   * On Android it doesn't work if popup is true.
   *
   * Provides partial result.
   *
   * @since 2.0.2
   */
  addListener(
    eventName: 'partialResults',
    listenerFunc: (data: { matches: string[] }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Called when listening state changed.
   *
   * @since 5.1.0
   */
  addListener(
    eventName: 'listeningState',
    listenerFunc: (data: { status: 'started' | 'stopped' }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Called when an error occurs during speech recognition.
   * 
   * This event is fired when recording stops due to an error.
   * The recording state will also be set to 'stopped' via the listeningState event.
   *
   * @since 5.2.0
   */
  addListener(
    eventName: 'onError',
    listenerFunc: (data: { error: string; errorCode?: number }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Remove all the listeners that are attached to this plugin.
   *
   * @since 4.0.0
   */
  removeAllListeners(): Promise<void>;
}

export interface UtteranceOptions {
  /**
   * key returned from `getSupportedLanguages()`
   */
  language?: string;
  /**
   * maximum number of results to return (5 is max)
   */
  maxResults?: number;
  /**
   * prompt message to display on popup (Android only)
   */
  prompt?: string;
  /**
   * display popup window when listening for utterance (Android only)
   */
  popup?: boolean;
  /**
   * return partial results if found
   */
  partialResults?: boolean;
  /**
   * keep recording continuously without stopping on silence
   * 
   * When true, the recording will continue even when there are pauses in speech.
   * The recording will only stop when explicitly called via the stop() method.
   * 
   * @since 5.3.0
   */
  continuous?: boolean;
  /**
   * silence timeout in milliseconds before stopping recording
   * 
   * When set, the recording will stop after this many milliseconds of silence.
   * This overrides the default system timeout and works even when continuous is true.
   * 
   * Examples:
   * - 1000: Stop after 1 second of silence
   * - 5000: Stop after 5 seconds of silence
   * - 10000: Stop after 10 seconds of silence
   * 
   * @since 5.4.0
   */
  silenceTimeout?: number;
}
