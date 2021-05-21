import "./UploadableTextInput.css";
import Form from "react-bootstrap/Form";

export type UploadableTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: React.ReactNode;
  accept?: string;
};

export function UploadableTextInput({
  value,
  onChange,
  label,
  accept,
}: UploadableTextInputProps) {
  const onChangeFile = ({
    target: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const file = files?.[0];
    if (file === undefined) return;

    var reader = new FileReader();

    reader.onload = (function (file) {
      return function (e: ProgressEvent<FileReader>) {
        onChange(e.target.result as string);
      };
    })(file);

    reader.readAsText(file);
  };

  return (
    <Form className="d-flex flex-column h-100 py-1">
      <Form.Group className="uploadable-text-input-textarea">
        <Form.Label className="text-center w-100">{label}</Form.Label>
        <Form.Control
          as="textarea"
          rows={12}
          value={value}
          onChange={({ target: { value } }) => onChange(value)}
        />
      </Form.Group>
      <Form.Group className="uploadable-text-input-file border-top border-secondary w-100">
        <Form.File
          className="text-center"
          accept={accept}
          onChange={onChangeFile}
        />
      </Form.Group>
    </Form>
  );
}
