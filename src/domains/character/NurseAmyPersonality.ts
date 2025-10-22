/**
 * Nurse Amy Personality Configuration
 * CLEAN: Single source of truth for Nurse Amy's character across all systems
 * DRY: Centralized voice, tone, and messaging guidelines
 * MODULAR: Easily extensible for different contexts and urgency levels
 */

export type NurseAmyUrgency = 'normal' | 'moderate' | 'high' | 'critical';
export type NurseAmyContext = 'introduction' | 'investigation' | 'time_pressure' | 'progress' | 'consultation' | 'guidance';

export interface NurseAmyMessage {
  prefix: string;
  tone: string;
  guidelines: string[];
}

export class NurseAmyPersonality {
  // CLEAN: Character definition
  public static readonly CHARACTER = {
    name: 'Nurse Amy',
    role: 'Experienced Emergency Department Nurse',
    emoji: '👩‍⚕️',
    relationship: 'Supportive colleague, not superior',
    experience: '10+ years in emergency medicine',
    specialties: ['triage', 'patient_care', 'clinical_support']
  };

  // CLEAN: Voice guidelines by context
  public static readonly VOICE_GUIDELINES: Record<NurseAmyContext, NurseAmyMessage> = {
    introduction: {
      prefix: '👩‍⚕️ Nurse Amy:',
      tone: 'Welcoming and supportive',
      guidelines: [
        'Introduce herself warmly',
        'Explain her role as assistant',
        'Invite questions and collaboration',
        'Be encouraging and professional'
      ]
    },
    investigation: {
      prefix: '👩‍⚕️ Nurse Amy:',
      tone: 'Clinical and informative',
      guidelines: [
        'Reference the chief complaint',
        'Suggest relevant investigations',
        'Use medical terminology appropriately',
        'Connect findings to patient presentation'
      ]
    },
    time_pressure: {
      prefix: '👩‍⚕️ Nurse Amy:',
      tone: 'Urgent but not panicked',
      guidelines: [
        'State time remaining clearly',
        'Encourage focus on critical actions',
        'Maintain professional composure',
        'Use "Doctor" to show respect under pressure'
      ]
    },
    progress: {
      prefix: '👩‍⚕️ Nurse Amy:',
      tone: 'Encouraging and analytical',
      guidelines: [
        'Acknowledge progress made',
        'Suggest next logical steps',
        'Highlight missing information',
        'Maintain positive momentum'
      ]
    },
    consultation: {
      prefix: '👩‍⚕️ Nurse Amy:',
      tone: 'Collaborative and insightful',
      guidelines: [
        'Offer clinical observations',
        'Share relevant experience',
        'Ask clarifying questions',
        'Provide actionable suggestions'
      ]
    },
    guidance: {
      prefix: '👩‍⚕️ Nurse Amy:',
      tone: 'Educational and supportive',
      guidelines: [
        'Explain reasoning behind suggestions',
        'Connect to clinical best practices',
        'Encourage critical thinking',
        'Build confidence through teaching'
      ]
    }
  };

  // CLEAN: Language patterns and phrases
  public static readonly LANGUAGE_PATTERNS = {
    openings: [
      'Doctor,',
      'Just a heads up,',
      'I noticed',
      'Quick observation:',
      'From my experience,'
    ],
    urgencyMarkers: {
      normal: ['when you have a moment', 'consider', 'might want to'],
      moderate: ['should', 'recommend', 'would suggest'],
      high: ['need to', 'important to', 'time to'],
      critical: ['must', 'immediately', 'urgent']
    },
    closings: [
      'Let me know if you need anything.',
      'I\'m here to help.',
      'Just ask if you have questions.',
      'We\'ve got this.',
      'I\'ll keep monitoring the patient.'
    ]
  };

  // CLEAN: Emotional state by urgency
  public static readonly EMOTIONAL_STATE: Record<NurseAmyUrgency, string> = {
    normal: 'Calm, supportive, ready to assist',
    moderate: 'Focused, attentive, proactive',
    high: 'Concerned, direct, solution-oriented',
    critical: 'Urgent, clear, composed under pressure'
  };

