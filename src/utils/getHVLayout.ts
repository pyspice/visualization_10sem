import { getTextWidth } from "./getTextWidth";
import {
  GraphViewProps,
  Edge,
  Point,
  NODE_FONT_SIZE,
  NODE_FONT,
  NODE_TEXT_PADDING_RIGHT,
  NODE_TEXT_PADDING_TOP,
} from "./GraphView";
import { Graph } from "./parseGraphML";

type Delta = {
  dw: number;
  dh: number;
};

type Deltas = [Delta, Delta];

type Rect = {
  w: number;
  h: number;
  d?: [Delta, Delta];
};

const DEFAULT_NODE_RADIUS = 2;
const MIN_EDGE_LENGTH = 5;

function convertRectsToPoints(
  root: string,
  rects: Map<string, Rect>,
  edges: Map<string, string[]>
): Map<string, Point> {
  const points = new Map<string, Point>();
  function dfs(node: string, x: number, y: number): void {
    points.set(node, { x, y, radius: 1 });
    const children = edges.get(node);
    if (children.length === 0) {
      return;
    }

    const { d } = rects.get(node);
    children.forEach((node, i) => {
      dfs(node, x + d[i].dw, y + d[i].dh);
    });
  }

  dfs(root, 0, 0);

  return points;
}

function isRectBetter(rect1: Rect, rect2: Rect): number {
  return (
    Math.abs(rect1.h - rect1.w) - Math.abs(rect2.h - rect2.w) ||
    rect1.h - rect2.h
  );
}

function getHVNodes(
  root: string,
  edges: Map<string, string[]>
): Map<string, Point> {
  const rects = new Map<string, Rect>();
  function dfs(node: string): void {
    const children = edges.get(node);
    if (children.length === 0) {
      rects.set(node, { w: 0, h: 0 });
      return;
    }

    children.forEach((node) => dfs(node));
    const childRect1 = rects.get(children[0]);
    const childRect2 =
      children.length === 2 ? rects.get(children[1]) : { w: 0, h: 0 };

    const minEdgeWidth = Math.max(
      DEFAULT_NODE_RADIUS * 2 + MIN_EDGE_LENGTH,
      getTextWidth(node, NODE_FONT) + NODE_TEXT_PADDING_RIGHT
    );
    const minEdgeHeight = Math.max(
      DEFAULT_NODE_RADIUS * 2 + MIN_EDGE_LENGTH,
      NODE_FONT_SIZE + NODE_TEXT_PADDING_TOP
    );

    const w1 = Math.max(minEdgeWidth, childRect2.w + 1);
    const h1 = minEdgeHeight;
    const rect1 = {
      w: childRect1.w + w1,
      h: childRect2.h + h1,
      d: [
        { dw: w1, dh: 0 },
        { dw: 0, dh: h1 },
      ] as Deltas,
    }; // 1 - right_width2, 2 - down_1

    const w2 = minEdgeWidth;
    const h2 = Math.max(minEdgeHeight, childRect1.h + 1);
    const rect2 = {
      w: childRect1.w + w2,
      h: childRect2.h + h2,
      d: [
        { dw: w2, dh: 0 },
        { dw: 0, dh: h2 },
      ] as Deltas,
    }; // 1 - right_1, 2 - down_height1

    const w3 = Math.max(minEdgeWidth, childRect1.w + 1);
    const h3 = minEdgeHeight;
    const rect3 = {
      w: childRect2.w + w3,
      h: childRect1.h + h3,
      d: [
        { dw: 0, dh: h3 },
        { dw: w3, dh: 0 },
      ] as Deltas,
    }; // 1 - down_1, 2 - right_width1

    const w4 = minEdgeWidth;
    const h4 = Math.max(minEdgeHeight, childRect1.h + 1);
    const rect4 = {
      w: childRect2.w + w4,
      h: childRect2.h + h4,
      d: [
        { dw: 0, dh: h4 },
        { dw: w4, dh: 0 },
      ] as Deltas,
    }; // 1 - down_height1, 2 - right_1

    const _rects = [rect1, rect2, rect3, rect4];
    _rects.sort(isRectBetter);
    rects.set(node, _rects[0]);
  }

  dfs(root);

  return convertRectsToPoints(root, rects, edges);
}

export function getHVLayout(graph: Graph): GraphViewProps {
  const edgesList = new Map<string, string[]>(
    [...graph.nodes.values()].map((node) => [node, []])
  );
  let possibleRoots = new Set(graph.nodes);
  const edges: Edge[] = [];
  for (const edge of graph.edges.values()) {
    edgesList.get(edge.from).push(edge.to);
    possibleRoots.delete(edge.to);
    edges.push(edge);
  }

  const root = possibleRoots.values().next().value;
  const nodes = getHVNodes(root, edgesList);
  return { nodes, edges };
}
