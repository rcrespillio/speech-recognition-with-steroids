import Foundation
import Capacitor
import Speech

@objc(SpeechRecognition)
public class SpeechRecognition: CAPPlugin {

    let defaultMatches = 5
    let messageMissingPermission = "Missing permission"
    let messageAccessDenied = "User denied access to speech recognition"
    let messageRestricted = "Speech recognition restricted on this device"
    let messageNotDetermined = "Speech recognition not determined on this device"
    let messageAccessDeniedMicrophone = "User denied access to microphone"
    let messageOngoing = "Ongoing speech recognition"
    let messageUnknown = "Unknown error occured"

    private var speechRecognizer: SFSpeechRecognizer?
    private var audioEngine: AVAudioEngine?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var hasDetectedSpeech: Bool = false
    private var pendingSilenceTimeoutWorkItem: DispatchWorkItem?

    @objc func available(_ call: CAPPluginCall) {
        guard let recognizer = SFSpeechRecognizer() else {
            call.resolve([
                "available": false
            ])
            return
        }
        call.resolve([
            "available": recognizer.isAvailable
        ])
    }

    @objc func start(_ call: CAPPluginCall) {
        if self.audioEngine != nil {
            if self.audioEngine!.isRunning {
                call.reject(self.messageOngoing)
                return
            }
        }

        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        if status != SFSpeechRecognizerAuthorizationStatus.authorized {
            call.reject(self.messageMissingPermission)
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { (granted) in
            if !granted {
                call.reject(self.messageAccessDeniedMicrophone)
                return
            }

            let language: String = call.getString("language") ?? "en-US"
            let maxResults: Int = call.getInt("maxResults") ?? self.defaultMatches
            let partialResults: Bool = call.getBool("partialResults") ?? false
            let continuous: Bool = call.getBool("continuous") ?? false
            let silenceTimeout: Int? = call.getInt("silenceTimeout")

            if self.recognitionTask != nil {
                self.recognitionTask?.cancel()
                self.recognitionTask = nil
            }
            
            // Reset speech detection flag
            self.hasDetectedSpeech = false

            self.audioEngine = AVAudioEngine.init()
            self.speechRecognizer = SFSpeechRecognizer.init(locale: Locale(identifier: language))

            let audioSession: AVAudioSession = AVAudioSession.sharedInstance()
            do {
                try audioSession.setCategory(AVAudioSession.Category.playAndRecord, options: AVAudioSession.CategoryOptions.defaultToSpeaker)
                try audioSession.setMode(AVAudioSession.Mode.default)
                do {
                    try audioSession.setActive(true, options: AVAudioSession.SetActiveOptions.notifyOthersOnDeactivation)
                } catch {
                      call.reject("Microphone is already in use by another application.")
                      return
                }
            } catch {

            }

            self.recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            self.recognitionRequest?.shouldReportPartialResults = partialResults

            let inputNode: AVAudioInputNode = self.audioEngine!.inputNode
            let format: AVAudioFormat = inputNode.outputFormat(forBus: 0)

            self.recognitionTask = self.speechRecognizer?.recognitionTask(with: self.recognitionRequest!, resultHandler: { (result, error) in
                if result != nil {
                    let resultArray: NSMutableArray = NSMutableArray()
                    var counter: Int = 0

                    for transcription: SFTranscription in result!.transcriptions {
                        if maxResults > 0 && counter < maxResults {
                            resultArray.add(transcription.formattedString)
                        }
                        counter+=1
                    }

                    // Mark that speech has been detected
                    self.hasDetectedSpeech = true
                    
                    if partialResults {
                        self.notifyListeners("partialResults", data: ["matches": resultArray])
                    } else {
                        call.resolve([
                            "matches": resultArray
                        ])
                    }

                    if result!.isFinal {
                        // If in continuous mode, don't stop listening (wait for user to call stop)
                        if continuous {
                            // Continue listening
                        } else if let timeout = silenceTimeout, self.hasDetectedSpeech {
                            // Schedule stop after silence timeout (only if speech has been detected and not in continuous mode)
                            let silenceWorkItem = DispatchWorkItem {
                                if self.audioEngine?.isRunning == true {
                                    self.audioEngine!.stop()
                                    self.audioEngine?.inputNode.removeTap(onBus: 0)
                                    self.notifyListeners("listeningState", data: ["status": "stopped"])
                                    self.recognitionTask = nil
                                    self.recognitionRequest = nil
                                }
                                // Clear the pending work item reference
                                self.pendingSilenceTimeoutWorkItem = nil
                            }
                            
                            // Store the work item so it can be cancelled if user calls stop()
                            self.pendingSilenceTimeoutWorkItem = silenceWorkItem
                            DispatchQueue.main.asyncAfter(deadline: .now() + Double(timeout) / 1000.0, execute: silenceWorkItem)
                        } else {
                            // Default behavior: stop immediately (when not in continuous mode and no silence timeout)
                            self.audioEngine!.stop()
                            self.audioEngine?.inputNode.removeTap(onBus: 0)
                            self.notifyListeners("listeningState", data: ["status": "stopped"])
                            self.recognitionTask = nil
                            self.recognitionRequest = nil
                        }
                    }
                }

                if error != nil {
                    // In continuous mode, ignore certain errors and continue listening
                    if continuous && (error!.localizedDescription.contains("No speech") || error!.localizedDescription.contains("No match")) {
                        // Notify listeners about the error but don't stop
                        self.notifyListeners("onError", data: [
                            "error": error!.localizedDescription,
                            "errorCode": error!._code
                        ])
                        
                        // Continue listening - don't stop the engine
                        return
                    }
                    
                    // For other errors or non-continuous mode, stop listening
                    self.audioEngine!.stop()
                    self.audioEngine?.inputNode.removeTap(onBus: 0)
                    self.recognitionRequest = nil
                    self.recognitionTask = nil
                    
                    // Notify listeners about the error
                    self.notifyListeners("onError", data: [
                        "error": error!.localizedDescription,
                        "errorCode": error!._code
                    ])
                    
                    // Also notify that recording has stopped
                    self.notifyListeners("listeningState", data: ["status": "stopped"])
                    call.reject(error!.localizedDescription)
                }
            })

            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { (buffer: AVAudioPCMBuffer, _: AVAudioTime) in
                self.recognitionRequest?.append(buffer)
            }

            self.audioEngine?.prepare()
            do {
                try self.audioEngine?.start()
                self.notifyListeners("listeningState", data: ["status": "started"])
                if partialResults {
                    call.resolve()
                }
            } catch {
                call.reject(self.messageUnknown)
            }
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.global(qos: DispatchQoS.QoSClass.default).async {
            // Cancel any pending silence timeout task
            if let pendingWorkItem = self.pendingSilenceTimeoutWorkItem {
                pendingWorkItem.cancel()
                self.pendingSilenceTimeoutWorkItem = nil
            }
            
            if let engine = self.audioEngine, engine.isRunning {
                engine.stop()
                self.recognitionRequest?.endAudio()
                self.notifyListeners("listeningState", data: ["status": "stopped"])
            }
            call.resolve()
        }
    }

    @objc func isListening(_ call: CAPPluginCall) {
        let isListening = self.audioEngine?.isRunning ?? false
        call.resolve([
            "listening": isListening
        ])
    }

    @objc func getSupportedLanguages(_ call: CAPPluginCall) {
        let supportedLanguages: Set<Locale>! = SFSpeechRecognizer.supportedLocales() as Set<Locale>
        let languagesArr: NSMutableArray = NSMutableArray()

        for lang: Locale in supportedLanguages {
            languagesArr.add(lang.identifier)
        }

        call.resolve([
            "languages": languagesArr
        ])
    }

    @objc override public func checkPermissions(_ call: CAPPluginCall) {
        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        let permission: String
        switch status {
        case .authorized:
            permission = "granted"
        case .denied, .restricted:
            permission = "denied"
        case .notDetermined:
            permission = "prompt"
        @unknown default:
            permission = "prompt"
        }
        call.resolve(["speechRecognition": permission])
    }

    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { (status: SFSpeechRecognizerAuthorizationStatus) in
            DispatchQueue.main.async {
                switch status {
                case .authorized:
                    AVAudioSession.sharedInstance().requestRecordPermission { (granted: Bool) in
                        if granted {
                            call.resolve(["speechRecognition": "granted"])
                        } else {
                            call.resolve(["speechRecognition": "denied"])
                        }
                    }
                    break
                case .denied, .restricted, .notDetermined:
                    self.checkPermissions(call)
                    break
                @unknown default:
                    self.checkPermissions(call)
                }
            }
        }
    }
}
