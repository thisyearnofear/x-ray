import * as THREE from 'three';
import gsap from 'gsap';

// 🏥 Anatomically Accurate Positioning System
export interface AnatomicalAttachment {
  boneName: 'skull' | 'cervical_vertebra' | 'mandible' | 'temporomandibular_joint';
  landmark: string;
  relativeOffset: THREE.Vector3;
  surfaceNormal?: THREE.Vector3;
}

export interface AnatomicalMarkerConfig {
  attachmentPoint: AnatomicalAttachment;
  conditionSpecificOffset?: THREE.Vector3;
  landmarkBased: boolean;
  anatomicalRegion: string;
}

export interface MedicalMarkerOptions {
  position?: THREE.Vector3; // Legacy support - will be calculated from anatomical config
  anatomicalConfig?: AnatomicalMarkerConfig;
  conditionId: string;
  conditionName: string;
  severity: 'low' | 'medium' | 'high';
  category: 'orthopedic' | 'neurological' | 'cardiovascular';
  discoveryProgress?: number;
  isDiscovered?: boolean;
}

export class MedicalMarker {
  private markerGroup: THREE.Group;
  private indicator: THREE.Mesh;
  private icon: THREE.Mesh | null = null;
  private label: THREE.Mesh | null = null;
  private glow: THREE.Mesh | null = null;
  private conditionId: string;
  private conditionName: string;
  private severity: 'low' | 'medium' | 'high';
  private category: 'orthopedic' | 'neurological' | 'cardiovascular';
  private discoveryProgress: number = 0;
  private isDiscovered: boolean = false;
  private scanAnimation: gsap.core.Tween | null = null;

  // 🏥 Anatomical positioning system
  private anatomicalConfig?: AnatomicalMarkerConfig;
  private anatomicalPosition: THREE.Vector3 = new THREE.Vector3();

  // 🏥 Anatomical landmark system for accurate positioning
  private calculateAnatomicalPosition(): void {
    if (this.anatomicalConfig) {
      // Use anatomically accurate positioning
      this.anatomicalPosition = this.getBoneLandmarkPosition(this.anatomicalConfig.attachmentPoint);

      // Apply condition-specific offset if provided
      if (this.anatomicalConfig.conditionSpecificOffset) {
        this.anatomicalPosition.add(this.anatomicalConfig.conditionSpecificOffset);
      }

      this.markerGroup.position.copy(this.anatomicalPosition);
    } else {
      // Default position if none provided
      this.markerGroup.position.set(0, 0.6, 0.2);
    }
  }

  // 🏥 Get precise bone landmark positions for anatomical accuracy
  private getBoneLandmarkPosition(attachment: AnatomicalAttachment): THREE.Vector3 {
    // This would integrate with the 3D model bone structure
    // For now, using predefined landmark positions based on anatomical knowledge

    const landmarkPositions: Record<string, THREE.Vector3> = {
      // Skull landmarks
      'skull_temporomandibular_joint': new THREE.Vector3(0.3, 0.6, 0.2),
      'skull_cervical_attachment': new THREE.Vector3(0, 0.8, 0.1),
      'skull_temporal_fossa': new THREE.Vector3(0.25, 0.7, 0.15),

      // Cervical vertebrae landmarks
      'cervical_vertebra_c1': new THREE.Vector3(0, 0.9, 0),
      'cervical_vertebra_c2': new THREE.Vector3(0, 0.85, 0),
      'cervical_vertebra_c7': new THREE.Vector3(0, 0.4, 0),

      // Mandible landmarks
      'mandible_condyle': new THREE.Vector3(0.28, 0.62, 0.18),
      'mandible_coronoid': new THREE.Vector3(0.22, 0.68, 0.12),
      'mandible_symphysis': new THREE.Vector3(0, 0.58, 0.25),

      // TMJ specific landmarks
      'temporomandibular_joint_lateral': new THREE.Vector3(0.32, 0.61, 0.19),
      'temporomandibular_joint_medial': new THREE.Vector3(0.28, 0.59, 0.21),
    };

    const positionKey = `${attachment.boneName}_${attachment.landmark}`.toLowerCase();
    const basePosition = landmarkPositions[positionKey] || new THREE.Vector3(0, 0.6, 0.2);

    // Apply relative offset
    return basePosition.clone().add(attachment.relativeOffset);
  }

  // NEW: AR overlay elements
  private arOverlay: THREE.Group | null = null;
  private isHovered: boolean = false;
  private overlayAnimation: gsap.core.Tween | null = null;
  private isAnimating: boolean = false;

  // 🏥 Contextual information display system
  private infoPanel: THREE.Group | null = null;
  private measurementOverlay: THREE.Group | null = null;
  private annotationLabels: THREE.Group | null = null;
  private informationLevel: number = 0; // 0-4 levels of information revelation

  // 🏥 Interactive medical tools
  private measurementTools: Map<string, THREE.Group> = new Map();
  private comparisonViews: THREE.Group | null = null;
  private isMeasurementMode: boolean = false;

