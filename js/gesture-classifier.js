/**
 * VoxGesture: Temporal Medical Gesture Classifier & Hysteresis Engine
 * Applies geometric rules and temporal sliding-window smoothing to classify
 * emergency sign language into Manchester Triage System (MTS) codes.
 */

export const GESTURE_DICTIONARY = {
  GEST_CHEST_PAIN: {
    id: 'GEST_CHEST_PAIN',
    name: 'Chest Pain / Cardiac Alert',
    icon: '❤️‍🔥',
    severity: 'red',
    mtsCode: 'MTS-RED-01',
    spokenDispatch: 'Alert: Patient indicates severe acute chest pain. Potential cardiac event.',
    patientCaption: 'I HAVE SEVERE CHEST PAIN',
    checklist: ['Administer 12-lead ECG', 'Check Aspirin / Nitro history', 'Prepare Defibrillator', 'Vital signs q5min']
  },

  GEST_CHOKING: {
    id: 'GEST_CHOKING',
    name: 'Airway Distress / Choking',
    icon: '🚨',
    severity: 'red',
    mtsCode: 'MTS-RED-02',
    spokenDispatch: 'Emergency: Patient signals severe airway obstruction or inability to breathe.',
    patientCaption: 'I CANNOT BREATHE / CHOKING',
    checklist: ['Inspect upper airway', 'High-flow O2 therapy', 'Prepare suction', 'Assess stridor / wheeze']
  },

  GEST_ALLERGY: {
    id: 'GEST_ALLERGY',
    name: 'Severe Allergy / Anaphylaxis',
    icon: '💉',
    severity: 'red',
    mtsCode: 'MTS-RED-03',
    spokenDispatch: 'Critical: Patient signals acute allergic reaction requiring epinephrine.',
    patientCaption: 'SEVERE ALLERGY / NEED EPIPEN',
    checklist: ['Administer Epinephrine IM', 'Check facial / tongue swelling', 'IV access', 'Nebulized Albuterol']
  },

  GEST_BLEEDING: {
    id: 'GEST_BLEEDING',
    name: 'Severe Bleeding / Trauma',
    icon: '🩸',
    severity: 'yellow',
    mtsCode: 'MTS-YEL-05',
    spokenDispatch: 'Urgent: Patient indicates active traumatic bleeding or wound.',
    patientCaption: 'I AM BLEEDING / NEED DRESSING',
    checklist: ['Apply direct pressure', 'Assess hemorrhage site', 'Check perfusion / pulses', 'Prepare hemostatic gauze']
  },

  GEST_DIZZINESS: {
    id: 'GEST_DIZZINESS',
    name: 'Dizziness / Neurological Deficit',
    icon: '💫',
    severity: 'yellow',
    mtsCode: 'MTS-YEL-08',
    spokenDispatch: 'Urgent: Patient reports acute dizziness, vertigo, or head trauma disorientation.',
    patientCaption: 'DIZZY / FAINTING / HEAD INJURY',
    checklist: ['Blood glucose fingerstick', 'C-spine precaution if trauma', 'Check pupil symmetry', 'Supine positioning']
  },

  GEST_NEED_HELP: {
    id: 'GEST_NEED_HELP',
    name: 'General Acute Distress',
    icon: '⚠️',
    severity: 'yellow',
    mtsCode: 'MTS-YEL-12',
    spokenDispatch: 'Attention: Patient requests immediate medical assistance.',
    patientCaption: 'I NEED IMMEDIATE HELP',
    checklist: ['Immediate bedside assessment', 'Obtain initial vitals', 'Establish communication', 'Assign triage nurse']
  },

  GEST_YES: {
    id: 'GEST_YES',
    name: 'Affirmative / Yes',
    icon: '✅',
    severity: 'green',
    mtsCode: 'MTS-CONFIRM-YES',
    spokenDispatch: 'Patient confirmed: Yes.',
    patientCaption: 'YES',
    checklist: ['Document positive confirmation in electronic chart']
  },

  GEST_NO: {
    id: 'GEST_NO',
    name: 'Negative / No',
    icon: '❌',
    severity: 'blue',
    mtsCode: 'MTS-CONFIRM-NO',
    spokenDispatch: 'Patient responded: No.',
    patientCaption: 'NO',
    checklist: ['Document negative finding in electronic chart']
  }
};

