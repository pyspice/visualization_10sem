import { GraphViewProps, Edge, Point } from "./GraphView";
import { Graph } from "./parseGraphML";

type Rect = {
  w: number;
  h: number;
};

function convertRectsToPoints(
  root: string,
  rects: Map<string, Rect>,
  edges: Map<string, string[]>
): Map<string, Point> {
  const points = new Map<string, Point>();
  function dfs(node: string, x: number, y: number): void {
    points.set(node, { x, y, radius: 3 });
    const children = edges.get(node);
    if (children.length === 0) {
      return;
    }

    const { w, h } = rects.get(node);
    children.forEach((node) => {
      const rect = rects.get(node);
      dfs(node, w - rect.w, h - rect.h);
    });
  }

  dfs(root, 0, 0);

  return points;
}

function isRectBetter(rect1: Rect, rect2: Rect): boolean {
  return (
    Math.abs(rect1.h - rect1.w) < Math.abs(rect2.h - rect2.w) ||
    rect1.h < rect2.h
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

    const rect1 = { w: childRect1.w + childRect2.w + 1, h: childRect2.h + 1 };
    const rect2 = { w: childRect1.w + 1, h: childRect1.h + childRect2.h + 1 };
    rects.set(node, isRectBetter(rect1, rect2) ? rect1 : rect2);
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
