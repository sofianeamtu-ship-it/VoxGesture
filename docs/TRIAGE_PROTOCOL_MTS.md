# VoxGesture: Clinical Emergency Triage Protocol (MTS Integration)

> **Infomatrix Software Development Category (Category 01)**  
> **Clinical Standard**: Manchester Triage System (MTS) & Emergency Severity Index (ESI)  
> **Target Criterion**: **07 Documentation (5/5)**

---

## 1. Clinical Context & Triage Prioritization

In emergency medicine, triage is the formal process of rapidly categorizing patients based on the acuity of their clinical presentation to ensure that life-threatening conditions receive immediate intervention.

The **Manchester Triage System (MTS)** is the gold standard utilized across emergency departments in Europe and internationally, defining 5 discrete priority levels:

| Priority Level | MTS Color Code | Maximum Target Response Time | VoxGesture Emergency Sign Alignment |
| :---: | :---: | :---: | :--- |
| **1** | 🚨 **RED (Immediate / Resuscitation)** | **0 Minutes** (Immediate life threat) | `GEST_CHEST_PAIN`, `GEST_CHOKING`, `GEST_ALLERGY` |
| **2** | ⚠️ **ORANGE / YELLOW (Very Urgent)** | **10 Minutes** (Potential life/limb threat) | `GEST_BLEEDING`, `GEST_DIZZINESS`, `GEST_NEED_HELP` |
| **3** | 🟢 **GREEN (Urgent / Standard)** | **60 Minutes** (Stable condition) | Positive confirmations / routine history |
| **4** | 🔵 **BLUE (Non-Urgent)** | **120 Minutes** (Minor acute symptoms) | Negations / administrative questions |

---

## 2. Decision Tree & Triage Action Protocols

```mermaid
flowchart TD
    A["Patient Sign Input Detected"] --> B{"Airway or Cardiac Threat?"}
    B -- Yes --> C["Assign RED PRIORITY (MTS-01/02)"]
    C --> C1["Sound High-Frequency Audio Chime"]
    C1 --> C2["Vocalize Emergency Paramedic Dispatch"]
    C2 --> C3["Display Immediate Action Checklist (ECG, O2, Epi)"]

    B -- No --> D{"Active Bleeding or Trauma?"}
    D -- Yes --> E["Assign YELLOW PRIORITY (MTS-05)"]
    E --> E1["Sound Alert Chime"]
    E1 --> E2["Display Direct Pressure Checklist"]

    D -- No --> F["Assign GREEN / INFORMATIONAL State"]
    F --> F1["Log in Medical Handover Chart"]
```

---

## 3. Hospital Handover Record Specification

When an ambulance transports a patient to the emergency room, verbal and electronic handover must be seamless. VoxGesture compiles an auditable JSON and printable medical handover record containing:
- Initial symptom detection timestamp (exact down to seconds).
- MTS priority code and continuous confidence rating.
- Paramedic questions asked and confirmed patient responses.
- Timeline of vital symptom progression.
