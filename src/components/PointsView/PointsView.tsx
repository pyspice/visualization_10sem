import * as React from "react";
import * as d3 from "d3";
import Form from "react-bootstrap/Form";

export type Point = {
  x: number;
  y: number;

  labelWidth: number;
  labelHeight: number;

  labelDx: number;
  labelDy: number;
};

export interface PointsViewProps {
  points: Point[];
}

type PointsViewState = {
  enableZoom: boolean;
};

export class PointsView extends React.Component<
  PointsViewProps,
  PointsViewState
> {
  private ref = React.createRef<HTMLDivElement>();
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  state = { enableZoom: false };

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate() {
    this.svg.remove();
    this.draw();
  }

  render() {
    return (
      <div
        className="h-100 w-100 d-flex flex-column align-items-center justify-content-center"
        ref={this.ref}
      >
        <Form.Check
          onChange={() => this.setState({ enableZoom: !this.state.enableZoom })}
          type="checkbox"
          label="Масштабирование"
        />
      </div>
    );
  }

  private draw() {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    const { points } = this.props;
    for (const { x, y, labelWidth, labelHeight, labelDx, labelDy } of points) {
      minX = Math.min(minX, x - labelDx);
      minY = Math.min(minY, y - labelDy);
      maxX = Math.max(maxX, x - labelDx + labelWidth);
      maxY = Math.max(maxY, y - labelDy + labelHeight);
    }

    const node = this.ref.current;

    this.svg = d3
      .select(node)
      .append("svg")
      .attr("width", 500)
      .attr("height", 500)
      .style("box-shadow", "rgb(0, 0, 0, 0.5) 1px 1px 4px");

    if (this.state.enableZoom) {
      this.svg = this.svg
        .attr("viewBox", [-10, -10, 520, 520].join(" "))
        .attr("cursor", "move")
        .call(
          d3.zoom<SVGSVGElement, unknown>().on("zoom", function (e) {
            vis.attr("transform", e.transform);
          })
        );
    } else {
      this.svg = this.svg.attr("viewBox", [0, 0, 500, 500].join(" "));
    }

    const vis = this.svg.append("g");
    vis
      .append("pattern")
      .attr("id", "diagonalHatch")
      .attr("width", 4)
      .attr("height", 4)
      .attr("patternUnits", "userSpaceOnUse")
      .append("path")
      .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
      .style("stroke", "red")
      .style("stroke-width", 1);
    vis
      .append("rect")
      .attr("x", -50000)
      .attr("y", -50000)
      .attr("width", 100500)
      .attr("height", 100500)
      .attr("stroke", "red")
      .attr("stroke-width", 0)
      .attr("fill", "url(#diagonalHatch)");
    vis
      .append("rect")
      .attr("x", -1)
      .attr("y", -1)
      .attr("width", 502)
      .attr("height", 502)
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("fill", "white");

    vis
      .selectAll("circle .nodes")
      .data(points)
      .enter()
      .append("svg:circle")
      .attr("class", "nodes")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 1)
      .attr("stroke", "black");

    vis
      .selectAll(".rect")
      .data(points)
      .enter()
      .append("rect")
      .attr("x", (d) => d.x - d.labelDx)
      .attr("y", (d) => d.y - d.labelDy)
      .attr("width", (d) => d.labelWidth)
      .attr("height", (d) => d.labelHeight)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none");
  }
}
