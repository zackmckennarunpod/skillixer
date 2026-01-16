/**
 * Skillixer - Composition Graph Renderer
 *
 * Visual ASCII art rendering of skill compositions
 * with magical colors and effects
 */

import type { CompositionNode } from '../../core/types.js';
import { isSkillNode, isPipeNode, isParallelNode, isForkNode, isHydrateNode } from '../../core/types.js';
import { colors } from '../theme.js';
import { createGradient } from '../effects.js';

/** A rendered node with position and style */
export interface RenderedNode {
  id: string;
  type: 'skill' | 'pipe' | 'parallel' | 'fork' | 'hydrate';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  selected: boolean;
  lines: string[];
}

/** A connection between nodes */
export interface RenderedConnection {
  fromId: string;
  toId: string;
  points: Array<{ x: number; y: number; char: string; color: string }>;
}

/** Graph rendering result */
export interface RenderedGraph {
  nodes: RenderedNode[];
  connections: RenderedConnection[];
  width: number;
  height: number;
}

/** Node dimensions */
const NODE_WIDTH = 24;
const NODE_HEIGHT = 5;
const H_SPACING = 4;
const V_SPACING = 2;

/** Generate a unique ID */
let idCounter = 0;
function generateId(): string {
  return `node-${++idCounter}`;
}

/** Get node type from composition node */
function getNodeType(node: CompositionNode): RenderedNode['type'] {
  if (isSkillNode(node)) return 'skill';
  if (isPipeNode(node)) return 'pipe';
  if (isParallelNode(node)) return 'parallel';
  if (isForkNode(node)) return 'fork';
  if (isHydrateNode(node)) return 'hydrate';
  return 'skill';
}

/** Get node label from composition node */
function getNodeLabel(node: CompositionNode): string {
  if (isSkillNode(node)) return node.skill.name;
  if (isPipeNode(node)) return `Channel (${node.nodes.length})`;
  if (isParallelNode(node)) return `Conjure (${node.nodes.length})`;
  if (isForkNode(node)) return `Divine: ${node.condition.when.slice(0, 15)}...`;
  if (isHydrateNode(node)) return `Imbue`;
  return 'Unknown';
}

/** Get color for node type */
function getNodeColor(type: RenderedNode['type']): string {
  const colorMap: Record<RenderedNode['type'], string> = {
    skill: colors.inscribeColor,
    pipe: colors.channelColor,
    parallel: colors.conjureColor,
    fork: colors.divineColor,
    hydrate: colors.imbueColor,
  };
  return colorMap[type];
}

/** Render a single node box */
function renderNodeBox(node: RenderedNode): string[] {
  const { type, label, selected, width } = node;
  const icon = getNodeIcon(type);
  const maxLabelLen = width - 4;
  const truncLabel = label.length > maxLabelLen ? label.slice(0, maxLabelLen - 3) + '...' : label;
  const padding = ' '.repeat(Math.max(0, maxLabelLen - truncLabel.length));

  const topBorder = selected ? '╔' + '═'.repeat(width - 2) + '╗' : '┌' + '─'.repeat(width - 2) + '┐';
  const bottomBorder = selected ? '╚' + '═'.repeat(width - 2) + '╝' : '└' + '─'.repeat(width - 2) + '┘';
  const side = selected ? '║' : '│';

  return [
    topBorder,
    `${side} ${icon} ${getTypeLabel(type).padEnd(width - 5)}${side}`,
    `${side}${' '.repeat(width - 2)}${side}`,
    `${side} ${truncLabel}${padding} ${side}`,
    bottomBorder,
  ];
}

/** Get icon for node type */
function getNodeIcon(type: RenderedNode['type']): string {
  const icons: Record<RenderedNode['type'], string> = {
    skill: '◆',
    pipe: '→',
    parallel: '⫘',
    fork: '⎇',
    hydrate: '◈',
  };
  return icons[type];
}

/** Get type label */
function getTypeLabel(type: RenderedNode['type']): string {
  const labels: Record<RenderedNode['type'], string> = {
    skill: 'SPELL',
    pipe: 'CHANNEL',
    parallel: 'CONJURE',
    fork: 'DIVINE',
    hydrate: 'IMBUE',
  };
  return labels[type];
}

