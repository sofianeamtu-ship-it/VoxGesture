/**
 * VoxGesture: Application Coordinator
 * Binds Edge Landmark Engine, Temporal Classifier, Two-Way Audio Bridge, and Triage Dashboard.
 */

import { LandmarkEngine } from './landmark-engine.js';
import { GestureClassifier, GESTURE_DICTIONARY } from './gesture-classifier.js';
import { AudioBridge } from './audio-bridge.js';
import { TriageManager } from './triage-manager.js';

class VoxGestureApp {
  constructor() {
    this.initDOM();
    this.initEngines();
    this.initEventListeners();
    this.startLoop();
  }

  initDOM() {
    // Canvas & Video
    this.canvas = document.getElementById('skeleton-canvas');
    this.video = document.getElementById('webcam-video');

    // Telemetry Elements
    this.fpsEl = document.getElementById('fps-counter');
    this.latencyEl = document.getElementById('latency-counter');
    this.confidenceBar = document.getElementById('confidence-meter-fill');
    this.confidenceLabel = document.getElementById('confidence-label');
    this.trackingModeLabel = document.getElementById('tracking-mode-label');

    // Controls
    this.btnToggleCam = document.getElementById('btn-toggle-cam');
    this.btnToggleMic = document.getElementById('btn-toggle-mic');
    this.micStatusText = document.getElementById('mic-status-text');
    this.patientCaptionEl = document.getElementById('patient-caption-text');
    this.btnExportReport = document.getElementById('btn-export-report');

    // Containers
    this.triageCardContainer = document.getElementById('active-triage-card');
    this.eventLogContainer = document.getElementById('triage-event-log');

    // Modals
    this.aiModal = document.getElementById('ai-transparency-modal');
    this.rubricModal = document.getElementById('rubric-modal');
  }

  initEngines() {
    this.landmarkEngine = new LandmarkEngine(this.canvas, this.video);
    this.classifier = new GestureClassifier({ threshold: 0.82 });

    this.triageManager = new TriageManager({
      cardContainer: this.triageCardContainer,
      logContainer: this.eventLogContainer
    });

    this.audioBridge = new AudioBridge({
      rate: 1.05,
      onTranscription: (data) => {
        if (this.patientCaptionEl) {
          this.patientCaptionEl.textContent = data.text;
        }
      }
    });

    // Default to initial simulation so the screen is immediately active with high-impact wireframe
    this.landmarkEngine.startSimulation('GEST_CHEST_PAIN');
    this.triggerGesture('GEST_CHEST_PAIN', true);
  }

  triggerGesture(gestureKey, vocalizeAudio = false) {
    const gestureData = GESTURE_DICTIONARY[gestureKey];
    if (!gestureData) return;

    // Switch synthetic simulation pose
    this.landmarkEngine.startSimulation(gestureKey);

    // Update Triage Manager
    this.triageManager.updateTriage(gestureData, 96);

    // Update patient caption screen with confirmation
    if (this.patientCaptionEl) {
      this.patientCaptionEl.textContent = `[CONFIRMED]: ${gestureData.patientCaption}`;
    }

    // Vocalize spoken dispatch for paramedic
    if (vocalizeAudio) {
      this.audioBridge.vocalize(gestureData.spokenDispatch, gestureData.severity);
    }
  }

