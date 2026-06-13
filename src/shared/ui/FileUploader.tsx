import { Upload } from "lucide-react";
import { type ChangeEvent } from "react";

type FileUploaderProps = {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
};

export function FileUploader({
  accept,
  multiple = false,
  onFilesSelected
}: FileUploaderProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    onFilesSelected(files);
    event.target.value = "";
  }

  return (
    <label className="file-uploader">
      <Upload size={20} />
      <span>Choose files</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />
    </label>
  );
}

