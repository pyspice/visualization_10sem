export type Label = {
  x: number;
  y: number;
  w: number;
  h: number;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
};

/**
 * Пока что считаем, что позиций две - сверху и снизу от точки.
 */
export function parseLabelDesc(desc: string): Label[] {
  const labels = desc.split(";").map((line) => {
    const splitted = line.split(",");
    if (splitted.length !== 4) return undefined;
    const parsed = splitted.map((n) => parseInt(n));
    if (parsed.some((n) => isNaN(n))) return undefined;
    const [x, y, w, h] = splitted.map((n) => parseInt(n));
    return {
      x,
      y,
      w,
      h,
      p1: { x: x - w / 2, y: y - h },
      p2: { x: x - w / 2, y },
    };
  });

  if (labels.some((x) => x === undefined)) return undefined;
  return labels;
}
