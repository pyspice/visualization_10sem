import * as React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Container";
import Col from "react-bootstrap/Container";
import { GraphInput, GraphView, GraphViewProps } from "src/components";
import { getHVLayout, parseGraphML } from "src/utils";

export function TreeHV() {
  const ref = React.useRef<HTMLDivElement>(null);
  const redraw = (graphProps: GraphViewProps) => {
    const g = new GraphView(graphProps);
    g.draw(ref.current);
  };

  const [value, setValue] = React.useState("");
  const onChange = (value: string) => {
    setValue(value);
    const graph = parseGraphML(value);
    if (graph === undefined) return;

    const graphProps = getHVLayout(graph);
    redraw(graphProps);
  };

  return (
    <Container className="px-0 mx-0 mw-100 h-100">
      <Row className="main-container px-0 mx-0 mw-100 h-100">
        <Col className="main-left-panel h-100">
          <GraphInput value={value} onChange={onChange} />
        </Col>
        <Col className="main-content px-0 mx-0 h-100">
          <div className="w-100 h-100" ref={ref} />
        </Col>
      </Row>
    </Container>
  );
}
