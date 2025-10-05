/**
 * Patient Chat Panel
 * Bottom-right panel for patient data and AI consultation
 * 
 * CORE PRINCIPLES:
 * - ENHANCEMENT FIRST: Enhances existing VoiceConsultationManager
 * - CLEAN: Separate from diagnostic panel
 * - MODULAR: Independent component
 * - DRY: Uses design tokens
 */

import { colors, spacing, typography, borders, effects, animation, zIndex } from '../../styles/design-tokens'
import { VoiceConsultationManager } from '../voice/VoiceConsultationManager'

export class PatientChatPanel {
    private panel: HTMLElement | null = null
    private isMinimized: boolean = false
    private voiceConsultation: VoiceConsultationManager
    private chatMessages: Array<{ role: 'user' | 'ai' | 'system'; content: string; timestamp: Date }> = []

    constructor(voiceConsultation: VoiceConsultationManager) {
        this.voiceConsultation = voiceConsultation
        this.setupEventListeners()
    }

    private setupEventListeners() {
        // Listen for consultation events
        this.voiceConsultation.on('guidanceReceived', (data: { guidance: string }) => {
            this.addMessage('ai', data.guidance)
        })
    }

    show(patientCase?: any) {
        if (this.panel) return

        this.createPanel(patientCase)
    }

    private createPanel(patientCase?: any) {
        this.panel = document.createElement('div')
        this.panel.className = 'patient-chat-panel'
        this.panel.style.cssText = `
            position: fixed;
            bottom: ${spacing.xl};
            right: ${spacing.xl};
            width: 380px;
            max-height: 600px;
            background: ${colors.background.gradient.panel};
            border: ${borders.width.base} solid ${colors.accent.base};
            border-radius: ${borders.radius.xl};
            box-shadow: ${effects.shadow.lg}, ${effects.shadow.accentGlow};
            backdrop-filter: ${effects.blur.lg};
            z-index: ${zIndex.modal};
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideInFromRight ${animation.duration.slow} ${animation.easing.smooth};
        `

        this.panel.innerHTML = `
            <div class="panel-header" style="padding: ${spacing.base}; border-bottom: ${borders.width.thin} solid ${colors.border.accent}; display: flex; justify-content: space-between; align-items: center; background: ${colors.background.accentGlow}; cursor: pointer;">
                <div>
                    <div style="color: ${colors.accent.base}; font-size: ${typography.fontSize.lg}; font-weight: ${typography.fontWeight.bold}; text-shadow: ${effects.textShadow.accent};">👤 Patient Data</div>
                    <div style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.xs}; opacity: 0.8;">AI-Generated Case</div>
                </div>
                <button id="minimize-btn" style="background: none; border: none; color: ${colors.accent.base}; font-size: ${typography.fontSize.xl}; cursor: pointer; padding: ${spacing.sm}; border-radius: ${borders.radius.full}; transition: all ${animation.duration.fast} ${animation.easing.smooth};">
                    ▼
                </button>
            </div>

            <div class="panel-content" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <!-- Patient Info Section -->
                <div id="patient-info" style="padding: ${spacing.base}; border-bottom: ${borders.width.thin} solid ${colors.border.accent}; background: ${colors.background.primaryGlow};">
                    ${this.renderPatientInfo(patientCase)}
                </div>

                <!-- Chat Messages -->
                <div id="chat-messages" style="flex: 1; padding: ${spacing.base}; overflow-y: auto; display: flex; flex-direction: column; gap: ${spacing.sm};">
                    <div style="text-align: center; padding: ${spacing.xl}; color: ${colors.neutral.base}; font-size: ${typography.fontSize.sm};">
                        🎙️ Start a consultation to chat with AI
                    </div>
                </div>

                <!-- Chat Input -->
                <div id="chat-input-container" style="padding: ${spacing.base}; border-top: ${borders.width.thin} solid ${colors.border.accent}; background: ${colors.background.accentGlow};">
                    <button id="start-consultation-btn" style="
                        width: 100%;
                        background: linear-gradient(135deg, ${colors.accent.base} 0%, ${colors.accent.dark} 100%);
                        color: ${colors.neutral.black};
                        border: none;
                        padding: ${spacing.md};
                        border-radius: ${borders.radius.md};
                        font-weight: ${typography.fontWeight.bold};
                        font-size: ${typography.fontSize.md};
                        cursor: pointer;
                        transition: all ${animation.duration.base} ${animation.easing.smooth};
                        box-shadow: ${effects.shadow.base}, ${effects.shadow.accentGlow};
                    ">
                        🎙️ Start AI Consultation
                    </button>
                    
                    <!-- Text input for questions (hidden until consultation starts) -->
                    <div id="chat-input-form" style="display: none; margin-top: ${spacing.sm};">
                        <div style="display: flex; gap: ${spacing.sm};">
                            <input 
                                type="text" 
                                id="question-input" 
                                placeholder="Ask the AI specialist..."
                                style="
                                    flex: 1;
                                    background: ${colors.background.primaryGlow};
                                    border: ${borders.width.thin} solid ${colors.border.accent};
                                    border-radius: ${borders.radius.md};
                                    padding: ${spacing.sm} ${spacing.md};
                                    color: ${colors.neutral.white};
                                    font-size: ${typography.fontSize.sm};
                                "
                            />
                            <button 
                                id="send-question-btn"
                                style="
                                    background: linear-gradient(135deg, ${colors.accent.base} 0%, ${colors.accent.dark} 100%);
                                    color: ${colors.neutral.black};
                                    border: none;
                                    padding: ${spacing.sm} ${spacing.md};
                                    border-radius: ${borders.radius.md};
                                    font-weight: ${typography.fontWeight.bold};
                                    cursor: pointer;
                                "
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `

        document.body.appendChild(this.panel)

        // Add event listeners
        this.setupPanelListeners()

        // Add animations CSS if not present
        this.addAnimations()
    }

