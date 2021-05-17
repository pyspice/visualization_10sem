import * as d3 from "d3";

export type Point = {
  x: number;
  y: number;
  radius: number;
};
export type Edge = { from: string; to: string };

export interface GraphViewProps {
  nodes: Map<string, Point>;
  edges: Edge[];
}

export const NODE_FONT_SIZE = 14;
export const NODE_TEXT_PADDING_RIGHT = 4;
export const NODE_TEXT_PADDING_TOP = 4;
const NODE_FONT_FAMILY = "Bree Serif";
const NODE_FONT_SIZE_PX = `${NODE_FONT_SIZE}px`;

export const NODE_FONT = `${NODE_FONT_SIZE_PX} ${NODE_FONT_FAMILY}`;

export class GraphView {
  private readonly minX: number;
  private readonly minY: number;
  private readonly maxX: number;
  private readonly maxY: number;
  constructor(private readonly props: GraphViewProps) {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const { x, y } of props.nodes.values()) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  draw(node: HTMLElement) {
    const w = this.maxX - this.minX;
    const h = this.maxY - this.minY;

    // TODO: Вынести в отдельную компоненту, навесить Resizer
    const { width, height } = node.getBoundingClientRect();

    const vis = d3
      .select(node)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr(
        "viewBox",
        [this.minX - w / 2, this.minY - h / 2, w * 2, h * 2].join(" ")
      )
      .call(
        d3.zoom<SVGSVGElement, unknown>().on("zoom", function (e) {
          vis.attr("transform", e.transform);
        })
      )
      .append("g");

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
      .attr("y", ([, { y, radius }]) => y - radius - 1)
      .attr("font-family", NODE_FONT_FAMILY)
      .attr("font-size", NODE_FONT_SIZE_PX)
      .attr("fill", "black")
      .attr("text-anchor", "beginning");
  }
}
