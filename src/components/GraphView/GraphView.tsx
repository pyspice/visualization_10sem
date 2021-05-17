import * as d3 from "d3";
import { getTextWidth } from "src/utils";

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

const BASE_PADDING = 5;

export class GraphView {
  private readonly minX: number;
  private readonly minY: number;
  private readonly maxX: number;
  private readonly maxY: number;
  private readonly rightLabelMaxWidth: number;
  private readonly leftNodeMaxRadius: number;
  private readonly bottomNodeMaxRadius: number;

  constructor(private readonly props: GraphViewProps) {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let rightLabelMaxWidth = Number.NEGATIVE_INFINITY;
    let leftNodeMaxRadius = Number.NEGATIVE_INFINITY;
    let bottomNodeMaxRadius = Number.NEGATIVE_INFINITY;

    for (const [node, { x, y, radius }] of props.nodes.entries()) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      if (maxX === x) {
        rightLabelMaxWidth = Math.max(
          rightLabelMaxWidth,
          getTextWidth(node, NODE_FONT)
        );
      }
      if (minX === x) {
        leftNodeMaxRadius = Math.max(leftNodeMaxRadius, radius);
      }

      if (maxY === y) {
        bottomNodeMaxRadius = Math.max(bottomNodeMaxRadius, radius);
      }
    }

    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
    this.rightLabelMaxWidth = rightLabelMaxWidth;
    this.leftNodeMaxRadius = leftNodeMaxRadius;
    this.bottomNodeMaxRadius = bottomNodeMaxRadius;
  }

  draw(node: HTMLElement) {
    const w = this.maxX - this.minX;
    const h = this.maxY - this.minY;

    // TODO: Вынести в отдельную компоненту, навесить Resizer
    const { width, height } = node.getBoundingClientRect();

    const vis = d3
      .select(node)
      .append("svg")
      .attr("cursor", "move")
      .attr("width", width)
      .attr("height", height)
      .attr(
        "viewBox",
        [
          this.minX - this.leftNodeMaxRadius - BASE_PADDING,
          this.minY - NODE_FONT_SIZE - BASE_PADDING,
          w +
            this.rightLabelMaxWidth +
            this.leftNodeMaxRadius +
            BASE_PADDING * 2,
          h + NODE_FONT_SIZE + this.bottomNodeMaxRadius + BASE_PADDING * 2,
        ].join(" ")
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
