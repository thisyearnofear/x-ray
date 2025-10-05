# 🩻 X-RAI: AI Medical Diagnostic Game

> **FutureStack GenAI Hackathon Submission**  
> World's First Medical X-Ray Game with Voice AI Consultation

An interactive 3D medical visualization tool that combines **face-swapping**, **AI-powered medical analysis**, **real-time X-ray effects**, and **revolutionary voice consultation** for educational healthcare applications.

## 🎙️ **NEW: Voice Medical Consultation**
**Stuck on a diagnosis? Ask the AI doctor!** Pause anytime during gameplay to consult with our Cerebras-powered medical AI. Get contextual guidance, learn diagnostic reasoning, and improve your medical knowledge through natural conversation.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏆 Hackathon Prize Eligibility

### 🦙 Meta Llama Track ($5,000)
- **Advanced Medical Reasoning** with Cerebras LLaMA 3.3 70B
- **Educational Content Generation** for diagnostic learning
- **Context-Aware Consultation** with patient case integration
- **Natural Language Medical Guidance** through voice interaction

### ⚡ Cerebras Track ($5,000)
- **World's Fastest Medical AI** consultation with ultra-fast inference
- **Lightning-Speed Diagnosis** and treatment recommendations
- **Real-Time Voice Consultation** powered by Cerebras chips
- **Optimized Performance** for seamless educational experience

## ✨ Features

### 🎭 **Smart Face Swapping**
- **Face-api.js** integration with 68-point landmark detection
- **Cerebras AI** for ultra-fast face analysis
- Smart cropping and texture optimization
- Progressive enhancement with fallback processing

### 🏥 **AI Medical Analysis**
- Interactive 3D medical condition markers
- **Cerebras-powered** diagnosis and treatment suggestions
- Real anatomical positioning on skeleton model
- Educational symptom and treatment information

### 🎙️ **Voice Medical Consultation** ⭐ NEW!
- **Pause-and-consult** gameplay mechanic
- **Context-aware AI guidance** using current patient case
- **Cerebras LLaMA 3.3 70B** for advanced medical reasoning
- **Educational voice interaction** for diagnostic learning

### 🎮 **Immersive X-Ray Experience**
- Real-time WebGL shaders and post-processing effects
- Interactive mouse-controlled X-ray scanning
- Expandable view with smooth animations
- Personalized medical imaging with user's face

## 🚀 Technology Stack

**Frontend**: Next.js 15, TypeScript, Three.js, WebGL, GLSL Shaders  
**AI/ML**: Cerebras LLaMA 3.3 70B, face-api.js, Voice Consultation System  
**3D Graphics**: Three.js, EffectComposer, UnrealBloomPass  
**Backend**: Next.js API Routes, Medical Workflow Management  
**Voice AI**: Context-aware consultation with game state integration  
**Deployment**: Docker-ready

## 🎯 Core Principles

- ✅ **ENHANCEMENT FIRST**: Extended existing components vs creating new ones
- ✅ **AGGRESSIVE CONSOLIDATION**: Removed redundant systems, consolidated functionality
- ✅ **PREVENT BLOAT**: Minimal dependencies, native `fetch()` over SDK
- ✅ **DRY**: Single source of truth for medical conditions and processing logic
- ✅ **CLEAN**: Clear separation between 3D rendering, AI processing, and UI
- ✅ **MODULAR**: Independent, testable components with explicit dependencies
- ✅ **PERFORMANT**: Progressive loading, efficient texture management, caching
- ✅ **ORGANIZED**: Next.js file-based routing with domain-driven design

## 🎮 User Experience

