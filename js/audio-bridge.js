/**
 * VoxGesture: Two-Way Audio Communication & Intercom Bridge
 * 1. Dispatches vocalized medical alerts to attending paramedics via SpeechSynthesis.
 * 2. Transcribes paramedic speech into high-contrast captions & symbols for deaf patients.
 */

export class AudioBridge {
  constructor(options = {}) {
    this.synth = window.speechSynthesis;
    this.speechRate = options.rate || 1.0;
    this.audioCtx = null;
    this.onTranscription = options.onTranscription || (() => {});
    this.isListening = false;
    this.recognition = null;

    this.initAudioContext();
    this.initSpeechRecognition();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    } catch (e) {
      console.warn('Web Audio API not supported on this device.');
    }
  }

  /**
   * Plays a crisp hospital telemetry / triage alert chime using Web Audio synthesis
   */
  playAlertChime(severity = 'red') {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (severity === 'red') {
        // High-frequency dual alert tone (880Hz -> 1174Hz)
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        // Calming confirmation chime (523Hz -> 659Hz)
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Alert chime error:', e);
    }
  }

  /**
   * Dispatches vocalized spoken alert for attending paramedic
   */
  vocalize(text, severity = 'red') {
    if (!this.synth || !text) return;

    this.playAlertChime(severity);

    // Cancel current speech if speaking to prioritize latest triage message
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;

    // Pick clear English voice
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Microsoft'))) || voices[0];
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    this.synth.speak(utterance);
  }

  /**
   * Initializes Speech Recognition for first responder questions
   */
  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('SpeechRecognition API not available in this browser. Quick question chips will be used.');
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        this.onTranscription({ text: transcript, isFinal: event.results[event.results.length - 1].isFinal });
      };

      this.recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    } catch (e) {
      console.warn('SpeechRecognition init failed:', e);
    }
  }

  toggleMicrophone() {
    if (!this.recognition) return false;

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
    return this.isListening;
  }
}
