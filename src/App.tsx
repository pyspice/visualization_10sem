import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Container";
import Col from "react-bootstrap/Container";
import { Pages } from "./pages";

function App() {
  return (
    <Container className="d-flex flex-column border border-secondary px-0 mx-0 mw-100">
      <Row className="bg-primary mw-100">
        <Col>
          <h1 className="text-light">
            Сдача заданий по методам визуализации данных
          </h1>
          <p className="text-light">Винокуров Сергей Сергеевич</p>
        </Col>
      </Row>
      <Row className="content align-self-stretch px-0 mx-0 mw-100">
        <Pages />
      </Row>
      <Row className="footer bg-secondary mw-100">
        <Col className="position-relative mw-100">
          <a className="text-light position-absolute r-0" href="https://github.com/pyspice/visualization_10sem">Github repo</a>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