1. **Upload Face**: Click "Upload Face" → AI processes and applies to 3D model
2. **X-Ray Scan**: Move mouse to control X-ray scanning area
3. **Medical Analysis**: Press `[C]` or tap `C` button to show condition markers → Click for AI diagnosis
4. **🎙️ Voice Consultation**: Click "CONSULT AI" → Game pauses → Get guidance from Cerebras medical AI
5. **Diagnosis Submission**: Select discovered conditions → Submit final diagnosis → Get accuracy score
6. **Expand View**: Press `[E]` for full X-ray expansion effect
7. **Dynamic Markers**: Discovered conditions change appearance (cyan color, larger size) for easy tracking
8. **🎵 Dynamic Audio**: Contextual medical audio generated per session using ElevenLabs AI
9. **🎯 Centered UI**: High-fidelity diagnostic panel with glassmorphic design and real-time updates

## 🧠 AI Integration

### Cerebras Implementation

```typescript
// Secure server-side medical analysis with native fetch
export async function POST(request: NextRequest) {
  const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    headers: { 
      "Authorization": `Bearer ${process.env.CEREBRAS_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b",
      messages: [{ role: "user", content: `Medical consultation: ${context}...` }]
    })
  });
}
```

### Voice Consultation System

```typescript
// Context-aware medical consultation with game state integration
class VoiceConsultationManager {
  async startConsultation(context: ConsultationContext) {
    // Pause game timer and 3D rendering
    this.pauseGameForConsultation()
    
    // Generate medical guidance using Cerebras LLaMA 3.3 70B
    const guidance = await this.generateMedicalGuidance(context)
    
    // Display in premium holographic UI
    this.showConsultationUI(guidance)
  }
  
  private buildMedicalContext(context: ConsultationContext) {
    return `
      Patient: ${context.patientCase.patientName}
      Discovered Conditions: ${Array.from(context.discoveredConditions)}
      Current Progress: ${context.scanProgress}
      Learning Objective: Guide diagnostic reasoning
    `
  }
}
```

## 📁 Project Structure

```
app/
├── api/medical-analysis/    # Secure API routes
├── components/Canvas.tsx    # 3D rendering component
├── layout.tsx              # Root layout
└── page.tsx                # Main page

src/
├── components/             # Three.js components
├── domains/               # Business logic
├── shaders/              # GLSL shaders
└── utils/                # Utilities

docs/                      # Documentation
├── API.md                # API documentation
├── DEPLOYMENT.md         # Deployment guide
└── STRUCTURE.md          # Architecture details

public/                   # Static assets
```

## 🔧 Development

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture Details](./docs/STRUCTURE.md)

## 🚀 Performance

- **Bundle Size**: 104kB first load (including voice consultation)
- **Build Time**: ~1.1s
- **3D Rendering**: 60fps maintained during consultation
- **Cerebras API**: <200ms medical AI response
- **Voice Consultation**: Seamless pause/resume with state preservation
- **Memory Usage**: Optimized with lazy loading and cleanup

## 🏆 FutureStack GenAI Hackathon Demo

### 🎯 **Hackathon Highlights**

**Revolutionary Medical Education Tool:**
- World's first medical X-ray game with voice AI consultation
- Pause-and-consult gameplay mechanic for enhanced learning
- Context-aware medical guidance powered by Cerebras LLaMA 3.3 70B

**Technical Excellence:**
- **Cerebras Track**: Ultra-fast medical AI consultation with world's fastest inference
- **Meta Llama Track**: Advanced medical reasoning and educational content generation
- **Performance**: <200ms AI response times with seamless game state management

### 🎮 **Demo Flow**

1. **Start Game**: Upload your face → Begin X-ray diagnostic session
2. **Discover Conditions**: Scan the 3D model → Find medical conditions
3. **🎙️ Voice Consultation**: Click "CONSULT AI" → Game pauses → Get Cerebras-powered guidance
4. **Submit Diagnosis**: Select conditions → Submit final diagnosis → Get accuracy score
5. **Educational Impact**: Learn diagnostic reasoning through AI interaction

### 🚀 **Try It Live**

```bash
npm install
npm run dev
# Open http://localhost:3000
# Click "Upload Face" → "Begin Training Protocol" → Discover conditions → "CONSULT AI"
```

**Demo Tip**: After discovering your first condition, click the "🎙️ CONSULT AI" button to experience our revolutionary voice consultation feature!
