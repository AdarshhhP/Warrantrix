import { useRef, type DragEvent, useState, useEffect, } from "react";
import { Button } from "./../ui/button";
import { Check, FileChartColumnIncreasing, Loader, Upload, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface FileUploadAreaProps {
  sizeLimit?: number|null;
  filetypes:string;
  setSelectedFile: (file: File | null) => void;
  selectedFile:File | null;
  uploadStatus: "idle" | "loading" | "success" | "error";
  setUploadStatus: (status: "idle" | "loading" | "success" | "error") => void;
  triggerUpload:()=>void;
}
type FileError = string | null;
/**
 * A component for uploading a file that provides a drag-and-drop interface, a file input field, and a button to trigger the upload.
 * @param {number|null} sizeLimit - The maximum size of the file to be uploaded in megabytes. If null, there is no limit.
 * @param {string} filetypes - A comma-separated list of the file types that are accepted.
 * @param {(file: File | null) => void} setSelectedFile - A function to be called when a file is selected or cleared.
 * @param {File | null} selectedFile - The currently selected file.
 * @param {"idle" | "loading" | "success" | "error"} uploadStatus - The status of the upload.
 * @param {("idle" | "loading" | "success" | "error")} setUploadStatus - A function to be called when the upload status changes.
 * @param {() => void} triggerUpload - A function to be called when the user clicks the upload button.
 */
export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  sizeLimit = null,
  filetypes,
  setSelectedFile,
  selectedFile,
  uploadStatus,
  setUploadStatus,
  triggerUpload,
}) => {
    const [fileName,setFileName] = useState<null|string>(null)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [error, setError] = useState<FileError>(null);
    
    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      handleFile(file);
    }
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    if (file) {
      handleFile(file)
    }
  };

  useEffect(() => {
    return () => {
      handleReset();
    }
  },[])
  const handleFile = (file: File | null) => {
    setError(null); // Reset error state

    if (!file) return;
    
    const maxSize = sizeLimit != null?sizeLimit * 1024 * 1024:null; // 100MB
    const allowedFormats = filetypes.split(",");
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    // Validate file type
    if (!allowedFormats.includes(`.${fileExtension}`)) {
      setError(`Invalid file format. Please upload ${allowedFormats} file.`);
      return;
    }

    // Validate file size
    if (maxSize != null && file.size > maxSize) {
      setError(`File size exceeds ${maxSize} MB.`);
      return;
    }

    // Everything is valid
    setFileName(file.name);
    setSelectedFile(file);
    // Handle further processing (e.g., upload file here)
  };

  const handleReset = () => {
    setFileName(null);
    setSelectedFile(null);
    setUploadStatus("idle");
  };
  const handleClick = () => {
    if(fileName == null)
      fileInputRef.current?.click();
  };

  return (
    <Card className="mb-4 shadow-xl ">
        <CardContent className="p-4 md:p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={handleClick}
          >
            {fileName == null ? (
              <>
                <div className="mx-auto w-fit mb-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Click here
                </label>
                <span className="text-muted-foreground">
                  {" "}
                to choose your file or drag and drop
                </span>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept={filetypes}
                  onChange={handleFileSelection}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Supported Format: {filetypes} {sizeLimit != null?"(max size: "+(sizeLimit * 1024 * 1024)+")":""}
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-wrap mx-auto content-center justify-center gap-2 md:flex-nowrap w-fit">
                  <div className="flex flex-col items-center  mb-2">
                    <div className="flex justify-end md:justify-end w-full">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleReset();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* <FileChartColumnIncreasing className="h-8 w-8 text-muted-foreground" /> */}
                    {uploadStatus === "loading" ? (
                      <Loader className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : uploadStatus === "success" ? (
                      <Check className="h-8 w-8 text-muted-foreground text-green-500" />
                    ) : uploadStatus === "error" ? (
                      <X className="h-8 w-8 text-muted-foreground text-red-500" />
                    ) : (
                      <FileChartColumnIncreasing className="h-8 w-8 text-muted-foreground" />
                    )}

                    <p className="text-sm text-muted-foreground mt-2">
                      {fileName}
                    </p>
                    {selectedFile && (
                      <div className=" text-sm text-muted-foreground">
                        <p>
                          <span className="font-semibold">Extension:</span>{" "}
                          {selectedFile.name.split(".").pop() || "Unknown"}
                        </p>
                        <p>
                          <span className="font-semibold">Size:</span>{" "}
                          {selectedFile.size < 1024
                            ? `${selectedFile.size} bytes`
                            : selectedFile.size < 1024 * 1024
                            ? `${(selectedFile.size / 1024).toFixed(2)} KB`
                            : `${(selectedFile.size / (1024 * 1024)).toFixed(
                                2
                              )} MB`}
                        </p>
                      </div>
                    )}
                    <Button
                      className="mt-2"
                      variant="outline"
                      onClick={triggerUpload}
                      disabled={
                        uploadStatus === "loading" || uploadStatus === "success"
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadStatus === "idle" && "Upload"}
                      {uploadStatus === "loading" && "Uploading..."}
                      {uploadStatus === "success" && "Success"}
                      {uploadStatus === "error" && "Try Again"}
                    </Button>
                  </div>
                </div>
              </>
            )}
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
  );
};