  constructor(options: MedicalMarkerOptions) {
    this.conditionId = options.conditionId;
    this.conditionName = options.conditionName;
    this.severity = options.severity;
    this.category = options.category;
    this.discoveryProgress = options.discoveryProgress || 0;
    this.isDiscovered = options.isDiscovered || false;
    this.anatomicalConfig = options.anatomicalConfig;

    this.markerGroup = new THREE.Group();

    // Create the main indicator element
    this.indicator = this.createMainIndicator();
    this.markerGroup.add(this.indicator);

    // 🏥 Calculate anatomically accurate position
    this.calculateAnatomicalPosition();

    // Apply initial styling based on state
    this.updateAppearance();
  }

  private createMainIndicator(): THREE.Mesh {
    // 🏥 Medical-grade visual design based on condition type
    const conditionType = this.getConditionType();
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (conditionType) {
      case 'muscle_strain':
        // Muscle strain: Tension lines with heat map effect
        geometry = this.createMuscleStrainGeometry();
        material = this.createMuscleStrainMaterial();
        break;

      case 'joint_disorder':
        // TMJ/Arthritis: Joint space indicators with movement visualization
        geometry = this.createJointDisorderGeometry();
        material = this.createJointDisorderMaterial();
        break;

      default:
        // Default: Professional medical ring indicator
        geometry = new THREE.RingGeometry(0.05, 0.08, 32);
        material = new THREE.MeshBasicMaterial({
          color: this.getSeverityColor(),
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        });
    }

    const indicator = new THREE.Mesh(geometry, material);

    // 🏥 Medical scanning animation for progressive discovery
    this.addMedicalScanningAnimation(indicator);

    return indicator;
  }

  // 🏥 Condition-specific geometry creation
  private createMuscleStrainGeometry(): THREE.BufferGeometry {
    // Create tension line pattern for muscle strain visualization
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 0.05 + Math.sin(angle * 3) * 0.01; // Wavy tension lines
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }

  private createJointDisorderGeometry(): THREE.BufferGeometry {
    // Create joint space visualization with movement indicators
    const group = new THREE.Group();

    // Main joint indicator
    const mainGeometry = new THREE.RingGeometry(0.04, 0.07, 16);

    // Movement restriction visualization (smaller rings)
    const movementGeometry = new THREE.RingGeometry(0.02, 0.03, 8);

    return mainGeometry;
  }

  // 🏥 Condition-specific materials
  private createMuscleStrainMaterial(): THREE.Material {
    return new THREE.LineBasicMaterial({
      color: this.getHeatMapColor(),
      transparent: true,
      opacity: 0.8
    });
  }

  private createJointDisorderMaterial(): THREE.Material {
    return new THREE.MeshBasicMaterial({
      color: this.getInflammationColor(),
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
  }

  // 🏥 Medical scanning animation for progressive discovery
  private addMedicalScanningAnimation(mesh: THREE.Mesh): void {
    // Subtle pulsing effect simulating medical scanning
    gsap.to(mesh.scale, {
      x: 1.2, y: 1.2, z: 1.2,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Rotation for visibility (medical scanner effect)
    gsap.to(mesh.rotation, {
      z: Math.PI * 2,
      duration: 6,
      repeat: -1,
      ease: "linear"
    });
  }

  // 🏥 Professional medical icon system
  private createMedicalIcon(): THREE.Mesh | null {
    const conditionType = this.getConditionType();
    let geometry: THREE.BufferGeometry;
    let material: THREE.MeshBasicMaterial;

    switch (conditionType) {
      case 'muscle_strain':
        // Muscle fiber pattern icon
        geometry = this.createMuscleFiberIcon();
        material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide
        });
        break;

      case 'joint_disorder':
        // Joint symbol with movement indicator
        geometry = this.createJointIcon();
        material = new THREE.MeshBasicMaterial({
          color: 0x4ECDC4,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide
        });
        break;

      case 'fracture':
        // Fracture line icon (medical cross with break)
        geometry = this.createFractureIcon();
        material = new THREE.MeshBasicMaterial({
          color: 0xFFE66D,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide
        });
        break;

      default:
        // Default medical cross
        geometry = this.createMedicalCrossIcon();
        material = new THREE.MeshBasicMaterial({
          color: 0x00ffaa,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide
        });
    }

    const icon = new THREE.Mesh(geometry, material);
    icon.position.z = 0.01;
    return icon;
  }

  private createMuscleFiberIcon(): THREE.BufferGeometry {
    // Create stylized muscle fiber pattern
    const points = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI;
      const radius = 0.02;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.3,
        0
      ));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }

  private createJointIcon(): THREE.BufferGeometry {
    // Create joint space visualization
    return new THREE.RingGeometry(0.015, 0.025, 8);
  }

  private createFractureIcon(): THREE.BufferGeometry {
    // Create medical cross with fracture line
    const group = new THREE.Group();

    // Horizontal bar
    const hGeometry = new THREE.PlaneGeometry(0.03, 0.01);
    const vGeometry = new THREE.PlaneGeometry(0.01, 0.03);

    return new THREE.BufferGeometry(); // Simplified for now
  }

