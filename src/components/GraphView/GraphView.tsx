import * as React from "react";
import * as d3 from "d3";
import { withResizeDetector } from "react-resize-detector";
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

interface GraphViewCollectedProps {
  width: number;
  height: number;
}

export const NODE_FONT_SIZE = 14;
export const NODE_TEXT_PADDING_RIGHT = 4;
export const NODE_TEXT_PADDING_TOP = 4;
const NODE_FONT_FAMILY = "Bree Serif";
const NODE_FONT_SIZE_PX = `${NODE_FONT_SIZE}px`;

export const NODE_FONT = `${NODE_FONT_SIZE_PX} ${NODE_FONT_FAMILY}`;

const BASE_PADDING = 5;

class _GraphView extends React.Component<
  GraphViewProps & Partial<GraphViewCollectedProps>
> {
  private ref = React.createRef<HTMLDivElement>();
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate() {
    this.svg.remove();
    this.draw();
  }

  render() {
    return <div className="h-100 w-100" ref={this.ref} />;
  }

  private draw() {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let rightLabelMaxWidth = Number.NEGATIVE_INFINITY;
    let leftNodeMaxRadius = Number.NEGATIVE_INFINITY;
    let bottomNodeMaxRadius = Number.NEGATIVE_INFINITY;

    for (const [node, { x, y, radius }] of this.props.nodes.entries()) {
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

    const node = this.ref.current;

    const w = maxX - minX;
    const h = maxY - minY;

    const { width, height, nodes, edges } = this.props;

    this.svg = d3
      .select(node)
      .append("svg")
      .attr("cursor", "move")
      .attr("width", width)
      .attr("height", height)
      .attr(
        "viewBox",
        [
          minX - leftNodeMaxRadius - BASE_PADDING,
          minY - NODE_FONT_SIZE - BASE_PADDING,
          w + rightLabelMaxWidth + leftNodeMaxRadius + BASE_PADDING * 2,
          h + NODE_FONT_SIZE + bottomNodeMaxRadius + BASE_PADDING * 2,
        ].join(" ")
      )
      .call(
        d3.zoom<SVGSVGElement, unknown>().on("zoom", function (e) {
          vis.attr("transform", e.transform);
        })
      );

    const vis = this.svg.append("g");
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

export const GraphView = withResizeDetector(_GraphView);
