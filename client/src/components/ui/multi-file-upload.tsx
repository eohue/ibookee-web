import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, FileText } from "lucide-react";

export interface FileAttachment {
    url: string;
    originalName: string;
}

interface MultiFileUploadProps {
    value?: FileAttachment[];
    onChange: (value: FileAttachment[]) => void;
    disabled?: boolean;
    accept?: string;
    label?: string;
}

export function MultiFileUpload({
    value = [],
    onChange,
    disabled,
    accept = ".pdf,.doc,.docx,.hwp",
    label = "파일 업로드"
}: MultiFileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const newAttachments: FileAttachment[] = [];

        try {
            // Upload files one by one (or could be batch if API supports, but /api/upload is single)
            for (const file of files) {
                const formData = new FormData();
                formData.append("image", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    throw new Error("Upload failed");
                }

                const data = await res.json();
                newAttachments.push({ url: data.url, originalName: data.originalName || file.name });
            }

            onChange([...(value || []), ...newAttachments]);
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeFile = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove));
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
                multiple
            />

            {/* List of uploaded files */}
            {value.length > 0 && (
                <div className="space-y-2">
                    {value.map((file, index) => (
                        <div key={index} className="relative group border rounded-md p-4 flex items-center gap-4 bg-muted/20">
                            <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-full flex-shrink-0">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {file.originalName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {file.url}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/90"
                                onClick={() => removeFile(index)}
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

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
        </div>
    );
}
