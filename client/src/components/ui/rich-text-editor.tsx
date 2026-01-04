import { useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { marked } from "marked";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
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
            quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
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

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
        ],
    };

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
    ];

    return (
        <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            className={className}
        />
    );
}