    private renderPatientInfo(patientCase?: any): string {
        if (!patientCase) {
            return `
                <div style="text-align: center; padding: ${spacing.md}; color: ${colors.neutral.base};">
                    <div style="font-size: ${typography.fontSize['2xl']}; margin-bottom: ${spacing.sm};">⏳</div>
                    <div style="font-size: ${typography.fontSize.sm};">Waiting for patient case...</div>
                </div>
            `
        }

        return `
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.white}; line-height: ${typography.lineHeight.relaxed};">
                <div style="margin-bottom: ${spacing.sm};">
                    <div style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 4px;">Name:</div>
                    <div>${patientCase.patientName || 'Unknown'}</div>
                </div>
                <div style="margin-bottom: ${spacing.sm};">
                    <div style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 4px;">Age / Gender:</div>
                    <div>${patientCase.age || 'N/A'} / ${patientCase.gender || 'N/A'}</div>
                </div>
                <div style="margin-bottom: ${spacing.sm};">
                    <div style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 4px;">Chief Complaint:</div>
                    <div style="color: ${colors.primary.light};">${patientCase.chiefComplaint || 'N/A'}</div>
                </div>
                <div>
                    <div style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 4px;">History:</div>
                    <div style="font-size: ${typography.fontSize.xs}; opacity: 0.9; line-height: 1.4;">${(patientCase.historyOfPresentIllness || patientCase.aiDescription || 'No history available').substring(0, 150)}...</div>
                </div>
            </div>
        `
    }

