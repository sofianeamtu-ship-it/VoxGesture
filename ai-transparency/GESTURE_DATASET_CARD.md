# VoxGesture — Emergency Sign Dataset Card & Landmark Topology

> **Dataset / Vocabulary Specification**: Medical Triage Emergency Signs (MTES-9)  
> **Target Standard**: Manchester Triage System (MTS) & Emergency Severity Index (ESI)  
> **Topology**: 21 3D Skeletal Hand Landmarks (MediaPipe Spec)

---

## 1. 21-Landmark Skeletal Graph Definition

```
        8 (Index Tip)    12 (Middle Tip)   16 (Ring Tip)   20 (Pinky Tip)
        |                |                 |               |
        7 (Index DIP)    11 (Middle DIP)   15 (Ring DIP)   19 (Pinky DIP)
        |                |                 |               |
        6 (Index PIP)    10 (Middle PIP)   14 (Ring PIP)   18 (Pinky PIP)
        |                |                 |               |
   4    5 (Index MCP)----9 (Middle MCP)---13 (Ring MCP)---17 (Pinky MCP)
  (Tip)                  \       |        /
    |                     \      |       /
   3 (Thumb IP)            \     |      /
    |                       \    |     /
   2 (Thumb MCP)             \   |    /
    \                         \  |   /
     1 (Thumb CMC)------------ 0 (Wrist Origin)
```

---

## 2. Mathematical Normalization Formula

To render the system invariant to camera distance, patient height, and optical zoom:

1. **Origin Translation**:
   $$\vec{P}_i = L_i - L_0, \quad i \in [0, 20]$$
2. **Scale Invariance Factor ($S$)**:
   $$S = \|\vec{P}_9 - \vec{P}_0\|_2 = \sqrt{(x_9 - x_0)^2 + (y_9 - y_0)^2 + (z_9 - z_0)^2}$$
   $$\vec{P}'_i = \frac{\vec{P}_i}{S}$$
3. **Phalanx Flexion State Function**:
   $$\text{Extended}(F) = \begin{cases} 1 & \text{if } \|\vec{P}'_{\text{tip}} - \vec{P}'_0\|_2 > 1.25 \cdot \|\vec{P}'_{\text{pip}} - \vec{P}'_0\|_2 \\ 0 & \text{otherwise} \end{cases}$$

---

## 3. Emergency Gesture Vocabulary & Triage Codes

| Gesture ID | Sign Name | Anatomical Feature Signature | Triage Severity | Manchester Code |
| :--- | :--- | :--- | :--- | :--- |
| `GEST_CHEST_PAIN` | **Chest Pain / Cardiac** | Clenched fist ($\text{All } \text{Extended}=0$), localized over chest zone ($y_{\text{wrist}} \in [0.4, 0.75]$), high micro-tremor. | 🚨 **RED** | Red 01: Cardiac Arrest / Angina |
| `GEST_CHOKING` | **Cannot Breathe / Airway** | Grasping hand positioned at throat / neck ($y_{\text{wrist}} \le 0.35$). | 🚨 **RED** | Red 02: Inadequate Airway / Stridor |
| `GEST_ALLERGY` | **Severe Allergy / Anaphylaxis** | Rapid pinching gesture ($\|\vec{P}'_4 - \vec{P}'_8\|_2 < 0.15$) directed toward lateral thigh/arm (EpiPen injection imitation). | 🚨 **RED** | Red 03: Acute Anaphylaxis |
| `GEST_BLEEDING` | **Severe Bleeding** | Flat open hand ($\text{All } \text{Extended}=1$) pressed firmly against contralateral arm/torso with rhythmic pulse. | ⚠️ **YELLOW** | Yellow 05: Uncontrolled Hemorrhage |
| `GEST_DIZZINESS` | **Dizziness / Concussion** | Index extended ($\text{Ext}_1=1, \text{Ext}_{2\dots4}=0$), circular trajectory ($r \in [20, 60]\text{px}$) near cranial region ($y \le 0.3$). | ⚠️ **YELLOW** | Yellow 08: Acute Neurological Deficit |
| `GEST_NEED_HELP` | **Urgent Distress Wave** | Open palm waving rapidly ($v_x > 350\text{ px/s}$, frequency $2\text{–}4\text{ Hz}$). | ⚠️ **YELLOW** | Yellow 12: General Acute Distress |
| `GEST_YES` | **Affirmative / Yes** | Clenched fist with periodic downward angular nod ($v_y > 150\text{ px/s}$). | ℹ️ **INFO** | N/A: Clinical Confirmation |
| `GEST_NO` | **Negative / No** | Index + Middle extended snapping against Thumb, or rapid horizontal palm shake. | ℹ️ **INFO** | N/A: Clinical Negation |