  startLoop() {
    const loop = (timestamp) => {
      const frameData = this.landmarkEngine.processFrame(timestamp);

      if (frameData) {
        // Update HUD Telemetry
        if (this.fpsEl) this.fpsEl.textContent = `${frameData.metrics.fps} FPS`;
        if (this.latencyEl) this.latencyEl.textContent = `${frameData.metrics.latencyMs} ms`;

        // Classify Gesture
        const classification = this.classifier.classify(frameData);

        if (classification) {
          const { gesture, confidence, isNewTrigger } = classification;
          
          if (this.confidenceBar) this.confidenceBar.style.width = `${confidence}%`;
          if (this.confidenceLabel) this.confidenceLabel.textContent = `${confidence}%`;

          if (isNewTrigger) {
            this.triageManager.updateTriage(gesture, confidence);
            this.audioBridge.vocalize(gesture.spokenDispatch, gesture.severity);
            if (this.patientCaptionEl) {
              this.patientCaptionEl.textContent = `[CONFIRMED]: ${gesture.patientCaption}`;
            }
          }
        }
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  initEventListeners() {
    // Camera Toggle
    if (this.btnToggleCam) {
      this.btnToggleCam.addEventListener('click', async () => {
        if (this.landmarkEngine.isStreaming) {
          this.landmarkEngine.stopWebcam();
          this.landmarkEngine.startSimulation('GEST_CHEST_PAIN');
          this.btnToggleCam.innerHTML = '<span>📹</span> Start Webcam';
          if (this.trackingModeLabel) this.trackingModeLabel.textContent = 'MODE: SIMULATION';
        } else {
          const success = await this.landmarkEngine.startWebcam();
          if (success) {
            this.btnToggleCam.innerHTML = '<span>⏹</span> Stop Webcam';
            if (this.trackingModeLabel) this.trackingModeLabel.textContent = 'MODE: LIVE WEBCAM';
          } else {
            alert('Could not start live webcam. Operating in high-precision simulated gesture mode.');
          }
        }
      });
    }

    // Microphone Toggle (Intercom)
    if (this.btnToggleMic) {
      this.btnToggleMic.addEventListener('click', () => {
        const isLive = this.audioBridge.toggleMicrophone();
        if (isLive) {
          this.btnToggleMic.classList.add('btn-danger');
          this.btnToggleMic.innerHTML = '<span>🛑</span> Stop Mic';
          if (this.micStatusText) this.micStatusText.textContent = 'INTERCOM LIVE (Listening...)';
        } else {
          this.btnToggleMic.classList.remove('btn-danger');
          this.btnToggleMic.innerHTML = '<span>🎙️</span> Talk to Patient';
          if (this.micStatusText) this.micStatusText.textContent = 'Intercom Ready';
        }
      });
    }

    // Paramedic Quick-Question Preset Chips
    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const questionText = e.target.dataset.question;
        if (questionText) {
          if (this.patientCaptionEl) {
            this.patientCaptionEl.innerHTML = `<span style="color:#38BDF8;">[PARAMEDIC ASKS]:</span><br>"${questionText}"`;
          }
          this.audioBridge.vocalize(questionText, 'green');
        }
      });
    });

    // Touch Fallback Emergency Grid
    document.querySelectorAll('.grid-sign-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gestureKey = btn.dataset.gesture;
        if (gestureKey) {
          this.triggerGesture(gestureKey, true);
        }
      });
    });

    // Export Triage Handover Report
    if (this.btnExportReport) {
      this.btnExportReport.addEventListener('click', () => {
        this.triageManager.exportReport();
      });
    }

    // Modals
    const btnOpenAI = document.getElementById('btn-open-ai-modal');
    if (btnOpenAI && this.aiModal) {
      btnOpenAI.addEventListener('click', () => this.aiModal.classList.add('open'));
    }

    const btnOpenRubric = document.getElementById('btn-open-rubric-modal');
    if (btnOpenRubric && this.rubricModal) {
      btnOpenRubric.addEventListener('click', () => this.rubricModal.classList.add('open'));
    }

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
      });
    });

    // Keyboard Shortcuts for Instant Booth Demo
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const keyMap = {
        '1': 'GEST_CHEST_PAIN',
        '2': 'GEST_CHOKING',
        '3': 'GEST_ALLERGY',
        '4': 'GEST_BLEEDING',
        '5': 'GEST_DIZZINESS',
        '6': 'GEST_NEED_HELP',
        '7': 'GEST_YES',
        '8': 'GEST_NO'
      };

      if (keyMap[e.key]) {
        this.triggerGesture(keyMap[e.key], true);
      } else if (e.key === 'c' || e.key === 'C') {
        this.btnToggleCam.click();
      } else if (e.key === 'm' || e.key === 'M') {
        this.btnToggleMic.click();
      } else if (e.key === 'e' || e.key === 'E') {
        this.triageManager.exportReport();
      } else if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
      }
    });
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new VoxGestureApp();
});
