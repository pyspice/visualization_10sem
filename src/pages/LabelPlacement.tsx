import * as React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Alert from "react-bootstrap/Alert";
import { FiInfo } from "react-icons/fi";
import { debounce } from "lodash";
import {
  UploadableTextInput,
  PointsView,
  PointsViewProps,
} from "src/components";
import { getLabelsLayout, parseLabelDesc } from "src/utils";

const popover = (
  <Popover id="popover-basic">
    <Popover.Title as="h3">Формат входных данных</Popover.Title>
    <Popover.Content>
      Текст в формате csv, постолбчато задающий координаты точек и размеры
      подписей.
      <br />
      {"Формат строки: <x>,<y>,<w>,<h>;"}
      <br />
      <strong>Пример:</strong>
      <br />
      100,100,60,12;
      <br />
      200,200,50,12
      <br />
      <strong>Позиционирование подписей</strong>
      <br />В данный момент подписи позиционируются сверху и снизу от точки, по
      своему центру:
      <svg
        width="100%"
        height={100}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 20"
        style={{ marginTop: 10 }}
      >
        <g fill="none">
          <rect
            x={0}
            y={0}
            width={40}
            height={10}
            strokeWidth={1}
            stroke="orange"
            fill="none"
          />
          <rect
            x={0}
            y={10}
            width={40}
            height={10}
            strokeWidth={1}
            stroke="brown"
            fill="none"
          />
          <circle cx={20} cy={10} r={2} fill="black" />
        </g>
      </svg>
    </Popover.Content>
  </Popover>
);

const Info = () => (
  <OverlayTrigger trigger="click" placement="right" overlay={popover}>
    {({ ref, ...props }) => (
      <div className="d-flex flex-row justify-content-center">
        <div className="me-1">Введите описание точек</div>
        <div ref={ref} {...props} style={{ cursor: "pointer" }}>
          <FiInfo />
        </div>
      </div>
    )}
  </OverlayTrigger>
);

export function LabelPlacement() {
  const [pointsProps, setPointsProps] = React.useState<PointsViewProps>({
    points: [],
  });
  const setPointsPropsDebouced = debounce(setPointsProps, 500);

  const [error, setError] = React.useState("");
  const [value, setValue] = React.useState("");
  const onChange = (value: string) => {
    setValue(value);
    if (value === "") {
      setError("");
      return;
    }

    const labels = parseLabelDesc(value);
    if (labels === undefined) {
      setError("Не удалось разобрать входной файл.");
      return;
    }

    const pointsProps = getLabelsLayout(labels);
    if (pointsProps === undefined) {
      setError("Не удалось найти расположение подписей.");
      return;
    }
    setError("");
    setPointsPropsDebouced(pointsProps);
  };

  return (
    <Container className="px-0 mx-0 mw-100 h-100">
      <Row className="main-container px-0 mx-0 mw-100 h-100">
        <Col className="main-left-panel h-100">
          <UploadableTextInput
            value={value}
            onChange={onChange}
            label={<Info />}
          />
        </Col>
        <Col className="main-content px-0 mx-0 h-100">
          {error ? (
            <Alert
              variant="danger"
            >
              {error}
            </Alert>
          ) : (
            <PointsView {...pointsProps} />
          )}
        </Col>
      </Row>
    </Container>
  );
}
