import { Point, PointsViewProps } from "src/components";
import { Label } from "./parseLabelDesc";

type Rect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

function getConfig(
  preSolution: Map<string, boolean>,
  nodes: string[],
  edges: Map<string, string[]>,
  edgesT: Map<string, string[]>
): Map<string, boolean> {
  const order: string[] = [];
  const used = new Set<string>();

  function dfs1(node: string) {
    used.add(node);
    for (const child of edges.get(node)) {
      if (!used.has(child)) dfs1(child);
    }
    order.push(node);
  }

  const colors = new Map<string, number>();
  function dfs2(node: string, color: number) {
    colors.set(node, color);
    for (const child of edgesT.get(node)) {
      if (!colors.has(child)) dfs2(child, color);
    }
  }

  for (const [node] of [...preSolution.entries()].sort(([, val1], [, val2]) =>
    val1 && !val2 ? -1 : val2 && !val1 ? 1 : 0
  )) {
    if (!used.has(node)) dfs1(node);
  }
  for (const node of nodes) {
    if (!used.has(node)) dfs1(node);
  }

  for (let i = 0, color = 0; i < nodes.length; ++i) {
    const node = order[nodes.length - i - 1];
    if (!colors.has(node)) dfs2(node, color++);
  }

  const solution = new Map<string, boolean>();
  for (const node of nodes) {
    const comp = getNodeComp(node);

    const cNode = colors.get(node) ?? -1,
      cComp = colors.get(comp) ?? -1;
    if (cNode === cComp) return undefined;
    if (preSolution.has(node)) {
      const val = cNode > cComp;
      if (preSolution.get(node) !== val) return undefined;
    }
    solution.set(node, cNode > cComp);
    solution.set(comp, cNode < cComp);
  }

  return solution;
}

function getStatId(index: number): string {
  return `${index}`;
}

function getCompId(index: number): string {
  return `_${index}`;
}

function getNodeComp(id: string): string {
  if (id[0] === "_") return id.slice(1);
  return `_${id}`;
}

function getNodeIdx(id: string): number {
  if (id[0] === "_") return parseInt(id.slice(1));
  return parseInt(id);
}

function areRectsIntersects(r1: Rect, r2: Rect): boolean {
  return !(
    r2.left >= r1.right ||
    r2.right <= r1.left ||
    r2.top >= r1.bottom ||
    r2.bottom <= r1.top
  );
}

function isSubrect(sub: Rect, rect: Rect): boolean {
  return !(
    sub.left < rect.left ||
    sub.right > rect.right ||
    sub.top < rect.top ||
    sub.bottom > rect.bottom
  );
}

// TODO: ???????????????????????? ????????????
const CANVAS_RECT = { left: 0, top: 0, right: 500, bottom: 500 };

export function getLabelsLayout(labels: Label[]): PointsViewProps {
  const nodes: string[] = [];
  const rects: Rect[] = [];
  const edges = new Map<string, string[]>();
  const edgesT = new Map<string, string[]>();
  const solution = new Map<string, boolean>();
  for (let i = 0; i < labels.length; ++i) {
    const { w, h, p1, p2 } = labels[i];

    const rect1 = {
      left: p1.x,
      top: p1.y,
      right: p1.x + w,
      bottom: p1.y + h,
    };
    const stat = getStatId(i);
    let statIsOutside = !isSubrect(rect1, CANVAS_RECT);
    nodes.push(stat);
    edges.set(stat, []);
    edgesT.set(stat, []);
    rects.push(rect1);

    const rect2 = {
      left: p2.x,
      top: p2.y,
      right: p2.x + w,
      bottom: p2.y + h,
    };
    const comp = getCompId(i);
    let compIsOutside = !isSubrect(rect2, CANVAS_RECT);
    nodes.push(comp);
    edges.set(comp, []);
    edgesT.set(comp, []);
    rects.push(rect2);

    if (statIsOutside && compIsOutside) return undefined;
    if (statIsOutside) {
      solution.set(stat, false);
      solution.set(comp, true);
    } else if (compIsOutside) {
      solution.set(stat, true);
      solution.set(comp, false);
    }
  }

  for (let i = 0; i < rects.length; ++i) {
    for (let j = i + 1; j < rects.length; ++j) {
      if (areRectsIntersects(rects[i], rects[j])) {
        const iComp = getNodeComp(nodes[i]);
        const jComp = getNodeComp(nodes[j]);

        edges.get(nodes[i])?.push(jComp);
        edges.get(nodes[j])?.push(iComp);

        edgesT.get(jComp)?.push(nodes[i]);
        edgesT.get(iComp)?.push(nodes[j]);
      }
    }
  }

  const config = getConfig(solution, nodes, edges, edgesT);
  if (config === undefined) return undefined;
  const points: Point[] = [];
  for (let i = 0; i < nodes.length; ++i) {
    if (config.get(nodes[i])) {
      const label = labels[getNodeIdx(nodes[i])];
      const rect = rects[i];
      points.push({
        x: label.x,
        y: label.y,
        labelWidth: label.w,
        labelHeight: label.h,
        labelDx: label.x - rect.left,
        labelDy: label.y - rect.top,
      });
    }
  }

  return { points };
}
