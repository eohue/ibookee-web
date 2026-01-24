import { useRef, useEffect, useMemo } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { marked } from "marked";

// Register Video Blot for embed support
const BlockEmbed = Quill.import("blots/block/embed");

class VideoBlot extends BlockEmbed {
    static blotName = "video";
    static tagName = "div";
    static className = "ql-video-wrapper";

    static create(value: string) {
        const node = super.create() as HTMLElement;
        const iframe = document.createElement("iframe");

        // Convert URL to embed URL if needed
        const embedUrl = VideoBlot.sanitize(value);

        iframe.setAttribute("src", embedUrl);
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "true");
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
        iframe.style.width = "100%";
        iframe.style.aspectRatio = "16/9";

        node.appendChild(iframe);
        return node;
    }

    static value(node: HTMLElement) {
        const iframe = node.querySelector("iframe");
        return iframe ? iframe.getAttribute("src") : "";
    }

    static sanitize(url: string) {
        // YouTube URL conversion
        const youtubeMatch = url.match(
            /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }

        // Vimeo URL conversion
        const vimeoMatch = url.match(
            /(?:vimeo\.com\/)(\d+)/
        );
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        // Return as-is if already embed URL or other
        return url;
    }
}

Quill.register(VideoBlot);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

// Custom handler for image upload
function imageHandler(this: { quill: any }) {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
        const file = input.files ? input.files[0] : null;
        if (file) {
            const formData = new FormData();
            formData.append("image", file);

            try {
                // Show loading placeholder or similar could be better, but keep it simple
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) throw new Error("Upload failed");

                const data = await res.json();
                const url = data.url;

                const range = this.quill.getSelection(true);
                this.quill.insertEmbed(range.index, "image", url, "user");
                this.quill.setSelection(range.index + 1);
            } catch (error) {
                console.error("Image upload failed:", error);
                alert("이미지 업로드에 실패했습니다.");
            }
        }
    };
}

// Custom handler for video embed
function videoHandler(this: { quill: any }) {
    const url = prompt("임베드할 영상 URL을 입력하세요 (YouTube, Vimeo 등):");
    if (url) {
        const range = this.quill.getSelection(true);
        this.quill.insertEmbed(range.index, "video", url, "user");
        this.quill.setSelection(range.index + 1, "silent");
    }
}

export function RichTextEditor({
    value,
    onChange,
    placeholder,
    className,
}: RichTextEditorProps) {
    const quillRef = useRef<ReactQuill>(null);

    useEffect(() => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();

            // Add a custom matcher to intercept text paste
            quill.clipboard.addMatcher(Node.TEXT_NODE, (node: any, delta: any) => {
                const text = node.data;
                // Simple check if it looks like markdown
                if (text && (
                    text.includes("#") ||
                    text.includes("**") ||
                    text.includes("- ") ||
                    text.includes("`") ||
                    text.includes("> ")
                )) {
                    try {
                        const html = marked.parse(text);
                        // Convert HTML to Delta
                        const pastedDelta = quill.clipboard.convert(html as string);
                        return pastedDelta;
                    } catch (e) {
                        console.error("Markdown parse error", e);
                    }
                }
                return delta;
            });
        }
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image", "video"],
                ["clean"],
            ],
            handlers: {
                image: imageHandler,
                video: videoHandler,
            },
        },
    }), []);

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "link",
        "image",
        "video",
    ];

    return (
        <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={(content, delta, source, editor) => {
                if (source === 'user') {
                    onChange(content);
                }
            }}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            className={className}
        />
    );
}
