import "./GraphInput.css";
import Form from "react-bootstrap/Form";

export type GraphInputProps = {
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
};

export function GraphInput(props: GraphInputProps) {
  const onChangeFile = ({
    target: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const file = files?.[0];
    if (file === undefined) return;

    var reader = new FileReader();

    reader.onload = (function (file) {
      return function (e: ProgressEvent<FileReader>) {
        props.onChange(e.target.result as string);
      };
    })(file);

    reader.readAsText(file);
  };

  return (
    <Form className="d-flex flex-column h-100 py-1">
      <Form.Group className="graph-input-textarea">
        <Form.Label className="text-center w-100">
          Введите граф в формате GraphML
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={8}
          value={props.value}
          defaultValue={props.defaultValue}
          onChange={({ target: { value } }) => props.onChange(value)}
        />
      </Form.Group>
      <Form.Group className="graph-input-file border-top border-secondary w-100">
        <Form.File
          className="text-center"
          accept="text/xml"
          onChange={onChangeFile}
        />
      </Form.Group>
    </Form>
  );
}