export class GestureClassifier {
  constructor(options = {}) {
    this.confidenceThreshold = options.threshold || 0.82;
    this.historyWindowSize = 12; // Frames for temporal debounce
    this.gestureHistory = [];
    this.lastTriggeredGesture = null;
    this.lastTriggerTime = 0;
    this.debounceMs = 1200; // Prevent spamming identical dispatch calls
  }

  /**
   * Evaluates normalized skeletal frame data and outputs classified medical gesture
   */
  classify(frameData) {
    if (!frameData || !frameData.normalized || !frameData.fingerStates) {
      return null;
    }

    const { normalized, fingerStates, origin } = frameData;
    let candidate = null;
    let confidence = 0;

    const allClosed = !fingerStates.index && !fingerStates.middle && !fingerStates.ring && !fingerStates.pinky;
    const allOpen = fingerStates.index && fingerStates.middle && fingerStates.ring && fingerStates.pinky;
    const wristY = origin.y;
    const wristX = origin.x;

    // 1. Airway / Choking (Hand clutched at throat)
    if (wristY <= 0.38) {
      if (fingerStates.index && !fingerStates.middle) {
        candidate = 'GEST_DIZZINESS';
        confidence = 0.94;
      } else {
        candidate = 'GEST_CHOKING';
        confidence = 0.96;
      }
    }
    // 2. Chest Pain (Fist on sternum, mid-chest level)
    else if (allClosed && wristY >= 0.45 && wristY <= 0.75 && wristX >= 0.35 && wristX <= 0.65) {
      candidate = 'GEST_CHEST_PAIN';
      confidence = 0.97;
    }
    // 3. Bleeding / Trauma (Flat open hand pressed to body)
    else if (allOpen && wristY >= 0.45) {
      candidate = 'GEST_BLEEDING';
      confidence = 0.93;
    }
    // 4. Affirmative / Yes
    else if (allClosed && wristY > 0.75) {
      candidate = 'GEST_YES';
      confidence = 0.91;
    }
    // 5. Negative / No
    else if (fingerStates.index && fingerStates.middle && !fingerStates.ring && !fingerStates.pinky) {
      candidate = 'GEST_NO';
      confidence = 0.92;
    }
    // 6. Severe Allergy / EpiPen (Pinching fingers at arm)
    else {
      // Check distance between thumb tip (4) and index tip (8)
      const pinchDist = Math.hypot(normalized[4].x - normalized[8].x, normalized[4].y - normalized[8].y);
      if (pinchDist < 0.22) {
        candidate = 'GEST_ALLERGY';
        confidence = 0.95;
      } else if (allOpen) {
        candidate = 'GEST_NEED_HELP';
        confidence = 0.89;
      }
    }

    // Temporal Filter: Update sliding buffer
    if (candidate && confidence >= this.confidenceThreshold) {
      this.gestureHistory.push(candidate);
      if (this.gestureHistory.length > this.historyWindowSize) {
        this.gestureHistory.shift();
      }
    } else {
      this.gestureHistory.shift();
    }

    // Determine consensus gesture
    const consensus = this.getConsensusGesture();
    const now = performance.now();

    if (consensus && GESTURE_DICTIONARY[consensus]) {
      const isNewGesture = (consensus !== this.lastTriggeredGesture) || (now - this.lastTriggerTime > this.debounceMs);
      if (isNewGesture) {
        this.lastTriggeredGesture = consensus;
        this.lastTriggerTime = now;
        return {
          gesture: GESTURE_DICTIONARY[consensus],
          confidence: Math.round(confidence * 100),
          isNewTrigger: true
        };
      }
      return {
        gesture: GESTURE_DICTIONARY[consensus],
        confidence: Math.round(confidence * 100),
        isNewTrigger: false
      };
    }

    return null;
  }

  getConsensusGesture() {
    if (this.gestureHistory.length < 5) return null;
    const counts = {};
    this.gestureHistory.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
    let maxG = null;
    let maxCount = 0;
    for (const [g, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxG = g;
      }
    }
    return (maxCount >= Math.floor(this.gestureHistory.length * 0.6)) ? maxG : null;
  }
}
