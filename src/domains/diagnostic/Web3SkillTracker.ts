// MODULAR: Web3 integration for persistent skill tracking and achievements
export interface SkillProfile {
    walletAddress?: string
    totalScore: number
    sessionsCompleted: number
    specializationsUnlocked: string[]
    techniquesMastered: string[]
    achievementsEarned: string[]
    learningStreak: number
    averageAccuracy: number
    totalStudyTime: number
    nftRewards?: NFTReward[]
    createdAt: number
    lastActive: number
}

export interface NFTReward {
    tokenId: string
    name: string
    description: string
    imageUrl: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    achievement: string
    mintedAt: number
}

export interface SkillMilestone {
    id: string
    name: string
    description: string
    threshold: number
    type: 'score' | 'accuracy' | 'streak' | 'specialization'
    nftReward?: {
        name: string
        description: string
        imageUrl: string
    }
}

export class Web3SkillTracker {
    private skillProfile: SkillProfile
    private isWeb3Available: boolean = false
    private callbacks: Map<string, Function[]> = new Map()

    constructor() {
        this.skillProfile = this.loadOrCreateProfile()
        this.checkWeb3Availability()
    }

    private loadOrCreateProfile(): SkillProfile {
        try {
            const stored = localStorage.getItem('xrai_skill_profile')
            if (stored) {
                return JSON.parse(stored)
            }
        } catch (error) {
            console.warn('Failed to load skill profile:', error)
        }

        return {
            totalScore: 0,
            sessionsCompleted: 0,
            specializationsUnlocked: ['general_radiology'],
            techniquesMastered: ['basic_scan'],
            achievementsEarned: [],
            learningStreak: 0,
            averageAccuracy: 0,
            totalStudyTime: 0,
            createdAt: Date.now(),
            lastActive: Date.now()
        }
    }

