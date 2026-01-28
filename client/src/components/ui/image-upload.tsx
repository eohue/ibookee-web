import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    value?: string | string[]; // Allow array of strings
    onChange: (value: string | string[]) => void;
    disabled?: boolean;
    maxFiles?: number; // Optional limit
}

export function ImageUpload({ value, onChange, disabled, maxFiles = 1 }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Normalize value to array for consistent handling internally
    const values = Array.isArray(value) ? value : value ? [value] : [];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (maxFiles > 1 && values.length + files.length > maxFiles) {
            // alert or toast that limit reached
            return;
        }

        setIsUploading(true);
        const newUrls: string[] = [];

        try {
            // Upload sequentially or parallel
            for (const file of files) {
                const formData = new FormData();
                formData.append("image", file);
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();
                if (data.url) {
                    newUrls.push(data.url);
                }
            }

            if (maxFiles > 1) {
                onChange([...values, ...newUrls]);
            } else {
                onChange(newUrls[0]);
            }

        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeImage = (indexToRemove: number) => {
        if (maxFiles > 1) {
            const newValues = values.filter((_, i) => i !== indexToRemove);
            onChange(newValues);
        } else {
            onChange("");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Input
                type="file"
                accept="image/*,.svg"
                className="hidden"
                multiple={maxFiles > 1}
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
            />

            {maxFiles > 1 || values.length === 0 ? (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed flex flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading || (maxFiles > 1 && values.length >= maxFiles)}
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                {maxFiles > 1 ? `이미지 업로드 (${values.length}/${maxFiles})` : "이미지 업로드"}
                            </span>
                        </>
                    )}
                </Button>
            ) : null}

            {values.length > 0 && (
                <div className={`grid gap-4 ${maxFiles > 1 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}>
                    {values.map((url, index) => (
                        <div key={url + index} className="relative group aspect-square rounded-md border bg-muted overflow-hidden">
                            <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="!absolute top-2 right-2 h-6 w-6 !z-50 opacity-100 bg-destructive hover:bg-destructive/90 text-white rounded-full p-1"
                                onClick={() => removeImage(index)}
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
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
