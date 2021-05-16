import { GraphViewProps, Edge, Point } from "./GraphView";
import { Graph } from "./parseGraphML";

type Direction = "vertical" | "horizontal";

type Rect = {
  w: number;
  h: number;
  dir?: Direction;
};

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

    const rect = rects.get(node);
    children.forEach((node) => {
      const { w, h, dir } = rects.get(node);
      const dw = dir === "horizontal" ? 0 : 1;
      const dh = dir === "vertical" ? 0 : 1;
      dfs(node, x + rect.w - w - dw, y + rect.h - h - dh);
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

    const rect1 = { w: childRect1.w + childRect2.w + 1, h: childRect2.h + 1 }; // 1 - right_width2, 2 - down_1
    const rect2 = { w: childRect1.w + 1, h: childRect1.h + childRect2.h + 1 }; // 1 - right_1, 2 - down_height1
    const rect3 = { w: childRect1.w + childRect2.w + 1, h: childRect1.h + 1 }; // 1 - down_1, 2 - right_width1
    const rect4 = { w: childRect2.w + 1, h: childRect1.h + childRect2.h + 1 }; // 1 - down_height1, 2 - right_1
    const _rects = [
      { rect: rect1, hvOrder: true },
      { rect: rect2, hvOrder: true },
      { rect: rect3, hvOrder: false },
      { rect: rect4, hvOrder: false },
    ];
    _rects.sort(({ rect: rect1 }, { rect: rect2 }) =>
      isRectBetter(rect1, rect2)
    );
    const [dir1, dir2] = _rects[0].hvOrder
      ? ["horizontal", "vertical"]
      : ["vertical", "horizontal"];
    rects.set(node, _rects[0].rect);
    childRect1.dir = dir1 as Direction;
    childRect2.dir = dir2 as Direction;
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
