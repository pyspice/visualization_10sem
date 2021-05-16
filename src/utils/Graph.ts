import * as d3 from "d3";

export type Point = {
  x: number;
  y: number;
  radius: number;
};
export type Edge = { from: string; to: string };

export interface GraphProps {
  nodes: Map<string, Point>;
  edges: Edge[];
}

const NODE_FONT_FAMILY = "Bree Serif";
const NODE_FONT_SIZE = "14px";

export const NODE_FONT = `${NODE_FONT_SIZE} ${NODE_FONT_FAMILY}`;

export class Graph {
  constructor(private readonly props: GraphProps) {}

  private drawed: Map<
    HTMLElement,
    d3.Selection<SVGSVGElement, unknown, null, undefined>
  > = new Map();

  draw(node: HTMLElement) {
    if (this.drawed.has(node)) return;

    const vis = d3.select(node).append("svg");

    const w = 900;
    const h = 400;
    vis.attr("width", w).attr("height", h);

    const { nodes, edges } = this.props;
    vis
      .selectAll("circle .nodes")
      .data(nodes.values())
      .enter()
      .append("svg:circle")
      .attr("class", "nodes")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.radius)
      .attr("stroke", "black");

    vis
      .selectAll(".line")
      .data(edges)
      .enter()
      .append("line")
      .attr("x1", (d) => nodes.get(d.from).x)
      .attr("y1", (d) => nodes.get(d.from).y)
      .attr("x2", (d) => nodes.get(d.to).x)
      .attr("y2", (d) => nodes.get(d.to).y)
      .style("stroke", "black");

    vis
      .selectAll("text")
      .data(nodes.entries())
      .enter()
      .append("text")
      .text(([name]) => {
        return name;
      })
      .attr("x", ([, { x, radius }]) => x + radius)
      .attr("y", ([, { y, radius }]) => y - radius)
      .attr("font-family", NODE_FONT_FAMILY)
      .attr("font-size", NODE_FONT_SIZE)
      .attr("fill", "black")
      .attr("text-anchor", "beginning");

    this.drawed.set(node, vis);
  }

  remove(node: HTMLElement) {
    this.drawed.get(node).remove();
    this.drawed.delete(node);
  }
}
