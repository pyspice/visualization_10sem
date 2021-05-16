let canvas: HTMLCanvasElement;

export function getTextWidth(text: string, font: string): number {
  if (canvas === undefined) canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}
