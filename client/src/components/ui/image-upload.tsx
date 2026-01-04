import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

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
            // Ideally show toast here, but we'll leave it to parent or console for now
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const clearImage = () => {
        onChange("");
    };

    return (
        <div className="flex flex-col gap-4">
            <Input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
            />

            {!value ? (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed flex flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-muted-foreground">이미지 업로드</span>
                        </>
                    )}
                </Button>
            ) : (
                <div className="relative group">
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                        <img
                            src={value}
                            alt="Preview"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={clearImage}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Fallback to text input for manual URL if needed - optional */}
            {/* 
      <div className="flex items-center gap-2">
         <span className="text-xs text-muted-foreground">OR</span>
         <Input 
           placeholder="https://..." 
           value={value} 
           onChange={(e) => onChange(e.target.value)}
         />
      </div>
      */}
        </div>
    );
}
