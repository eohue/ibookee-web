import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, FileText } from "lucide-react";

interface FileUploadProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    accept?: string;
    label?: string;
}

export function FileUpload({
    value,
    onChange,
    disabled,
    accept = ".pdf,image/*", // Default to PDF and images
    label = "파일 업로드"
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file); // API expects "image" field name currently

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            onChange(data.url);
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const clearFile = () => {
        onChange("");
    };

    const getFileName = (url: string) => {
        const parts = url.split('/');
        return parts[parts.length - 1];
    };

    return (
        <div className="flex flex-col gap-4">
            <Input
                type="file"
                accept={accept}
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
            />

            {!value ? (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-dashed flex flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-muted-foreground">{label}</span>
                        </>
                    )}
                </Button>
            ) : (
                <div className="relative group border rounded-md p-4 flex items-center gap-4 bg-muted/20">
                    <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-full">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {getFileName(value)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {value}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={clearFile}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
