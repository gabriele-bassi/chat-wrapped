
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploaderProps {
  onFileUpload: (content: string) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "text/plain") {
      toast({
        title: "Formato file non supportato",
        description: "Per favore carica un file di testo (.txt)",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        onFileUpload(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="border-2 border-dashed rounded-lg">
        <CardContent className="p-6">
          <div
            className={`flex flex-col items-center justify-center p-8 rounded-md transition-all duration-200 ${
              isDragging ? "bg-accent" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mb-4 p-4 bg-primary/10 rounded-full">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Carica il tuo file di chat</h3>
            <p className="text-muted-foreground text-center mb-4">
              Trascina qui il tuo file .txt oppure clicca per selezionarlo
            </p>
            
            {fileName ? (
              <div className="text-sm font-medium text-primary">{fileName}</div>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            
            <Button 
              onClick={triggerFileInput} 
              className="mt-4"
              disabled={isLoading}
            >
              Seleziona File
            </Button>
          </div>
        </CardContent>
      </Card>

      {fileName && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>File caricato: <span className="font-medium">{fileName}</span></p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
