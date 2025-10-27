"use client";

/**
 * Feature Highlight Component
 * ENHANCEMENT: Visual affordances for new features
 * CLEAN: Non-intrusive highlighting with animations
 * DESIGN: Follows X-RAY holographic aesthetic
 */

import React, { useState, useEffect, useRef } from "react";
import {
  colors,
  typography,
  spacing,
  borders,
  effects,
  animation,
} from "../styles/design-tokens";

interface FeatureHighlightProps {
  featureId: string;
  targetElement: string; // CSS selector
  title: string;
  description: string;
  showOnce?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number; // Delay in ms before showing
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  featureId,
  targetElement,
  title,
  description,
  showOnce = true,
  position = "top",
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Element | null>(null);

  useEffect(() => {
    // Check if feature has been shown before
    if (showOnce) {
      const shown = sessionStorage.getItem(`feature-highlight-${featureId}`);
      if (shown) {
        setHasBeenShown(true);
        return;
      }
    }

    // Set up delay
    const timer = setTimeout(() => {
      // Find target element
      targetRef.current = document.querySelector(targetElement);
      if (targetRef.current) {
        setIsVisible(true);

        if (showOnce) {
          sessionStorage.setItem(`feature-highlight-${featureId}`, "true");
          setHasBeenShown(true);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [featureId, targetElement, showOnce, delay]);

  useEffect(() => {
    if (!isVisible || !targetRef.current || !highlightRef.current) return;

    // Position highlight relative to target element
    const targetRect = targetRef.current.getBoundingClientRect();
    const highlightRect = highlightRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = targetRect.top - highlightRect.height - 10;
        left = targetRect.left + (targetRect.width - highlightRect.width) / 2;
        break;
      case "bottom":
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width - highlightRect.width) / 2;
        break;
      case "left":
        top = targetRect.top + (targetRect.height - highlightRect.height) / 2;
        left = targetRect.left - highlightRect.width - 10;
        break;
      case "right":
        top = targetRect.top + (targetRect.height - highlightRect.height) / 2;
        left = targetRect.right + 10;
        break;
    }

    // Keep within viewport
    const margin = 10;
    top = Math.max(
      margin,
      Math.min(top, window.innerHeight - highlightRect.height - margin)
    );
    left = Math.max(
      margin,
      Math.min(left, window.innerWidth - highlightRect.width - margin)
    );

    highlightRef.current.style.top = `${top}px`;
    highlightRef.current.style.left = `${left}px`;
  }, [isVisible, position]);

  if (!isVisible || hasBeenShown) return null;

  const styles: Record<string, React.CSSProperties> = {
    container: {
      position: "fixed",
      zIndex: 10000,
      background: colors.background.gradient.panel,
      border: `${borders.width.base} solid ${colors.primary.base}`,
      borderRadius: borders.radius.xl,
      backdropFilter: effects.blur.lg,
      boxShadow: `${effects.shadow.xl}, 0 0 20px ${colors.primary.base}44`,
      padding: spacing.lg,
      maxWidth: "300px",
      fontFamily: typography.fontFamily.primary,
      animation: `fadeInSlide 0.3s ${animation.easing.smooth}`,
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.base,
      textShadow: effects.textShadow.sm,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: colors.neutral.lightest,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: spacing.md,
    },
    button: {
      width: "100%",
      padding: `${spacing.sm} ${spacing.md}`,
      background: `linear-gradient(135deg, ${colors.primary.base}, ${colors.primary.dark})`,
      border: "none",
      borderRadius: borders.radius.md,
      color: colors.neutral.black,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      cursor: "pointer",
      boxShadow: effects.shadow.primaryGlow,
      transition: `all ${animation.duration.fast}`,
    },
  };

  return (
    <div ref={highlightRef} style={styles.container}>
      <div style={styles.header}>
        <span
          style={{
            fontSize: "24px",
            filter: `drop-shadow(0 0 8px ${colors.primary.base})`,
          }}
        >
          ✨
        </span>
        <h3 style={styles.title}>{title}</h3>
      </div>

      <p style={styles.description}>{description}</p>

      <button style={styles.button} onClick={() => setIsVisible(false)}>
        Got It
      </button>

      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Feature Highlight Manager
 * CENTRALIZED: Manage multiple feature highlights
 */
interface HighlightConfig {
  featureId: string;
  targetElement: string;
  title: string;
  description: string;
  showOnce?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

interface FeatureHighlightManagerProps {
  highlights: HighlightConfig[];
}

export const FeatureHighlightManager: React.FC<
  FeatureHighlightManagerProps
> = ({ highlights }) => {
  return (
    <>
      {highlights.map((highlight) => (
        <FeatureHighlight
          key={highlight.featureId}
          featureId={highlight.featureId}
          targetElement={highlight.targetElement}
          title={highlight.title}
          description={highlight.description}
          showOnce={highlight.showOnce}
          position={highlight.position}
          delay={highlight.delay}
        />
      ))}
    </>
  );
};
