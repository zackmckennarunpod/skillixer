/**
 * Skillixer - Visual Effects
 *
 * Magical animations and color effects
 */

import { MAGIC_COLORS, MIXING_FRAMES, FORGE_FRAMES, SCRY_FRAMES, CASTING_FRAMES } from './ascii.js';

/** Effect state for animations */
export interface EffectState {
  frame: number;
  active: boolean;
  type: EffectType;
  colors: string[];
  startTime: number;
}

export type EffectType = 'mixing' | 'forging' | 'scrying' | 'casting' | 'success' | 'error';

/** Create a new effect */
export function createEffect(type: EffectType): EffectState {
  return {
    frame: 0,
    active: true,
    type,
    colors: generateEffectColors(type),
    startTime: Date.now(),
  };
}

/** Generate colors for an effect type */
function generateEffectColors(type: EffectType): string[] {
  switch (type) {
    case 'mixing':
      // Random swirling colors
      return shuffleArray([...MAGIC_COLORS]).slice(0, 4);
    case 'forging':
      // Fire colors: orange -> red -> gold -> white
      return ['#ff6b35', '#f85149', '#ffd700', '#ffffff'];
    case 'scrying':
      // Mysterious blues and purples
      return ['#58a6ff', '#9d4edd', '#a371f7', '#79c0ff'];
    case 'casting':
      // Bright magical colors
      return ['#ffd700', '#a371f7', '#3fb950', '#58a6ff'];
    case 'success':
      return ['#3fb950', '#7ee787'];
    case 'error':
      return ['#f85149', '#ff7b72'];
    default:
      return MAGIC_COLORS.slice(0, 3);
  }
}

/** Shuffle array (Fisher-Yates) */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    const swap = result[j];
    if (temp !== undefined && swap !== undefined) {
      result[i] = swap;
      result[j] = temp;
    }
  }
  return result;
}

/** Get the current frame for an effect */
export function getEffectFrame(effect: EffectState): string {
  switch (effect.type) {
    case 'mixing':
      return MIXING_FRAMES[effect.frame % MIXING_FRAMES.length] ?? '';
    case 'forging':
      return FORGE_FRAMES[effect.frame % FORGE_FRAMES.length] ?? '';
    case 'scrying':
      return SCRY_FRAMES[effect.frame % SCRY_FRAMES.length] ?? '';
    case 'casting':
      return CASTING_FRAMES[effect.frame % CASTING_FRAMES.length] ?? '';
    default:
      return '';
  }
}

/** Advance effect to next frame */
export function advanceEffect(effect: EffectState): EffectState {
  return {
    ...effect,
    frame: effect.frame + 1,
  };
}

/** Color interpolation for smooth transitions */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Create a gradient effect across multiple colors */
export function createGradient(colors: string[], steps: number): string[] {
  if (colors.length < 2) return colors;

  const gradient: string[] = [];
  const segmentSteps = Math.floor(steps / (colors.length - 1));

  for (let i = 0; i < colors.length - 1; i++) {
    const colorA = colors[i];
    const colorB = colors[i + 1];
    if (colorA && colorB) {
      for (let j = 0; j < segmentSteps; j++) {
        const factor = j / segmentSteps;
        gradient.push(interpolateColor(colorA, colorB, factor));
      }
    }
  }

  const lastColor = colors[colors.length - 1];
  if (lastColor) {
    gradient.push(lastColor);
  }
  return gradient;
}

/** Generate a pulsing color effect */
export function getPulsingColor(baseColor: string, tick: number, intensity: number = 0.3): string {
  const factor = (Math.sin(tick * 0.1) + 1) / 2; // 0 to 1
  const adjustedFactor = factor * intensity;

  // Lighten the color based on the pulse
  const hex = baseColor.replace('#', '');
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.round(255 * adjustedFactor));
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.round(255 * adjustedFactor));
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.round(255 * adjustedFactor));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Generate sparkle positions for a given width/height */
export function generateSparkles(
  width: number,
  height: number,
  count: number,
): { x: number; y: number; char: string }[] {
  const sparkleChars = ['✧', '·', '★', '✦', '◇', '◆', '✵', '✶'];
  const sparkles: { x: number; y: number; char: string }[] = [];

  for (let i = 0; i < count; i++) {
    const char = sparkleChars[Math.floor(Math.random() * sparkleChars.length)] ?? '✧';
    sparkles.push({
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      char,
    });
  }

  return sparkles;
}

/** Create a rainbow text effect */
export function rainbowText(text: string, offset: number = 0): Array<{ char: string; color: string }> {
  const rainbowColors = ['#f85149', '#ffa657', '#ffd700', '#3fb950', '#58a6ff', '#a371f7'];

  return text.split('').map((char, i) => ({
    char,
    color: rainbowColors[(i + offset) % rainbowColors.length] ?? rainbowColors[0]!,
  }));
}

/** Generate a magical particle for mixing animations */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  color: string;
  life: number;
}

export function createParticle(x: number, y: number): Particle {
  const chars = ['✧', '·', '★', '◇', '◆'];
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.5 + Math.random() * 1.5;

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    char: chars[Math.floor(Math.random() * chars.length)] ?? '✧',
    color: MAGIC_COLORS[Math.floor(Math.random() * MAGIC_COLORS.length)] ?? '#9d4edd',
    life: 20 + Math.floor(Math.random() * 20),
  };
}

export function updateParticle(particle: Particle): Particle {
  return {
    ...particle,
    x: particle.x + particle.vx,
    y: particle.y + particle.vy,
    vy: particle.vy + 0.05, // gravity
    life: particle.life - 1,
  };
}

/** Node connection line with gradient effect */
export function createConnectionLine(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  lineColors: string[],
): Array<{ x: number; y: number; char: string; color: string }> {
  const points: Array<{ x: number; y: number; char: string; color: string }> = [];
  const dx = toX - fromX;
  const dy = toY - fromY;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const gradient = createGradient(lineColors, steps);
  const defaultColor = lineColors[lineColors.length - 1] ?? '#ffffff';

  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(fromX + dx * t);
    const y = Math.round(fromY + dy * t);

    let char = '─';
    if (Math.abs(dy) > Math.abs(dx)) {
      char = '│';
    }

    points.push({
      x,
      y,
      char,
      color: gradient[i] ?? defaultColor,
    });
  }

  return points;
}