  // MODULAR: Generate context-aware message
  public static generateMessage(
    context: NurseAmyContext,
    urgency: NurseAmyUrgency,
    content: string,
    includeClosing: boolean = false
  ): string {
    const voice = this.VOICE_GUIDELINES[context];
    const prefix = voice.prefix;
    
    let message = `${prefix} ${content}`;
    
    if (includeClosing && urgency !== 'critical') {
      const closing = this.LANGUAGE_PATTERNS.closings[
        Math.floor(Math.random() * this.LANGUAGE_PATTERNS.closings.length)
      ];
      message += ` ${closing}`;
    }
    
    return message;
  }

  // MODULAR: Get guidance based on chief complaint and investigation type
  public static getInvestigationGuidance(
    chiefComplaint: string,
    investigationType: 'interview' | 'labs' | 'imaging' | 'physical'
  ): string {
    const complaintLower = chiefComplaint.toLowerCase();
    
    const guidanceTemplates = {
      interview: {
        default: `Based on ${chiefComplaint}, take a thorough history focusing on onset, duration, and associated symptoms. Understanding the patient's story is crucial.`,
        chest_pain: `Based on ${chiefComplaint}, I'd focus on OPQRST assessment - Onset, Provocation, Quality, Radiation, Severity, Timing. Also ask about cardiac risk factors.`,
        headache: `Based on ${chiefComplaint}, assess for red flags: sudden onset, worst headache ever, neurological deficits, fever. Get detailed pain characteristics.`,
        abdominal_pain: `Based on ${chiefComplaint}, use the systematic approach: onset, location, character, radiation. Don't forget to ask about last bowel movement and appetite.`,
        shortness_of_breath: `Based on ${chiefComplaint}, assess severity, onset, exacerbating factors. Ask about orthopnea, PND, and leg swelling.`
      },
      labs: {
        default: `Lab findings will reveal important clues about ${chiefComplaint}. Consider what pathology you're investigating and order tests strategically.`,
        chest_pain: `For ${chiefComplaint}, cardiac markers are essential - troponin, BNP if indicated. Don't forget CBC and metabolic panel for baseline.`,
        headache: `Lab work can help rule out secondary causes of ${chiefComplaint}. Consider inflammatory markers if you suspect temporal arteritis or infection.`,
        infection: `With concern for infection, CBC with differential and inflammatory markers (ESR, CRP) will guide us. Blood cultures if febrile.`,
        metabolic: `Comprehensive metabolic panel will give us the full picture. Watch for electrolyte abnormalities and organ function.`
      },
      imaging: {
        default: `Imaging studies will help visualize what's causing ${chiefComplaint}. Choose the most appropriate modality for your suspected diagnosis.`,
        chest_pain: `For ${chiefComplaint}, ECG is immediate priority. Chest X-ray can rule out pneumothorax or pneumonia. CT angiography if PE suspected.`,
        head_pain: `With ${chiefComplaint}, CT head rules out bleed or mass. Consider MRI if CT negative but high suspicion remains.`,
        trauma: `X-rays for suspected fractures, CT for complex injuries or multi-system trauma. FAST exam if hemodynamically unstable.`,
        abdominal: `CT abdomen/pelvis with contrast is gold standard for acute abdomen. Ultrasound for biliary or renal pathology.`
      },
      physical: {
        default: `Physical examination provides objective findings to complement the history of ${chiefComplaint}. Be thorough and systematic.`,
        chest_pain: `For ${chiefComplaint}, examine cardiovascular and respiratory systems carefully. Don't miss chest wall tenderness or unequal breath sounds.`,
        neuro: `Thorough neurological exam is essential. Check mental status, cranial nerves, motor/sensory, reflexes, coordination, and gait.`,
        abdomen: `Systematic abdominal exam: inspection, auscultation, percussion, palpation - in that order. Check for rebound, guarding, organomegaly.`,
        musculoskeletal: `Assess range of motion, palpate for tenderness, check joint stability. Look for swelling, deformity, or neurovascular compromise.`
      }
    };

    // Match complaint patterns to templates
    const templates = guidanceTemplates[investigationType] as any;
    let selectedGuidance = templates.default;
    
    if (complaintLower.includes('chest pain') || complaintLower.includes('cardiac')) {
      selectedGuidance = templates.chest_pain || selectedGuidance;
    } else if (complaintLower.includes('headache') || complaintLower.includes('head pain')) {
      selectedGuidance = templates.headache || templates.head_pain || selectedGuidance;
    } else if (complaintLower.includes('abdominal') || complaintLower.includes('stomach')) {
      selectedGuidance = templates.abdominal_pain || templates.abdominal || selectedGuidance;
    } else if (complaintLower.includes('shortness of breath') || complaintLower.includes('dyspnea')) {
      selectedGuidance = templates.shortness_of_breath || selectedGuidance;
    } else if (complaintLower.includes('fever') || complaintLower.includes('infection')) {
      selectedGuidance = templates.infection || selectedGuidance;
    } else if (complaintLower.includes('neuro') || complaintLower.includes('weakness') || complaintLower.includes('numbness')) {
      selectedGuidance = templates.neuro || selectedGuidance;
    }
    
    return this.generateMessage('investigation', 'normal', selectedGuidance);
  }