  private createMedicalCrossIcon(): THREE.BufferGeometry {
    // Standard medical cross
    return new THREE.BufferGeometry(); // Placeholder
  }

  // 🏥 Diagnostic confirmation glow effect
  private createDiagnosticGlow(): THREE.Mesh | null {
    const geometry = new THREE.RingGeometry(0.06, 0.12, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const glow = new THREE.Mesh(geometry, material);
    glow.position.z = -0.02;

    // Add pulsing diagnostic confirmation effect
    gsap.to(material, {
      opacity: 0.6,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return glow;
  }

  private createGlowEffect(): THREE.Mesh {
    const geometry = new THREE.RingGeometry(0.04, 0.1, 32);
    const material = new THREE.MeshBasicMaterial({
      color: this.getSeverityColor(),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const glow = new THREE.Mesh(geometry, material);
    glow.position.z = -0.01; // Behind the main indicator

    return glow;
  }

  // 🏥 Enhanced AR overlay with contextual medical information
  private createAROverlay(): THREE.Group {
    const overlayGroup = new THREE.Group();

    // 🏥 Progressive information revelation based on discovery level
    this.createInformationPanel(overlayGroup);
    this.createMeasurementOverlay(overlayGroup);
    this.createMedicalAnnotations(overlayGroup);

    // Initially hide the overlay
    overlayGroup.visible = false;

    return overlayGroup;
  }

  // 🏥 Level 1: Basic anatomical region highlighting
  private createInformationPanel(overlayGroup: THREE.Group): void {
    const baseGeometry = new THREE.RingGeometry(0.12, 0.15, 16);
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: this.getSeverityColor(),
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      wireframe: true
    });

    const infoBase = new THREE.Mesh(baseGeometry, baseMaterial);
    infoBase.position.set(0, 0.2, 0);
    infoBase.rotation.x = -Math.PI / 2;
    overlayGroup.add(infoBase);

    // Store reference for progressive updates
    this.infoPanel = new THREE.Group();
    this.infoPanel.add(infoBase);
    overlayGroup.add(this.infoPanel);
  }

  // 🏥 Level 2: Condition type indication
  private createMeasurementOverlay(overlayGroup: THREE.Group): void {
    this.measurementOverlay = new THREE.Group();

    // Add measurement indicators based on condition type
    if (this.getConditionType() === 'joint_disorder') {
      this.createJointMeasurementIndicators();
    } else if (this.getConditionType() === 'muscle_strain') {
      this.createMuscleTensionIndicators();
    }

    overlayGroup.add(this.measurementOverlay);
  }

  // 🏥 Level 3: Severity assessment and measurements
  private createMedicalAnnotations(overlayGroup: THREE.Group): void {
    this.annotationLabels = new THREE.Group();

    // Add medical terminology and severity indicators
    this.createSeverityAnnotation();
    this.createConditionAnnotation();

    overlayGroup.add(this.annotationLabels);
  }

  // 🏥 Joint space measurement for TMJ/arthritis
  private createJointMeasurementIndicators(): void {
    if (!this.measurementOverlay) return;

    // Create joint space measurement lines
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.05, 0.25, 0),
      new THREE.Vector3(0.05, 0.25, 0)
    ]);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4ECDC4,
      transparent: true,
      opacity: 0.6
    });

    const measurementLine = new THREE.Line(lineGeometry, lineMaterial);
    this.measurementOverlay.add(measurementLine);

    // Add measurement text (would be enhanced with text rendering)
    this.createMeasurementLabel('Joint Space: 3.2mm', new THREE.Vector3(0, 0.28, 0));
  }

  // 🏥 Muscle tension indicators for strain
  private createMuscleTensionIndicators(): void {
    if (!this.measurementOverlay) return;

    // Create heat map visualization
    for (let i = 0; i < 5; i++) {
      const heatGeometry = new THREE.SphereGeometry(0.01, 8, 6);
      const heatMaterial = new THREE.MeshBasicMaterial({
        color: this.getHeatMapColor(),
        transparent: true,
        opacity: 0.4 - (i * 0.08)
      });

      const heatPoint = new THREE.Mesh(heatGeometry, heatMaterial);
      heatPoint.position.set(
        (Math.random() - 0.5) * 0.1,
        0.25 + Math.random() * 0.05,
        (Math.random() - 0.5) * 0.1
      );

      this.measurementOverlay.add(heatPoint);
    }
  }

  // 🏥 Medical annotations with professional terminology
  private createSeverityAnnotation(): void {
    if (!this.annotationLabels) return;

    const severityText = this.getSeverityText();
    // In a full implementation, this would use text rendering
    // For now, creating visual severity indicators
    this.createSeverityVisualIndicator(severityText);
  }

  private createConditionAnnotation(): void {
    if (!this.annotationLabels) return;

    // Create condition-specific annotations
    const conditionType = this.getConditionType();
    switch (conditionType) {
      case 'joint_disorder':
        this.createJointAnnotation();
        break;
      case 'muscle_strain':
        this.createMuscleAnnotation();
        break;
    }
  }

  private createJointAnnotation(): void {
    // TMJ-specific annotations
    this.createMeasurementLabel('TMJ Dysfunction', new THREE.Vector3(0, 0.32, 0));
    this.createMeasurementLabel('Limited ROM: 25mm', new THREE.Vector3(0, 0.29, 0));
  }

  private createMuscleAnnotation(): void {
    // Muscle strain annotations
    this.createMeasurementLabel('Muscle Tension', new THREE.Vector3(0, 0.32, 0));
    this.createMeasurementLabel('Inflammation Grade: II', new THREE.Vector3(0, 0.29, 0));
  }

  // 🏥 Create measurement label visualization
  private createMeasurementLabel(text: string, position: THREE.Vector3): THREE.Mesh | null {
    // Create a simple text indicator (would be enhanced with proper text rendering)
    const labelGeometry = new THREE.PlaneGeometry(0.08, 0.02);
    const labelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.copy(position);

    if (this.annotationLabels) {
      this.annotationLabels.add(label);
      return label;
    }

    return null;
  }

  private createSeverityVisualIndicator(severity: string): void {
    const colors = { low: 0x4CAF50, medium: 0xFF9800, high: 0xF44336 };
    const color = colors[this.severity as keyof typeof colors] || 0x2196F3;

    const indicatorGeometry = new THREE.CircleGeometry(0.015, 8);
    const indicatorMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.7
    });

    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.set(-0.08, 0.32, 0);
    this.annotationLabels?.add(indicator);
  }

  private getSeverityText(): string {
    const texts = { low: 'Mild', medium: 'Moderate', high: 'Severe' };
    return texts[this.severity as keyof typeof texts] || 'Unknown';
  }

  // NEW: Create accessibility symbol for color-blind users
  private createAccessibilitySymbol(): THREE.Mesh | null {
    // Create different shapes based on severity for accessibility
    let geometry: THREE.BufferGeometry;

    switch (this.severity) {
      case 'low': // Circle for low severity
        geometry = new THREE.CircleGeometry(0.02, 8);
        break;
      case 'medium': // Triangle for medium severity
        // Create a triangle manually using BufferGeometry
        const vertices = new Float32Array([
          0, 0.03, 0,    // Top vertex
          -0.02, -0.015, 0,  // Bottom left vertex
          0.02, -0.015, 0   // Bottom right vertex
        ]);

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        break;
      case 'high': // Square for high severity
        geometry = new THREE.BoxGeometry(0.02, 0.02, 0.001);
        break;
      default:
        geometry = new THREE.SphereGeometry(0.02, 8, 6);
    }

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff, // White for high contrast
      transparent: true,
      opacity: 0.9
    });

    const symbol = new THREE.Mesh(geometry, material);

    // Rotate to face the camera (though this is handled at render time)
    symbol.rotation.x = -Math.PI / 2;

    return symbol;
  }

  // NEW: Show AR overlay when hovering (with delay to prevent flickering)
  private hoverTimeout: number | null = null;

  public showAROverlay(): void {
    if (!this.isDiscovered) return; // Only show on discovered conditions

    // Clear any existing timeout to prevent flickering
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    // Add a slight delay before showing the overlay to prevent flickering
    this.hoverTimeout = window.setTimeout(() => {
      if (!this.arOverlay) {
        this.arOverlay = this.createAROverlay();
        this.markerGroup.add(this.arOverlay);
      }

      this.isHovered = true;

      // Animate the overlay appearance
      if (this.arOverlay) {
        this.arOverlay.visible = true;

        // Reset scale before animation
        this.arOverlay.scale.set(0.2, 0.2, 0.2);

        // Animate scale
        if (this.overlayAnimation) {
          this.overlayAnimation.kill();
        }

        this.overlayAnimation = gsap.to(this.arOverlay.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.4, // Slightly longer for smoother experience
          ease: "back.out(1.7)"
        });

        // Add subtle pulsing effect while visible
        const firstChild = this.arOverlay.children[0];
        if (firstChild instanceof THREE.Mesh && firstChild.material &&
          'opacity' in firstChild.material) {
          const material = firstChild.material as THREE.MeshBasicMaterial;
          gsap.to(material, {
            opacity: 0.4,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
      }
    }, 300); // 300ms delay before showing
  }

  // NEW: Hide AR overlay when not hovering
  public hideAROverlay(): void {
    // Clear any pending show timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    if (!this.arOverlay || !this.isHovered) return;

    this.isHovered = false;

    if (this.overlayAnimation) {
      this.overlayAnimation.kill();
    }

    // Animate disappearance
    if (this.arOverlay) {
      this.overlayAnimation = gsap.to(this.arOverlay.scale, {
        x: 0.2, y: 0.2, z: 0.2,
        duration: 0.3, // Slightly longer for smoother experience
        ease: "power2.in",
        onComplete: () => {
          if (this.arOverlay) {
            this.arOverlay.visible = false;
          }
        }
      });
    }
  }

  // 🏥 Enhanced visual hierarchy with severity-based design language
  private getSeverityColor(): number {
    switch (this.severity) {
      case 'low':
        return this.isDiscovered ? 0x00ffaa : 0x4a9d5e;    // Bright confirmation vs muted scanning
      case 'medium':
        return this.isDiscovered ? 0xffaa44 : 0xf0a830;   // Bright warning vs muted professional
      case 'high':
        return this.isDiscovered ? 0xff4444 : 0xd63638;    // Bright emergency vs muted medical
      default:
        return this.isDiscovered ? 0x44ccff : 0x4a90e2;    // Bright info vs muted professional
    }
  }

  // 🏥 Critical (Red): Pulsing emergency indicators
  private getCriticalSeverityEffect(): THREE.Material {
    return new THREE.MeshBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.8 + Math.sin(Date.now() * 0.01) * 0.2, // Pulsing effect
    });
  }

  // 🏥 Moderate (Orange): Steady glow, caution symbols
  private getModerateSeverityEffect(): THREE.Material {
    return new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.7,
    });
  }

  // 🏥 Mild (Yellow/Green): Subtle highlighting, informational icons
  private getMildSeverityEffect(): THREE.Material {
    return new THREE.MeshBasicMaterial({
      color: 0x4caf50,
      transparent: true,
      opacity: 0.6,
    });
  }

  // 🏥 Discovered (Cyan): Professional diagnostic confirmation markers
  private getDiscoveredEffect(): THREE.Material {
    return new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.9,
    });
  }

  private getCategoryColor(): number {
    switch (this.category) {
      case 'orthopedic': return 0x00bcd4;      // Medical teal for orthopedic (professional)
      case 'neurological': return 0x9c27b0;   // Medical purple for neurological (professional)
      case 'cardiovascular': return 0xf44336; // Medical red for cardiovascular (professional)
      default: return 0x757575;               // Medical gray as default
    }
  }

  // 🏥 Condition type detection for medical-specific visualization
  private getConditionType(): string {
    // Map condition IDs to medical condition types
    const conditionTypeMap: Record<string, string> = {
      'cervical_strain': 'muscle_strain',
      'temporomandibular_disorder': 'joint_disorder',
      'femur_fracture': 'fracture',
      'knee_arthritis': 'joint_disorder',
      'scoliosis': 'spinal_deformity'
    };

    return conditionTypeMap[this.conditionId] || 'default';
  }

  // 🏥 Medical-specific color palettes
  private getHeatMapColor(): number {
    // Temperature-based color gradient for inflammation/muscle strain
    switch (this.severity) {
      case 'low': return 0x4CAF50;     // Cool green for mild inflammation
      case 'medium': return 0xFF9800;  // Warm orange for moderate
      case 'high': return 0xF44336;    // Hot red for severe
      default: return 0x2196F3;        // Medical blue default
    }
  }

  private getInflammationColor(): number {
    // Inflammation glow colors for joint disorders
    switch (this.severity) {
      case 'low': return 0x81C784;     // Subtle green glow for mild
      case 'medium': return 0xFFB74D;  // Orange glow for moderate
      case 'high': return 0xE57373;    // Red glow for severe
      default: return 0x64B5F6;        // Blue glow default
    }
  }

  public getMarkerGroup(): THREE.Group {
    return this.markerGroup;
  }

  public getConditionId(): string {
    return this.conditionId;
  }

  public updateDiscoveryProgress(progress: number): void {
    this.discoveryProgress = Math.min(progress, 1);

    // 🏥 Progressive information revelation based on scan progress
    this.updateInformationLevel();
    this.updateAppearance();
  }

  // 🏥 Progressive information revelation system
  private updateInformationLevel(): void {
    const oldLevel = this.informationLevel;
    const newLevel = Math.min(Math.floor(this.discoveryProgress * 4), 4);

    if (newLevel !== oldLevel) {
      this.informationLevel = newLevel;
      this.revealInformationLevel(newLevel);
    }
  }

  private revealInformationLevel(level: number): void {
    if (!this.infoPanel || !this.measurementOverlay || !this.annotationLabels) return;

    switch (level) {
      case 1:
        // Level 1: Basic anatomical region highlighting
        this.revealBasicAnatomy();
        break;
      case 2:
        // Level 2: Condition type indication
        this.revealConditionType();
        break;
      case 3:
        // Level 3: Severity assessment and measurements
        this.revealMeasurements();
        break;
      case 4:
        // Level 4: Full diagnostic information and treatment implications
        this.revealFullDiagnostics();
        break;
    }
  }

  private revealBasicAnatomy(): void {
    // Highlight the anatomical region
    if (this.infoPanel) {
      gsap.to(this.infoPanel.scale, {
        x: 1.2, y: 1.2, z: 1.2,
        duration: 0.5,
        ease: "back.out"
      });
    }
  }

  private revealConditionType(): void {
    // Show condition type indicators
    if (this.measurementOverlay) {
      this.measurementOverlay.visible = true;
      gsap.from(this.measurementOverlay.scale, {
        x: 0, y: 0, z: 0,
        duration: 0.4,
        ease: "back.out"
      });
    }
  }

  private revealMeasurements(): void {
    // Show measurement overlays
    if (this.annotationLabels) {
      gsap.from(this.annotationLabels.children.map(child => child.position), {
        y: '-=0.05',
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out"
      });
    }
  }

  private revealFullDiagnostics(): void {
    // Show complete diagnostic information
    this.showTreatmentImplications();
  }

  private showTreatmentImplications(): void {
    // Add treatment recommendation indicators
    const treatmentIndicator = this.createTreatmentIndicator();
    if (treatmentIndicator && this.annotationLabels) {
      treatmentIndicator.position.set(0, 0.35, 0);
      this.annotationLabels.add(treatmentIndicator);

      gsap.from(treatmentIndicator.position, {
        y: '-=0.02',
        duration: 0.4,
        ease: "elastic.out"
      });
    }
  }

  private createTreatmentIndicator(): THREE.Mesh | null {
    const geometry = new THREE.CircleGeometry(0.01, 6);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.8
    });

    return new THREE.Mesh(geometry, material);
  }

  // 🏥 Interactive Medical Tools Implementation

  // Cobb Angle Measurement for scoliosis assessment
  public createCobbAngleMeasurement(points: THREE.Vector3[]): THREE.Group | null {
    if (points.length < 2) return null;

    const measurementGroup = new THREE.Group();
    const toolId = `cobb_${Date.now()}`;

    // Create measurement lines
    for (let i = 0; i < points.length - 1; i++) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        points[i], points[i + 1]
      ]);

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffaa44,
        transparent: true,
        opacity: 0.8
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);
      measurementGroup.add(line);
    }

    // Add angle measurement indicator
    const angleIndicator = this.createAngleIndicator(points);
    if (angleIndicator) {
      measurementGroup.add(angleIndicator);
    }

    this.measurementTools.set(toolId, measurementGroup);
    return measurementGroup;
  }

  // Joint Space Assessment for arthritis evaluation
  public createJointSpaceAssessment(centerPoint: THREE.Vector3, radius: number): THREE.Group | null {
    const measurementGroup = new THREE.Group();
    const toolId = `joint_${Date.now()}`;

    // Create joint space measurement circle
    const circleGeometry = new THREE.RingGeometry(radius - 0.02, radius, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0x4ecdc4,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.position.copy(centerPoint);
    measurementGroup.add(circle);

    // Add measurement label
    const label = this.createMeasurementLabel(
      `Joint Space: ${Math.round(radius * 100)}mm`,
      new THREE.Vector3(centerPoint.x + radius + 0.05, centerPoint.y, centerPoint.z)
    );

    if (label) {
      measurementGroup.add(label);
    }

    this.measurementTools.set(toolId, measurementGroup);
    return measurementGroup;
  }

  // Range of Motion measurement for joint function
  public createRangeOfMotionIndicator(centerPoint: THREE.Vector3, range: number): THREE.Group | null {
    const measurementGroup = new THREE.Group();
    const toolId = `rom_${Date.now()}`;

    // Create ROM arc indicator
    const arcGeometry = new THREE.RingGeometry(range - 0.01, range, 32, 1, 0, Math.PI);
    const arcMaterial = new THREE.MeshBasicMaterial({
      color: 0x81c784,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    const arc = new THREE.Mesh(arcGeometry, arcMaterial);
    arc.position.copy(centerPoint);
    measurementGroup.add(arc);

    // Add ROM label
    const label = this.createMeasurementLabel(
      `ROM: ${Math.round(range * 180 / Math.PI)}°`,
      new THREE.Vector3(centerPoint.x + range + 0.05, centerPoint.y, centerPoint.z)
    );

    if (label) {
      measurementGroup.add(label);
    }

    this.measurementTools.set(toolId, measurementGroup);
    return measurementGroup;
  }

  // Comparison Views for bilateral or before/after analysis
  public createComparisonView(
    referenceMarker: MedicalMarker,
    comparisonType: 'bilateral' | 'before_after' | 'normal_abnormal'
  ): THREE.Group | null {
    if (!this.comparisonViews) {
      this.comparisonViews = new THREE.Group();
    }

    const comparisonGroup = new THREE.Group();

    switch (comparisonType) {
      case 'bilateral':
        this.createBilateralComparison(referenceMarker, comparisonGroup);
        break;
      case 'normal_abnormal':
        this.createNormalAbnormalComparison(referenceMarker, comparisonGroup);
        break;
    }

    this.comparisonViews.add(comparisonGroup);
    return comparisonGroup;
  }

  private createAngleIndicator(points: THREE.Vector3[]): THREE.Mesh | null {
    if (points.length < 3) return null;

    // Calculate angle between vectors
    const vector1 = points[1].clone().sub(points[0]);
    const vector2 = points[2].clone().sub(points[1]);

    const angle = vector1.angleTo(vector2);

    // Create angle visualization
    const angleGeometry = new THREE.RingGeometry(0.02, 0.03, 8, 1, 0, angle);
    const angleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const angleIndicator = new THREE.Mesh(angleGeometry, angleMaterial);
    angleIndicator.position.copy(points[1]);

    // Orient the angle indicator
    const direction = vector1.clone().add(vector2).normalize();
    angleIndicator.lookAt(points[1].clone().add(direction));

    return angleIndicator;
  }

  private createBilateralComparison(referenceMarker: MedicalMarker, group: THREE.Group): void {
    // Create visual comparison between left and right sides
    const leftIndicator = new THREE.Mesh(
      new THREE.RingGeometry(0.04, 0.06, 16),
      new THREE.MeshBasicMaterial({
        color: 0x4ecdc4,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      })
    );

    const rightIndicator = new THREE.Mesh(
      new THREE.RingGeometry(0.04, 0.06, 16),
      new THREE.MeshBasicMaterial({
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      })
    );

    leftIndicator.position.set(-0.1, 0, 0);
    rightIndicator.position.set(0.1, 0, 0);

    group.add(leftIndicator);
    group.add(rightIndicator);
  }

  private createNormalAbnormalComparison(referenceMarker: MedicalMarker, group: THREE.Group): void {
    // Create side-by-side comparison visualization
    const normalSide = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 0.06),
      new THREE.MeshBasicMaterial({
        color: 0x81c784,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      })
    );

    const abnormalSide = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 0.06),
      new THREE.MeshBasicMaterial({
        color: 0xe57373,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      })
    );

    normalSide.position.set(-0.05, 0, 0);
    abnormalSide.position.set(0.05, 0, 0);

    group.add(normalSide);
    group.add(abnormalSide);
  }

  // Public API for interactive tools
  public enableMeasurementMode(toolType: 'cobb' | 'joint' | 'rom'): void {
    this.isMeasurementMode = true;
    // Implementation would handle user interaction for placing measurement points
  }

  public disableMeasurementMode(): void {
    this.isMeasurementMode = false;
  }

  public getMeasurementTools(): Map<string, THREE.Group> {
    return this.measurementTools;
  }

  public clearMeasurements(): void {
    this.measurementTools.forEach(tool => {
      tool.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    });
    this.measurementTools.clear();
  }

  public markAsDiscovered(): void {
    this.isDiscovered = true;
    this.discoveryProgress = 1;
    this.updateAppearance();
    this.playDiscoveryAnimation();
  }

  private updateAppearance(): void {
    // 🏥 Apply enhanced visual hierarchy
    this.applyVisualHierarchy();

    const material = this.indicator.material as THREE.MeshBasicMaterial;

    if (this.isDiscovered) {
      // 🏥 Discovered state: Professional medical confirmation
      material.color.setHex(this.getSeverityColor());
      material.opacity = 0.9;

      // Add professional medical icon when discovered
      if (!this.icon) {
        this.icon = this.createMedicalIcon();
        if (this.icon) {
          this.markerGroup.add(this.icon);
        }
      }

      // Add diagnostic confirmation glow
      if (!this.glow) {
        this.glow = this.createDiagnosticGlow();
        if (this.glow) {
          this.markerGroup.add(this.glow);
        }
      }
    } else {
      // 🏥 Progressive discovery with medical scanning simulation
      this.updateProgressiveDiscovery(material);
    }

    // Update AR overlay visibility
    if (this.arOverlay) {
      this.arOverlay.visible = this.isDiscovered && this.isHovered;
    }
  }

  // 🏥 Progressive discovery with realistic medical scanning effects
  private updateProgressiveDiscovery(material: THREE.MeshBasicMaterial): void {
    if (this.discoveryProgress > 0) {
      // Phase 1: Subtle anatomical highlighting (like real medical imaging)
      const baseOpacity = this.discoveryProgress * 0.6;

      // Phase 2: Scanning beam effect simulation
      const scanPulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
      const scanIntensity = this.discoveryProgress * scanPulse;

      // Phase 3: Condition revelation with medical imaging aesthetics
      const revealProgress = Math.min(this.discoveryProgress * 1.5, 1);
      const conditionColor = this.getConditionTypeColor();

      // Blend between scanning color and condition-specific color
      material.color.setHex(
        this.interpolateColor(0x4a90e2, conditionColor, revealProgress)
      );

      material.opacity = baseOpacity * scanIntensity;

      // Add medical scanning beam effect
      this.addScanningBeamEffect();
    } else {
      // Hidden state: Minimal visibility
      material.opacity = 0.1;
      material.color.setHex(0x666666);
    }

    // Remove discovery elements if not discovered
    if (this.icon) {
      this.markerGroup.remove(this.icon);
      this.icon = null;
    }

    if (this.glow) {
      this.markerGroup.remove(this.glow);
      this.glow = null;
    }
  }

  // 🏥 Medical scanning beam simulation
  private addScanningBeamEffect(): void {
    // Create subtle scanning beam that follows mouse movement
    // This would be enhanced with mouse position data
    const scanProgress = this.discoveryProgress;

    if (scanProgress > 0.3 && !this.scanAnimation) {
      // Add scanning line effect
      this.createScanningLine();
    }
  }

  private createScanningLine(): void {
    // Create a subtle scanning line that rotates around the marker
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.1, 0, 0),
      new THREE.Vector3(0.1, 0, 0)
    ]);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: this.discoveryProgress * 0.5
    });

    const scanLine = new THREE.Line(lineGeometry, lineMaterial);

    // Animate scanning line rotation
    gsap.to(scanLine.rotation, {
      z: Math.PI * 2,
      duration: 1,
      repeat: -1,
      ease: "linear"
    });

    this.markerGroup.add(scanLine);
    this.scanAnimation = gsap.to({}, {}); // Track animation state
  }

  // 🏥 Condition-specific color coding
  private getConditionTypeColor(): number {
    const conditionColors: Record<string, number> = {
      'muscle_strain': 0xFF6B35,      // Orange for muscle inflammation
      'joint_disorder': 0x4ECDC4,     // Teal for joint issues
      'fracture': 0xFFE66D,           // Yellow for bone issues
      'spinal_deformity': 0xA8E6CF,   // Light green for spinal
      'default': 0x4A90E2             // Medical blue default
    };

    return conditionColors[this.getConditionType()] || conditionColors.default;
  }

  // 🏥 Color interpolation for smooth transitions
  private interpolateColor(color1: number, color2: number, factor: number): number {
    const r1 = (color1 >> 16) & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = color1 & 0xFF;

    const r2 = (color2 >> 16) & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = color2 & 0xFF;

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return (r << 16) | (g << 8) | b;
  }

  // 🏥 Enhanced visual hierarchy application
  private applyVisualHierarchy(): void {
    if (this.isDiscovered) {
      this.applyDiscoveredStateHierarchy();
    } else {
      this.applyScanningStateHierarchy();
    }
  }

  private applyDiscoveredStateHierarchy(): void {
    // Apply severity-based visual effects for discovered conditions
    switch (this.severity) {
      case 'high':
        this.applyCriticalVisualEffects();
        break;
      case 'medium':
        this.applyModerateVisualEffects();
        break;
      case 'low':
        this.applyMildVisualEffects();
        break;
    }
  }

  private applyCriticalVisualEffects(): void {
    // Pulsing emergency indicators for critical conditions
    if (this.indicator) {
      const material = this.indicator.material as THREE.MeshBasicMaterial;
      gsap.to(material, {
        opacity: 0.8 + Math.sin(Date.now() * 0.01) * 0.2,
        duration: 0.1,
        repeat: -1,
        yoyo: true
      });
    }
  }

  private applyModerateVisualEffects(): void {
    // Steady glow with caution symbols for moderate conditions
    if (this.glow) {
      const glowMaterial = this.glow.material as THREE.MeshBasicMaterial;
      gsap.to(glowMaterial, {
        opacity: 0.4 + Math.sin(Date.now() * 0.005) * 0.1,
        duration: 0.2,
        repeat: -1,
        yoyo: true
      });
    }
  }

  private applyMildVisualEffects(): void {
    // Subtle highlighting for mild conditions
    if (this.indicator) {
      const material = this.indicator.material as THREE.MeshBasicMaterial;
      material.opacity = 0.6;
    }
  }

  private applyScanningStateHierarchy(): void {
    // Apply scanning intensity based on discovery progress
    const scanIntensity = this.discoveryProgress;

    if (this.indicator) {
      const material = this.indicator.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + (scanIntensity * 0.4);
    }
  }

  private playDiscoveryAnimation(): void {
    // Remove any existing animation
    if (this.scanAnimation) {
      this.scanAnimation.kill();
    }

    // Scale animation
    const scaleAnimation = gsap.fromTo(this.markerGroup.scale,
      { x: 1, y: 1, z: 1 },
      {
        x: 1.8, y: 1.8, z: 1.8,
        duration: 0.4,
        ease: "back.out(1.7)",
        yoyo: true,
        repeat: 1,
        onUpdate: () => {
          // Update appearance during animation
          this.updateAppearance();
        }
      }
    );

    // Opacity animation
    const material = this.indicator.material as THREE.MeshBasicMaterial;
    const opacityAnimation = gsap.fromTo(material,
      { opacity: 0.9 },
      {
        opacity: 1.0,
        duration: 0.2,
        yoyo: true,
        repeat: 3
      }
    );

    // Combine animations
    this.scanAnimation = scaleAnimation;
  }

  public update(): void {
    // Update any animations or effects
    this.updateAppearance();

    // Track animation state
    this.isAnimating = this.scanAnimation !== null || this.overlayAnimation !== null;
  }

  public dispose(): void {
    // Clean up resources
    if (this.scanAnimation) {
      this.scanAnimation.kill();
    }

    if (this.overlayAnimation) {
      this.overlayAnimation.kill();
    }

    // Clear hover timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    // Remove from parent
    if (this.markerGroup.parent) {
      this.markerGroup.parent.remove(this.markerGroup);
    }
  }
}