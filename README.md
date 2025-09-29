# 🩻 X-RAI: AI Medical Diagnostic Game

> **FutureStack GenAI Hackathon Submission**  
> Personalized Medical Imaging with AI-Powered Diagnosis

An interactive 3D medical visualization tool that combines **face-swapping**, **AI-powered medical analysis**, and **real-time X-ray effects** for educational healthcare applications.

## 🏆 Hackathon Prize Eligibility

### 🦙 Meta Llama Track ($5,000)

- **Cerebras Llama models** for medical condition analysis
- Real-time AI diagnosis and treatment recommendations
- Educational medical content generation

### ⚡ Cerebras Track ($5,000)

- **Ultra-fast face processing** with Cerebras inference
- Lightning-speed AI analysis on world's fastest AI chip
- Optimized performance for real-time interactions

### 🐳 Docker Track ($5,000)

- Containerized deployment ready
- Scalable microservices architecture
- Production-ready Docker configuration

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

### 🎮 **Immersive X-Ray Experience**

- Real-time WebGL shaders and post-processing effects
- Interactive mouse-controlled X-ray scanning
- Expandable view with smooth animations
- Personalized medical imaging with user's face

## 🚀 Technology Stack

**Frontend**: TypeScript, Three.js, WebGL, GLSL Shaders  
**AI/ML**: Cerebras Llama Models, face-api.js  
**3D Graphics**: Three.js, EffectComposer, UnrealBloomPass  
**Build**: Vite, Node.js  
**Deployment**: Docker-ready

## 🎯 Core Principles Followed

- ✅ **ENHANCEMENT FIRST**: Extended existing components vs creating new ones
- ✅ **AGGRESSIVE CONSOLIDATION**: Single LeePerry class handles face processing
- ✅ **PREVENT BLOAT**: Removed redundant systems, consolidated functionality
- ✅ **DRY**: Single source of truth for medical conditions and processing logic
- ✅ **CLEAN**: Clear separation between 3D rendering, AI processing, and UI
- ✅ **MODULAR**: Independent, testable components with explicit dependencies
- ✅ **PERFORMANT**: Progressive loading, efficient texture management, caching

## 🎮 User Experience

1. **Upload Face**: Click "Upload Face" → AI processes and applies to 3D model
2. **X-Ray Scan**: Move mouse to control X-ray scanning area
3. **Medical Analysis**: Press `[C]` to show condition markers → Click for AI diagnosis
4. **Expand View**: Press `[E]` for full X-ray expansion effect

## 🧠 AI Integration Details

### Cerebras Implementation

```typescript
// Real-time medical analysis with streaming responses
const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
  model: "llama-4-scout-17b-16e-instruct",
  messages: [
    {
      role: "user",
      content: `Analyze ${condition.name} for medical education...`,
    },
  ],
  stream: true,
  reasoning_effort: "medium",
});
```

### Enhanced Cerebras Features

```typescript
// Structured JSON outputs with confidence scoring
const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
  model: "llama-4-scout-17b-16e-instruct",
  messages: [{ role: "user", content: "Analyze this case..." }],
  response_format: {
    type: "json_schema",
    json_schema: DIAGNOSTIC_ANALYSIS_SCHEMA,
  },
});

// Tool use for medical calculations
const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
  model: "llama-4-scout-17b-16e-instruct",
  messages: [{ role: "user", content: "Calculate CHADS2 score..." }],
  tools: [medical_calculation_tools],
});
```

## 🏥 Educational Impact

- **Medical Students**: Interactive anatomy learning with personalized visualization
- **Healthcare Training**: Safe environment to explore medical conditions
- **Public Health**: Accessible medical education through gamification
- **Research**: Platform for medical AI model development and testing

## 🔮 Future Enhancements

- **Multi-modal AI**: Integration with additional medical imaging modalities
- **Collaborative Learning**: Multi-user shared X-ray sessions
- **AR/VR Support**: Extended reality medical education
- **Real Medical Data**: Integration with anonymized medical datasets

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Set environment variables:

```bash
export VITE_CEREBRAS_API_KEY="your-cerebras-key"
```

---

**Built for FutureStack GenAI Hackathon 2024**  
_X-RAI: Combining cutting-edge AI with immersive 3D graphics for next-generation medical education_
