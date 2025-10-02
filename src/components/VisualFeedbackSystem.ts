import * as THREE from 'three';
import gsap from 'gsap';

export class VisualFeedbackSystem {
  private scene: THREE.Scene;
  private feedbackElements: THREE.Group[] = [];
  private maxElements: number = 8; // Reduced limit for better performance
  private activeAnimations: gsap.core.Tween[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public createConditionDiscoveryFeedback(position: THREE.Vector3, severity: 'low' | 'medium' | 'high', conditionName: string): void {
    // Remove oldest feedback if we have too many
    if (this.feedbackElements.length >= this.maxElements) {
      const oldElement = this.feedbackElements.shift();
      if (oldElement && oldElement.parent) {
        oldElement.parent.remove(oldElement);
      }
    }

    const feedbackGroup = new THREE.Group();
    feedbackGroup.position.copy(position);
    
    // Create a visual text element to indicate the condition discovery
    const textGeometry = new THREE.SphereGeometry(0.01, 4, 4); // Placeholder for text
    const textMaterial = new THREE.MeshBasicMaterial({ 
      color: this.getSeverityColor(severity),
      transparent: true,
      opacity: 0.8
    });
    
    const textElement = new THREE.Mesh(textGeometry, textMaterial);
    textElement.position.set(0, 0.3, 0); // Above the position
    feedbackGroup.add(textElement);
    
    // Create expanding rings to indicate the discovery event
    for (let i = 0; i < 2; i++) { // Reduced from 3 to 2 for better performance
      const ringGeometry = new THREE.RingGeometry(0.02, 0.03, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: this.getSeverityColor(severity),
        transparent: true,
        opacity: 0.6 - (i * 0.3), // Adjusted opacity reduction
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2; // Face upward
      ring.position.set(0, 0.01 * i, 0); // Stacked slightly
      feedbackGroup.add(ring);
      
      // Animate the ring to expand
      const scaleAnimation = gsap.to(ring.scale, {
        x: 2.0, // Reduced from 2.5 for better performance
        y: 2.0,
        z: 2.0,
        duration: 1.2, // Slightly faster for better UX
        delay: i * 0.2,
        ease: "power2.out",
        onComplete: () => {
          if (ring.parent) {
            ring.parent.remove(ring);
          }
        }
      });
      this.activeAnimations.push(scaleAnimation);
      
      // Fade out the ring
      const fadeAnimation = gsap.to(ring.material as THREE.MeshBasicMaterial, {
        opacity: 0,
        duration: 1.2,
        delay: i * 0.2,
        ease: "power2.out"
      });
      this.activeAnimations.push(fadeAnimation);
    }
    
    this.scene.add(feedbackGroup);
    this.feedbackElements.push(feedbackGroup);

    // Remove the element after animation completes
    setTimeout(() => {
      const index = this.feedbackElements.indexOf(feedbackGroup);
      if (index !== -1) {
        this.feedbackElements.splice(index, 1);
      }
      if (feedbackGroup.parent) {
        feedbackGroup.parent.remove(feedbackGroup);
      }
    }, 2000);
  }

  private getSeverityColor(severity: 'low' | 'medium' | 'high'): number {
    switch (severity) {
      case 'low': return 0x4a9d5e;    // Medical green
      case 'medium': return 0xf0a830; // Medical orange
      case 'high': return 0xd63638;   // Medical red
      default: return 0x4a90e2;       // Medical blue
    }
  }

  public createModelSwitchFeedback(position: THREE.Vector3): void {
    // Create a visual transition indicator
    const transitionGroup = new THREE.Group();
    transitionGroup.position.copy(position);
    
    // Create a pulsing sphere to indicate model switching
    const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00bcd4, // Medical teal
      transparent: true,
      opacity: 0.5
    });
    
    const pulseSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    transitionGroup.add(pulseSphere);
    
    // Add pulsing animation
    const scaleAnimation = gsap.to(pulseSphere.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 0.5,
      repeat: 2,
      yoyo: true,
      ease: "sine.inOut"
    });
    this.activeAnimations.push(scaleAnimation);
    
    const opacityAnimation = gsap.to(sphereMaterial, {
      opacity: 0.8,
      duration: 0.5,
      repeat: 2,
      yoyo: true,
      ease: "sine.inOut"
    });
    this.activeAnimations.push(opacityAnimation);
    
    this.scene.add(transitionGroup);
    
    setTimeout(() => {
      if (transitionGroup.parent) {
        transitionGroup.parent.remove(transitionGroup);
      }
    }, 1500);
  }

  public dispose(): void {
    // Clean up all feedback elements
    this.feedbackElements.forEach(element => {
      if (element.parent) {
        element.parent.remove(element);
      }
    });
    this.feedbackElements = [];
    
    // Kill all active animations
    this.activeAnimations.forEach(animation => {
      animation.kill();
    });
    this.activeAnimations = [];
  }
}