/**
 * VoxGesture: Manchester Triage System (MTS) Manager & Dispatch Logger
 * Tracks triage severity states, clinical action checklists, and exports hospital handover records.
 */

export class TriageManager {
  constructor(options = {}) {
    this.container = options.cardContainer;
    this.logContainer = options.logContainer;
    this.events = [];
    this.currentSeverity = 'green';
  }

  updateTriage(gestureData, confidence = 95) {
    if (!gestureData) return;

    this.currentSeverity = gestureData.severity;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Log event
    const eventItem = {
      timestamp: timeStr,
      id: gestureData.id,
      name: gestureData.name,
      severity: gestureData.severity,
      mtsCode: gestureData.mtsCode,
      confidence: confidence,
      dispatch: gestureData.spokenDispatch
    };
    this.events.unshift(eventItem);
    if (this.events.length > 50) this.events.pop();

    this.renderActiveCard(gestureData, timeStr, confidence);
    this.renderLog();
  }

  renderActiveCard(data, timeStr, confidence) {
    if (!this.container) return;

    this.container.className = `active-triage-card severity-${data.severity}`;

    const checklistHTML = data.checklist.map(item => `
      <div class="checklist-item">
        <span style="color:var(--triage-${data.severity});">▶</span> ${item}
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="triage-card-header">
        <span class="triage-badge" style="color:var(--triage-${data.severity}); border: 1px solid var(--triage-${data.severity});">
          ${data.mtsCode} • ${data.severity.toUpperCase()} PRIORITY
        </span>
        <span class="triage-timestamp">${timeStr} | ${confidence}% Conf.</span>
      </div>

      <div class="triage-symptom-title">
        <span>${data.icon}</span> ${data.name}
      </div>

      <div class="triage-action-text">
        <strong>Vocalized Dispatch:</strong> "${data.spokenDispatch}"
      </div>

      <div class="clinical-checklist">
        ${checklistHTML}
      </div>
    `;
  }

  renderLog() {
    if (!this.logContainer) return;

    if (this.events.length === 0) {
      this.logContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.75rem; padding:0.5rem;">No triage events recorded yet.</div>';
      return;
    }

    this.logContainer.innerHTML = this.events.slice(0, 10).map(evt => `
      <div class="event-row">
        <div>
          <span style="color:var(--triage-${evt.severity}); font-weight:700;">[${evt.mtsCode}]</span>
          <span style="color:var(--text-primary); margin-left:4px;">${evt.name}</span>
        </div>
        <div style="font-family:'JetBrains Mono', monospace; color:var(--text-muted); font-size:0.7rem;">
          ${evt.timestamp} (${evt.confidence}%)
        </div>
      </div>
    `).join('');
  }

  exportReport() {
    if (this.events.length === 0) {
      alert('No triage records to export.');
      return;
    }

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `VoxGesture_Hospital_Handover_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
