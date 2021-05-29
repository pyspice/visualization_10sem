import * as React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { debounce } from "lodash";
import { UploadableTextInput, GraphView, GraphViewProps } from "src/components";
import { getHVLayout, parseGraphML } from "src/utils";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { FiInfo } from "react-icons/fi";

const popover = (
  <Popover id="popover-basic">
    <Popover.Title as="h3">Формат входных данных</Popover.Title>
    <Popover.Content>
      Текст в формате GraphML, либо текстовый файл с расширением "xml".
      <br />
      <strong>Пример:</strong>
      <br />
      {'<graphml>'}
      <br />
      {'  <graph>'}
      <br />
      {'    <node id="n0"/>'}
      <br />
      {'    <node id="n1"/>'}
      <br />
      {'    <edge source="n0" target="n1"/>'}
      <br />
      {'  </graph>'}
      <br />
      {'</graphml>'}
      <br />
      <strong></strong>
      <br />
      Алгоритм пытается учесть длину имени вершины.
    </Popover.Content>
  </Popover>
);

const Info = () => (
  <OverlayTrigger trigger="click" placement="right" overlay={popover}>
    {({ ref, ...props }) => (
      <div className="d-flex flex-row justify-content-center">
        <div className="me-1">Введите граф в формате GraphML</div>
        <div ref={ref} {...props} style={{ cursor: "pointer" }}>
          <FiInfo />
        </div>
      </div>
    )}
  </OverlayTrigger>
);

export function TreeHV() {
  const [graphProps, setGraphProps] = React.useState<GraphViewProps>({
    nodes: new Map(),
    edges: [],
  });

  const setGraphPropsDebounced = debounce(setGraphProps, 500);

  const [value, setValue] = React.useState("");
  const onChange = (value: string) => {
    setValue(value);
    const graph = parseGraphML(value);
    if (graph === undefined) return;

    const graphProps = getHVLayout(graph);
    setGraphPropsDebounced(graphProps);
  };

  return (
    <Container className="px-0 mx-0 mw-100 h-100">
      <Row className="main-container px-0 mx-0 mw-100 h-100">
        <Col className="main-left-panel h-100">
          <UploadableTextInput
            value={value}
            onChange={onChange}
            label={<Info />}
            accept="text/xml"
          />
        </Col>
        <Col className="main-content px-0 mx-0 h-100">
          <GraphView {...graphProps} />
        </Col>
      </Row>
    </Container>
  );
}