/** Layout a composition tree and return rendered graph */
export function layoutComposition(
  node: CompositionNode | null,
  selectedId: string | null = null,
): RenderedGraph {
  if (!node) {
    return { nodes: [], connections: [], width: 0, height: 0 };
  }

  const nodes: RenderedNode[] = [];
  const connections: RenderedConnection[] = [];

  // Recursive layout function
  function layoutNode(
    compNode: CompositionNode,
    x: number,
    y: number,
    parentId: string | null,
  ): { node: RenderedNode; width: number; height: number } {
    const id = generateId();
    const type = getNodeType(compNode);
    const label = getNodeLabel(compNode);
    const color = getNodeColor(type);

    const renderedNode: RenderedNode = {
      id,
      type,
      label,
      x,
      y,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      color,
      selected: id === selectedId,
      lines: [],
    };

    // Render the node box
    renderedNode.lines = renderNodeBox(renderedNode);
    nodes.push(renderedNode);

    // Add connection from parent
    if (parentId) {
      const parentNode = nodes.find((n) => n.id === parentId);
      if (parentNode) {
        connections.push(createConnection(parentNode, renderedNode));
      }
    }

    let totalWidth = NODE_WIDTH;
    let totalHeight = NODE_HEIGHT;

    // Layout children based on node type
    if (isPipeNode(compNode)) {
      // Pipe: vertical layout
      let childY = y + NODE_HEIGHT + V_SPACING;
      for (const childNode of compNode.nodes) {
        const result = layoutNode(childNode, x, childY, id);
        childY += result.height + V_SPACING;
        totalHeight += result.height + V_SPACING;
        totalWidth = Math.max(totalWidth, result.width);
      }
    } else if (isParallelNode(compNode)) {
      // Parallel: horizontal layout
      let childX = x;
      let maxChildHeight = 0;
      const childY = y + NODE_HEIGHT + V_SPACING;

      for (const childNode of compNode.nodes) {
        const result = layoutNode(childNode, childX, childY, id);
        childX += result.width + H_SPACING;
        maxChildHeight = Math.max(maxChildHeight, result.height);
      }

      totalWidth = childX - x - H_SPACING;
      totalHeight = NODE_HEIGHT + V_SPACING + maxChildHeight;
    } else if (isForkNode(compNode)) {
      // Fork: two branches
      const childY = y + NODE_HEIGHT + V_SPACING;

      // Then branch
      const thenResult = layoutNode(compNode.condition.then, x, childY, id);

      // Else branch (if exists)
      if (compNode.condition.else) {
        const elseX = x + thenResult.width + H_SPACING;
        const elseResult = layoutNode(compNode.condition.else, elseX, childY, id);
        totalWidth = thenResult.width + H_SPACING + elseResult.width;
        totalHeight = NODE_HEIGHT + V_SPACING + Math.max(thenResult.height, elseResult.height);
      } else {
        totalWidth = thenResult.width;
        totalHeight = NODE_HEIGHT + V_SPACING + thenResult.height;
      }
    } else if (isHydrateNode(compNode)) {
      // Hydrate: layout inner node
      const childY = y + NODE_HEIGHT + V_SPACING;
      const result = layoutNode(compNode.node, x, childY, id);
      totalWidth = result.width;
      totalHeight = NODE_HEIGHT + V_SPACING + result.height;
    }

    return { node: renderedNode, width: totalWidth, height: totalHeight };
  }

  const result = layoutNode(node, 0, 0, null);

  return {
    nodes,
    connections,
    width: result.width,
    height: result.height,
  };
}

