import { parse } from "fast-xml-parser";

type GraphMLNode = {
  "@_id"?: string;
};

type GraphMLEdge = {
  "@_id": string;
  "@_source": string;
  "@_target": string;
};

type GraphML = {
  graphml: {
    graph: {
      "@_id"?: string;
      edge?: GraphMLEdge | GraphMLEdge[];
      node?: GraphMLNode | GraphMLNode[];
    };
  };
};

type Edge = { from: string; to: string };

export type Graph = {
  nodes: Set<string>;
  edges: Map<string, Edge>;
};

function getProp<T>(
  obj: T,
  propName: keyof T,
  throwError: boolean = true
): T[keyof T] {
  const prop = obj[propName];
  if (prop === undefined && throwError) {
    throw Error(`No ${propName} specified for object ${obj}`);
  }
  return prop;
}

function getParsedGraph(graphJson: GraphML): Graph {
  if (graphJson.graphml === undefined) throw Error("No graphml tag specified");
  if (graphJson.graphml.graph === undefined)
    throw Error("No graph tag specified");
  let { node, edge } = graphJson.graphml.graph;

  const nodes = new Set<string>();
  if (node !== undefined) {
    if (!Array.isArray(node)) node = [node];
    node.forEach((node) => {
      const nodeName = getProp(node, "@_id");
      nodes.add(nodeName);
    });
  }

  const edges = new Map<string, Edge>();
  if (edge !== undefined) {
    if (!Array.isArray(edge)) edge = [edge];
    edge.forEach((edge) => {
      const id = getProp(edge, "@_id");
      const from = getProp(edge, "@_source");
      if (!nodes.has(from)) throw Error(`Node ${from} was not specified`);
      const to = getProp(edge, "@_target");
      if (!nodes.has(to)) throw Error(`Node ${to} was not specified`);

      edges.set(id, { from, to });
    });
  }

  return { nodes, edges };
}

export function parseGraphML(xml: string): Graph | undefined {
  try {
    const graphJson = parse(xml, { ignoreAttributes: false });
    return getParsedGraph(graphJson);
  } catch {
    return undefined;
  }
}