    private setupPanelListeners() {
        if (!this.panel) return

        // Minimize/maximize button
        const minimizeBtn = this.panel.querySelector('#minimize-btn') as HTMLElement
        const header = this.panel.querySelector('.panel-header') as HTMLElement

        if (minimizeBtn && header) {
            header.addEventListener('click', () => this.toggleMinimize())
        }

        // Start consultation button
        const startBtn = this.panel.querySelector('#start-consultation-btn') as HTMLElement
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startConsultation())
        }

        // Send question button and enter key
        const sendBtn = this.panel.querySelector('#send-question-btn') as HTMLElement
        const questionInput = this.panel.querySelector('#question-input') as HTMLInputElement

        if (sendBtn && questionInput) {
            sendBtn.addEventListener('click', () => this.sendQuestion())
            questionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendQuestion()
                }
            })
        }
    }

    private toggleMinimize() {
        if (!this.panel) return

        this.isMinimized = !this.isMinimized
        const content = this.panel.querySelector('.panel-content') as HTMLElement
        const minimizeBtn = this.panel.querySelector('#minimize-btn') as HTMLElement

        if (content && minimizeBtn) {
            if (this.isMinimized) {
                content.style.display = 'none'
                minimizeBtn.textContent = '▲'
                this.panel.style.maxHeight = 'auto'
            } else {
                content.style.display = 'flex'
                minimizeBtn.textContent = '▼'
                this.panel.style.maxHeight = '600px'
            }
        }
    }

    private async startConsultation() {
        console.log('🎙️ Starting consultation from patient panel...')

        // Hide start button, show input form
        const startBtn = this.panel?.querySelector('#start-consultation-btn') as HTMLElement
        const inputForm = this.panel?.querySelector('#chat-input-form') as HTMLElement

        if (startBtn && inputForm) {
            startBtn.style.display = 'none'
            inputForm.style.display = 'block'
        }

        // Clear welcome message and add system message
        this.chatMessages = []
        this.addMessage('system', 'AI Medical Specialist connected. Ask me anything about this case.')

        // Get initial AI greeting with patient context
        await this.getAIResponse('Introduce yourself as an AI medical specialist and ask how you can help with this patient case. Be brief and professional.')
    }

    private async sendQuestion() {
        const questionInput = this.panel?.querySelector('#question-input') as HTMLInputElement
        if (!questionInput || !questionInput.value.trim()) return

        const question = questionInput.value.trim()
        questionInput.value = ''

        // Add user message
        this.addMessage('user', question)

        // Get AI response
        await this.getAIResponse(question)
    }

    private async getAIResponse(userMessage: string) {
        try {
            // Add typing indicator
            const typingId = this.addTypingIndicator()

            // Call Cerebras API
            const response = await fetch('/api/medical-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: this.buildConsultationContext()
                })
            })

            if (!response.ok) {
                throw new Error('AI consultation failed')
            }

            const data = await response.json()

            // Remove typing indicator
            this.removeTypingIndicator(typingId)

            // Add AI response
            if (data.analysis) {
                this.addMessage('ai', data.analysis)
            }

        } catch (error) {
            console.error('AI consultation error:', error)
            this.addMessage('system', 'Connection to AI specialist temporarily unavailable. Please try again.')
        }
    }

    private buildConsultationContext(): any {
        // Get patient info from panel
        const patientInfo = this.panel?.querySelector('#patient-info')?.textContent || ''

        return {
            patientInfo,
            chatHistory: this.chatMessages.map(m => ({
                role: m.role,
                content: m.content
            })),
            timestamp: new Date().toISOString()
        }
    }

    private addTypingIndicator(): string {
        const typingId = 'typing-' + Date.now()
        const message = {
            role: 'ai' as const,
            content: '<span class="typing-indicator">●●●</span>',
            timestamp: new Date()
        }

        this.chatMessages.push(message)
        this.renderMessages()

        return typingId
    }

    private removeTypingIndicator(typingId: string) {
        // Remove last message (typing indicator)
        if (this.chatMessages.length > 0 &&
            this.chatMessages[this.chatMessages.length - 1].content.includes('typing-indicator')) {
            this.chatMessages.pop()
        }
    }

    private addMessage(role: 'user' | 'ai' | 'system', content: string) {
        const message = {
            role,
            content,
            timestamp: new Date()
        }

        this.chatMessages.push(message)
        this.renderMessages()
    }

    private renderMessages() {
        const messagesContainer = this.panel?.querySelector('#chat-messages') as HTMLElement
        if (!messagesContainer) return

        messagesContainer.innerHTML = this.chatMessages.map(msg => {
            const isAI = msg.role === 'ai'
            const isSystem = msg.role === 'system'

            return `
                <div style="
                    background: ${isAI ? colors.background.accentGlow : isSystem ? colors.background.primaryGlow : colors.background.gradient.panel};
                    padding: ${spacing.sm};
                    border-radius: ${borders.radius.md};
                    border: ${borders.width.thin} solid ${isAI ? colors.border.accent : isSystem ? colors.border.primary : colors.border.neutral};
                    animation: messageSlideIn ${animation.duration.base} ${animation.easing.smooth};
                ">
                    <div style="display: flex; align-items: center; gap: ${spacing.xs}; margin-bottom: 4px;">
                        <span style="font-size: ${typography.fontSize.sm};">${isAI ? '🤖' : isSystem ? '⚕️' : '👨‍⚕️'}</span>
                        <span style="color: ${isAI ? colors.accent.base : isSystem ? colors.primary.base : colors.neutral.light}; font-size: ${typography.fontSize.xs}; font-weight: ${typography.fontWeight.bold};">
                            ${isAI ? 'AI Specialist' : isSystem ? 'System' : 'You'}
                        </span>
                    </div>
                    <div style="color: ${colors.neutral.white}; font-size: ${typography.fontSize.sm}; line-height: ${typography.lineHeight.relaxed};">
                        ${msg.content}
                    </div>
                </div>
            `
        }).join('')

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight
    }

    updatePatientInfo(patientCase: any) {
        const patientInfoContainer = this.panel?.querySelector('#patient-info') as HTMLElement
        if (patientInfoContainer) {
            patientInfoContainer.innerHTML = this.renderPatientInfo(patientCase)
        }
    }

    private addAnimations() {
        if (document.querySelector('#patient-chat-animations')) return

        const style = document.createElement('style')
        style.id = 'patient-chat-animations'
        style.textContent = `
            @keyframes slideInFromRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes messageSlideIn {
                from {
                    transform: translateY(10px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @media (max-width: 768px) {
                .patient-chat-panel {
                    bottom: 1rem !important;
                    right: 1rem !important;
                    left: 1rem !important;
                    width: auto !important;
                    max-height: 400px !important;
                }
            }
        `
        document.head.appendChild(style)
    }

    hide() {
        if (this.panel && this.panel.parentNode) {
            this.panel.style.animation = `slideInFromRight ${animation.duration.base} ${animation.easing.smooth} reverse`
            setTimeout(() => {
                if (this.panel && this.panel.parentNode) {
                    this.panel.parentNode.removeChild(this.panel)
                }
                this.panel = null
            }, 300)
        }
    }

    destroy() {
        this.hide()
        this.chatMessages = []
    }
}