/** Create a connection between two nodes */
function createConnection(from: RenderedNode, to: RenderedNode): RenderedConnection {
  const points: RenderedConnection['points'] = [];

  // Calculate connection points
  const fromX = from.x + Math.floor(from.width / 2);
  const fromY = from.y + from.height;
  const toX = to.x + Math.floor(to.width / 2);
  const toY = to.y;

  // Create gradient colors
  const gradient = createGradient([from.color, to.color], Math.abs(toY - fromY) + Math.abs(toX - fromX));
  let colorIndex = 0;

  // Vertical line from source
  for (let y = fromY; y < toY; y++) {
    points.push({
      x: fromX,
      y,
      char: '│',
      color: gradient[colorIndex++] || to.color,
    });
  }

  // Horizontal line if needed
  if (fromX !== toX) {
    const char = toX > fromX ? '└' : '┘';
    points.push({
      x: fromX,
      y: toY - 1,
      char,
      color: gradient[colorIndex++] || to.color,
    });

    const dir = toX > fromX ? 1 : -1;
    for (let x = fromX + dir; x !== toX; x += dir) {
      points.push({
        x,
        y: toY - 1,
        char: '─',
        color: gradient[colorIndex++] || to.color,
      });
    }

    points.push({
      x: toX,
      y: toY - 1,
      char: toX > fromX ? '┐' : '┌',
      color: gradient[colorIndex++] || to.color,
    });
  }

  // Arrow at destination
  points.push({
    x: toX,
    y: toY - 1,
    char: '▼',
    color: to.color,
  });

  return {
    fromId: from.id,
    toId: to.id,
    points,
  };
}

/** Convert rendered graph to string array for display */
export function renderGraphToStrings(graph: RenderedGraph): string[] {
  if (graph.nodes.length === 0) {
    return ['  No composition yet. Press "s" to inscribe a new spell.'];
  }

  // Create a 2D buffer
  const buffer: string[][] = [];
  const colorBuffer: string[][] = [];

  // Initialize buffer
  for (let y = 0; y <= graph.height + 2; y++) {
    const bufferRow: string[] = [];
    const colorRow: string[] = [];
    for (let x = 0; x <= graph.width + 2; x++) {
      bufferRow.push(' ');
      colorRow.push(colors.parchment);
    }
    buffer.push(bufferRow);
    colorBuffer.push(colorRow);
  }

  // Draw connections first (behind nodes)
  for (const conn of graph.connections) {
    for (const point of conn.points) {
      const row = buffer[point.y];
      const colorRow = colorBuffer[point.y];
      if (row && colorRow && row[point.x] !== undefined) {
        row[point.x] = point.char;
        colorRow[point.x] = point.color;
      }
    }
  }

  // Draw nodes on top
  for (const node of graph.nodes) {
    for (let ly = 0; ly < node.lines.length; ly++) {
      const line = node.lines[ly];
      if (!line) continue;

      for (let lx = 0; lx < line.length; lx++) {
        const bufY = node.y + ly;
        const bufX = node.x + lx;
        const row = buffer[bufY];
        const colorRow = colorBuffer[bufY];
        const char = line[lx];
        if (row && colorRow && row[bufX] !== undefined && char) {
          row[bufX] = char;
          colorRow[bufX] = node.color;
        }
      }
    }
  }

  // Convert buffer to strings
  return buffer.map((row) => row.join(''));
}

/** Generate a demo composition for testing */
export function generateDemoComposition(): CompositionNode {
  // Reset ID counter
  idCounter = 0;

  return {
    _tag: 'PipeNode',
    nodes: [
      {
        _tag: 'ParallelNode',
        nodes: [
          {
            _tag: 'SkillNode',
            skill: {
              _tag: 'Skill',
              name: 'datadog-search',
              instructions: 'Search Datadog logs',
              source: { type: 'github', owner: 'runpod', repo: 'skills', path: 'datadog.md' },
            },
          },
          {
            _tag: 'SkillNode',
            skill: {
              _tag: 'Skill',
              name: 'github-search',
              instructions: 'Search GitHub',
              source: { type: 'github', owner: 'runpod', repo: 'skills', path: 'github.md' },
            },
          },
        ],
      },
      {
        _tag: 'SkillNode',
        skill: {
          _tag: 'Skill',
          name: 'summarize',
          instructions: 'Summarize findings',
          source: { type: 'inline' },
        },
      },
      {
        _tag: 'ForkNode',
        condition: {
          when: 'severity === "critical"',
          then: {
            _tag: 'SkillNode',
            skill: {
              _tag: 'Skill',
              name: 'alert-oncall',
              instructions: 'Alert on-call',
              source: { type: 'inline' },
            },
          },
          else: {
            _tag: 'SkillNode',
            skill: {
              _tag: 'Skill',
              name: 'log-finding',
              instructions: 'Log the finding',
              source: { type: 'inline' },
            },
          },
        },
      },
    ],
  };
}