    private async checkWeb3Availability() {
        // Check if Web3 wallet is available (MetaMask, etc.)
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
                const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
                this.isWeb3Available = accounts.length > 0

                if (this.isWeb3Available && accounts[0]) {
                    this.skillProfile.walletAddress = accounts[0]
                    this.emit('web3Connected', { walletAddress: accounts[0] })
                }
            } catch (error) {
                console.warn('Web3 connection check failed:', error)
            }
        }
    }

    // MODULAR: Persistent skill tracking
    public updateSkillProfile(sessionData: {
        score: number
        accuracy: number
        duration: number
        achievements: string[]
        techniquesUsed: string[]
        specialization: string
    }) {
        // Update totals
        this.skillProfile.totalScore += sessionData.score
        this.skillProfile.sessionsCompleted++
        this.skillProfile.totalStudyTime += sessionData.duration
        this.skillProfile.lastActive = Date.now()

        // Update averages
        const totalSessions = this.skillProfile.sessionsCompleted
        this.skillProfile.averageAccuracy = (
            (this.skillProfile.averageAccuracy * (totalSessions - 1)) + sessionData.accuracy
        ) / totalSessions

        // Track new achievements
        sessionData.achievements.forEach(achievement => {
            if (!this.skillProfile.achievementsEarned.includes(achievement)) {
                this.skillProfile.achievementsEarned.push(achievement)
            }
        })

        // Track technique mastery
        sessionData.techniquesUsed.forEach(technique => {
            if (!this.skillProfile.techniquesMastered.includes(technique)) {
                this.skillProfile.techniquesMastered.push(technique)
            }
        })

        // Check for milestones and NFT rewards
        this.checkMilestones(sessionData)

        // Persist to localStorage (and Web3 if available)
        this.persistProfile()
    }

    private checkMilestones(sessionData: any) {
        const milestones = this.getSkillMilestones()

        milestones.forEach(milestone => {
            if (this.hasAchievedMilestone(milestone, sessionData)) {
                this.unlockMilestone(milestone)
            }
        })
    }

    private hasAchievedMilestone(milestone: SkillMilestone, sessionData: any): boolean {
        switch (milestone.type) {
            case 'score':
                return this.skillProfile.totalScore >= milestone.threshold
            case 'accuracy':
                return this.skillProfile.averageAccuracy >= (milestone.threshold / 100)
            case 'streak':
                return this.skillProfile.learningStreak >= milestone.threshold
            case 'specialization':
                return this.skillProfile.specializationsUnlocked.length >= milestone.threshold
            default:
                return false
        }
    }

    private unlockMilestone(milestone: SkillMilestone) {
        if (milestone.nftReward) {
            this.mintNFTReward(milestone)
        }

        this.emit('milestoneUnlocked', { milestone })
    }

    private async mintNFTReward(milestone: SkillMilestone) {
        if (!milestone.nftReward || !this.isWeb3Available) return

        try {
            // In a real implementation, this would interact with an NFT smart contract
            const nftReward: NFTReward = {
                tokenId: `nft_${Date.now()}`,
                name: milestone.nftReward.name,
                description: milestone.nftReward.description,
                imageUrl: milestone.nftReward.imageUrl,
                rarity: this.getNFTRarity(milestone.threshold),
                achievement: milestone.id,
                mintedAt: Date.now()
            }

            if (!this.skillProfile.nftRewards) {
                this.skillProfile.nftRewards = []
            }

            this.skillProfile.nftRewards.push(nftReward)
            this.emit('nftMinted', { nftReward })

        } catch (error) {
            console.warn('NFT minting failed:', error)
        }
    }

    private getNFTRarity(threshold: number): 'common' | 'rare' | 'epic' | 'legendary' {
        if (threshold >= 1000) return 'legendary'
        if (threshold >= 500) return 'epic'
        if (threshold >= 200) return 'rare'
        return 'common'
    }

    private getSkillMilestones(): SkillMilestone[] {
        return [
            {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Complete your first diagnostic session',
                threshold: 1,
                type: 'score',
                nftReward: {
                    name: 'Diagnostic Pioneer Badge',
                    description: 'Awarded for completing your first medical diagnostic session',
                    imageUrl: '/nft-badges/pioneer-badge.png'
                }
            },
            {
                id: 'accuracy_expert',
                name: 'Accuracy Expert',
                description: 'Achieve 90% average accuracy',
                threshold: 90,
                type: 'accuracy',
                nftReward: {
                    name: 'Precision Master Badge',
                    description: 'Awarded for achieving exceptional diagnostic accuracy',
                    imageUrl: '/nft-badges/precision-badge.png'
                }
            },
            {
                id: 'cardiology_master',
                name: 'Cardiology Master',
                description: 'Unlock the Cardiology specialization',
                threshold: 1,
                type: 'specialization',
                nftReward: {
                    name: 'Heart Specialist Badge',
                    description: 'Awarded for mastering cardiac diagnostic techniques',
                    imageUrl: '/nft-badges/cardiology-badge.png'
                }
            }
        ]
    }

    // MODULAR: Web3 wallet connection
    public async connectWallet(): Promise<boolean> {
        if (typeof window === 'undefined' || !(window as any).ethereum) {
            console.warn('No Web3 wallet available')
            return false
        }

        try {
            const accounts = await (window as any).ethereum.request({
                method: 'eth_requestAccounts'
            })

            if (accounts.length > 0) {
                this.skillProfile.walletAddress = accounts[0]
                this.isWeb3Available = true
                this.persistProfile()
                this.emit('walletConnected', { walletAddress: accounts[0] })
                return true
            }
        } catch (error) {
            console.warn('Wallet connection failed:', error)
        }

        return false
    }

    public async disconnectWallet() {
        this.skillProfile.walletAddress = undefined
        this.isWeb3Available = false
        this.persistProfile()
        this.emit('walletDisconnected')
    }

    private persistProfile() {
        try {
            localStorage.setItem('xrai_skill_profile', JSON.stringify(this.skillProfile))
        } catch (error) {
            console.warn('Failed to persist skill profile:', error)
        }
    }

    // MODULAR: Analytics and insights
    public getSkillAnalytics() {
        const totalSessions = this.skillProfile.sessionsCompleted
        const avgSessionTime = totalSessions > 0 ? this.skillProfile.totalStudyTime / totalSessions : 0

        return {
            profile: this.skillProfile,
            statistics: {
                totalSessions,
                averageSessionTime: Math.round(avgSessionTime / 1000), // Convert to seconds
                skillGrowth: this.calculateSkillGrowth(),
                nftCollectionValue: this.calculateNFTCollectionValue(),
                rank: this.calculateGlobalRank()
            },
            recentAchievements: this.skillProfile.achievementsEarned.slice(-5),
            upcomingMilestones: this.getUpcomingMilestones()
        }
    }

    private calculateSkillGrowth(): number {
        // Calculate skill growth rate based on recent performance
        // This would typically compare recent sessions vs older sessions
        return 0.15 // Placeholder - would implement proper calculation
    }

    private calculateNFTCollectionValue(): number {
        if (!this.skillProfile.nftRewards) return 0

        const rarityValues = { 'common': 1, 'rare': 5, 'epic': 20, 'legendary': 100 }
        return this.skillProfile.nftRewards.reduce((total, nft) => {
            return total + (rarityValues[nft.rarity] || 1)
        }, 0)
    }

    private calculateGlobalRank(): number {
        // Placeholder for global ranking system
        // In production, this would query a backend service
        return Math.floor(Math.random() * 10000) + 1
    }

    private getUpcomingMilestones(): SkillMilestone[] {
        const milestones = this.getSkillMilestones()
        return milestones.filter(milestone => !this.hasAchievedMilestone(milestone, this.skillProfile))
    }

    // Public API
    public getSkillProfile(): SkillProfile {
        return { ...this.skillProfile }
    }

    public isWalletConnected(): boolean {
        return this.isWeb3Available && !!this.skillProfile.walletAddress
    }

    public getWalletAddress(): string | undefined {
        return this.skillProfile.walletAddress
    }

    public exportSkillData() {
        return {
            profile: this.skillProfile,
            analytics: this.getSkillAnalytics(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        }
    }

    public on(event: string, callback: Function) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, [])
        }
        this.callbacks.get(event)!.push(callback)
    }

    private emit(event: string, data?: any) {
        const callbacks = this.callbacks.get(event) || []
        callbacks.forEach(callback => callback(data))
    }
}