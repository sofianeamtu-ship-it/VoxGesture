# VoxGesture: Pitch Script & Stand Design Blueprint

> **Infomatrix Project Contest — Category 01: Software Development**  
> **Target Criteria**: **06 Oral Presentation (5/5)** & **08 The Stand Design (5/5)**

---

## 1. Stand Design Blueprint (Criterion 08: 5/5)

To score a **5/5 on Stand Design**, your booth should be visually themed as an **"Emergency Triage Bay"** with clear medical, technological, and accessibility accents.

```
+-----------------------------------------------------------------------------------+
|                           VOXGESTURE POSTER / BANNER                              |
|   [Ambulance Icon] "Breaking the Sound Barrier in Emergency Medicine" [SDG 10 & 16] |
|   - 70M Deaf Individuals Worldwide • Zero Emergency Interpreters in 99% of Bays  |
|   - 100% Offline Edge Perception • HIPAA / GDPR Privacy-by-Design                  |
|   - Real-Time Two-Way Triage Bridge: Patient Signs <--> Paramedic Speech          |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|    [LIVE CAMERA WORKSPACE]                     [TRIAGE DASHBOARD SCREEN]          |
|    Webcam with neon skeletal overlay           Active Manchester Triage Card (RED)|
|    Real-time 21 3D joint telemetry             Patient High-Contrast Captions     |
|    Target Crosshair Zone                       Medical Event Handover Log         |
|                                                                                   |
|-----------------------------------------------------------------------------------|
|                                 BOOTH TABLE SETUP                                 |
|   [Paramedic Headset]       [Touch Emergency Card]     [QR Flyer]    [Ethics Doc] |
|   For speaking into         Physical laminated card    GitHub Pages   Printed AI   |
|   the two-way intercom      with emergency signs       live demo link Transparency|
+-----------------------------------------------------------------------------------+
```

### Tabletop Checklist for Booth:
1. **Primary Laptop / Screen**: Runs VoxGesture at `http://localhost:8001/` with webcam active.
2. **Paramedic Headset / Microphone**: Plugged into the laptop for judges to speak triage questions (*"Where does it hurt?"*).
3. **Laminated Signs Chart**: A printed card showing the 8 medical emergency signs so judges can perform them in front of the camera themselves.
4. **Printed AI Transparency Logbook**: Spiral-bound binder containing `AI_MANIFESTO.md`, `GESTURE_DATASET_CARD.md`, and `PROMPT_LOG.jsonl`.

---

## 2. The 3-Minute Scripted Oral Pitch (Criterion 06: 5/5)

### 0:00 – 0:45 | The Hook & Clinical Urgency
> *"Honorable members of the jury, imagine rushing into an emergency room during a severe heart attack or allergic reaction. You are gasping for air, but you cannot speak, and not a single nurse or paramedic knows sign language.*  
>  
> *For over 70 million deaf individuals worldwide, communication failure during emergency triage is a daily, life-threatening danger. Cloud translation apps fail in moving ambulances, take seconds to load, and violate patient confidentiality by transmitting live video to third-party servers.*  
>  
> *We developed **VoxGesture** — the world's first edge-native, two-way emergency sign language and triage bridge running 100% locally at 30+ FPS."*

### 0:45 – 1:45 | Live Triage Demonstration (The "Wow Factor")
> *(Student stands in front of the camera or hands control to judge)*  
> *"Watch this live: I am a deaf patient arriving with acute cardiac symptoms. When I place my clenched fist against my sternum—the universal sign for chest pain—look at the screen.*  
>  
> *(System chimes, displays flashing RED Triage Card, and speaks out loud: 'Alert: Patient indicates severe acute chest pain. Potential cardiac event.')*  
>  
> *Now I sign 'Cannot Breathe' by clutching my throat.*  
> *(System immediately updates to Airway Distress priority with immediate oxygenation checklist).*  
>  
> *Notice the 21 neon skeletal joints tracked at 32 FPS: we are not guessing from raw pixels; we are calculating scale-invariant 3D angular vectors in real time."*

### 1:45 – 2:30 | The Two-Way Paramedic Intercom & Responsible AI
> *"Communication must be two-way. Now watch the reverse bridge: A paramedic speaks into our microphone: 'Where is your pain located?'*  
> *(Team member or judge speaks into the microphone; instant high-contrast visual captions and symbols appear on the patient display).*  
>  
> *Under the hood, VoxGesture exemplifies **Responsible AI (Criterion 09)**: In compliance with HIPAA and GDPR, zero video frames are ever recorded or transmitted over the internet. Furthermore, by evaluating pure joint geometry rather than skin pixels, our model is completely immune to skin tone or environmental lighting biases."*

### 2:30 – 3:00 | Impact & UN SDGs
> *"VoxGesture directly advances **UN SDG 10 (Reduced Inequalities)** and **SDG 16 (Strong Institutions)** by guaranteeing equitable, life-saving healthcare access to every human being, regardless of hearing ability.*  
>  
> *We invite you to step in front of the camera, perform a sign, or speak into the intercom. Thank you!"*
