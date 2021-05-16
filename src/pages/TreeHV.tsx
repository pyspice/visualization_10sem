import * as React from "react";
import { GraphInput } from "src/components";
import { Graph, parseGraphML } from "src/utils";

export function TreeHV() {
  const ref = React.useRef<HTMLDivElement>(null);
  const redraw = () => {
    const g = new Graph({
      nodes: new Map([
        ["n0", { x: 100, y: 100, radius: 3 }],
        ["n1", { x: 100, y: 200, radius: 3 }],
        ["n2", { x: 200, y: 100, radius: 3 }],
      ]),
      edges: [
        { from: "n0", to: "n1" },
        { from: "n0", to: "n2" },
      ],
    });
    g.draw(ref.current);
  };

  // componentDidMount
  React.useEffect(redraw, []);

  const [value, setValue] = React.useState("");
  const onChange = (value: string) => {
    setValue(value);
    const graph = parseGraphML(value);
    if (graph === undefined) return;
  };

  return (
    <div>
      <GraphInput value={value} onChange={onChange} />
      <div ref={ref} />
    </div>
  );
}
