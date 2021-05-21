import "./Pages.css";

import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { TreeHV } from "./TreeHV";
import { LabelPlacement } from "./LabelPlacement";

export function Pages() {
  return (
    <Tabs defaultActiveKey="1">
      <Tab eventKey="1" title="Задание 1">
        <TreeHV />
      </Tab>
      <Tab eventKey="2" title="Задание 2" disabled></Tab>
      <Tab eventKey="3" title="Задание 3">
        <LabelPlacement />
      </Tab>
    </Tabs>
  );
}