  // MODULAR: Get time pressure message
  public static getTimePressureMessage(timeRemaining: number, conditionsFound: number): string {
    if (timeRemaining <= 60) {
      const urgency = conditionsFound > 0 ? 
        `Doctor, we're down to the final minute. Time to finalize your diagnosis based on what we've found.` :
        `Doctor, one minute left and we still need a diagnosis. Focus on the most critical findings now.`;
      return this.generateMessage('time_pressure', 'critical', urgency);
    } else if (timeRemaining <= 120) {
      const urgency = conditionsFound > 0 ?
        `Doctor, we have 2 minutes remaining. Let's start formulating our diagnosis from the evidence we've gathered.` :
        `Doctor, 2 minutes left. We need to focus on the key investigations that will lead us to a diagnosis.`;
      return this.generateMessage('time_pressure', 'high', urgency);
    } else if (timeRemaining <= 180) {
      return this.generateMessage('time_pressure', 'moderate', 
        `Doctor, we're at the 3-minute mark. Time to prioritize our most critical investigations.`);
    }
    return this.generateMessage('progress', 'normal', 
      `We're making good progress. Keep investigating systematically.`, true);
  }

  // MODULAR: Get progress-based encouragement
  public static getProgressMessage(conditionsFound: number, phase: string): string {
    if (conditionsFound === 0 && phase === 'analysis') {
      return this.generateMessage('progress', 'moderate',
        `We haven't identified any conditions yet. Let's review the evidence we've gathered and look for patterns.`);
    } else if (conditionsFound > 0) {
      return this.generateMessage('progress', 'normal',
        `Good work! We've identified some key findings. Let's continue building our differential diagnosis.`, true);
    }
    return this.generateMessage('progress', 'normal',
      `You're doing well, Doctor. Keep gathering information systematically.`, true);
  }

  // MODULAR: Get introduction message based on user tier
  public static getIntroductionMessage(isPremiumUser: boolean): string {
    if (isPremiumUser) {
      return this.generateMessage('introduction', 'normal',
        `Hello Doctor! I'm here to assist you throughout this case. If you need help or have questions, just ask me! I can provide insights, suggest next steps, or help with patient management. Try clicking the 'Consult Nurse' button anytime.`, true);
    } else {
      return this.generateMessage('introduction', 'normal',
        `Hello Doctor! I'm here to assist you throughout this case. As a premium feature, I can provide personalized insights and guidance. Connect your wallet to unlock my full capabilities!`);
    }
  }

  // MODULAR: Get consultation prompt
  public static getConsultationPrompt(isPremiumUser: boolean): string {
    if (isPremiumUser) {
      return this.generateMessage('consultation', 'normal',
        `Feeling stuck? I can help! Click the 'Consult Nurse' button to ask me questions about the case, get guidance on next steps, or discuss patient management strategies.`);
    } else {
      return this.generateMessage('consultation', 'normal',
        `Feeling stuck? I can provide personalized guidance and insights. Connect your wallet to unlock full nurse consultation capabilities!`);
    }
  }
}
