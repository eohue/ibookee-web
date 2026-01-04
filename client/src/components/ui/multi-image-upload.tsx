import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Image as ImageIcon, Plus } from "lucide-react";

interface MultiImageUploadProps {
    value?: string[];
    onChange: (value: string[]) => void;
    disabled?: boolean;
}

export function MultiImageUpload({ value = [], onChange, disabled }: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newUrls: string[] = [];

        try {
            // Upload files sequentially or in parallel
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("image", files[i]);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    console.error(`Failed to upload ${files[i].name}`);
                    continue;
                }

                const data = await res.json();
                newUrls.push(data.url);
            }

            if (newUrls.length > 0) {
                onChange([...value, ...newUrls]);
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
        onChange(value.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {value.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group aspect-square rounded-md border bg-muted overflow-hidden">
                        <img
                            src={url}
                            alt={`Partner Logo ${index + 1}`}
                            className="h-full w-full object-contain p-2"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => removeImage(index)}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    className="aspect-square flex flex-col items-center justify-center gap-2 border-dashed h-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Plus className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">로고 추가</span>
                        </>
                    )}
                </Button>
            </div>

            <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
            />
        </div>
    );
}
