import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { toast } from 'react-toastify';

const CodeEditor = ({ projectId, selectedFile, username }) => {
    const [fileContent, setFileContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cursors, setCursors] = useState({}); // { username: { lineNumber, column } }
    const ws = useRef(null);
    const editorRef = useRef(null);
    const decorationsRef = useRef({}); // Store decoration IDs for each user
    const saveTimeoutRef = useRef(null);
    const lastSavedContentRef = useRef("");

    useEffect(() => {
        if (selectedFile && projectId) {
            loadFileContent();
            setupWebSocket();
        }

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            // Clear any pending save timeouts when unmounting
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [selectedFile, projectId]);

    useEffect(() => {
        // Update decorations when cursors change
        if (editorRef.current) {
            updateCursors();
        }
    }, [cursors]);

    const loadFileContent = async () => {
        if (!selectedFile) return;
        const token = localStorage.getItem("accessToken");

        try {
            setIsLoading(true);
            const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/files/${selectedFile.id}/content/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error(`Error ${response.status}: Failed to fetch file content`);

            const data = await response.json();
            setFileContent(data.content);
            lastSavedContentRef.current = data.content; // Track the last saved content
        } catch (error) {
            console.error("Error loading file:", error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const saveFile = async (contentToSave) => {
        if (!selectedFile) return;
        const token = localStorage.getItem("accessToken");
    
        // Don't save if content hasn't changed
        if (contentToSave === lastSavedContentRef.current) {
            return;
        }
    
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/files/${selectedFile.id}/content/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ content: contentToSave }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to save file');
            }
    
            lastSavedContentRef.current = contentToSave; // Update the last saved content
            toast.success("File saved", { autoClose: 1000 });
            
            // Dispatch custom event to notify that a file has been saved
            window.dispatchEvent(new CustomEvent('file-saved', {
                detail: {
                    fileId: selectedFile.id,
                    content: contentToSave
                }
            }));
        } catch (error) {
            console.error("Error saving file:", error);
            toast.error("Failed to save file");
        }
    };

    const setupWebSocket = () => {
        if (!selectedFile) return;
        if (ws.current) {
            ws.current.close();
        }

        ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/collaborators/${projectId}/`);

        ws.current.onopen = () => {
            ws.current.send(JSON.stringify({
                type: "identify",
                sender: username || "Anonymous",
                file_id: selectedFile.id
            }));
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "code_update" && data.file_id === selectedFile.id && data.sender !== username) {
                setFileContent(data.content);
                lastSavedContentRef.current = data.content; // Update last saved content
            }

            if (data.type === "cursor_update" && data.file_id === selectedFile.id && data.sender !== username) {
                setCursors(prev => ({ ...prev, [data.sender]: data.position }));
            }
        };
    };

    const handleEditorChange = (value) => {
        setFileContent(value);
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: "code_update",
                sender: username || "Anonymous",
                file_id: selectedFile.id,
                content: value
            }));
        }
        
        // Implement autosave with debounce
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Save after 1500ms of inactivity
        saveTimeoutRef.current = setTimeout(() => {
            saveFile(value);
        }, 1500);
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition(e => {
            sendCursorPosition(e.position);
        });
    };

    const sendCursorPosition = (position) => {
        if (!selectedFile || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
        ws.current.send(JSON.stringify({
            type: "cursor_update",
            sender: username || "Anonymous",
            file_id: selectedFile.id,
            position: { lineNumber: position.lineNumber, column: position.column }
        }));
    };

    const updateCursors = () => {
        const editor = editorRef.current;
        const newDecorations = Object.entries(cursors).map(([user, position]) => {
            return {
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                options: {
                    className: `cursor-${user}`, // Add a unique class for each user
                    isWholeLine: false,
                    stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                },
            };
        });

        // Remove old decorations
        const oldDecorations = Object.values(decorationsRef.current);
        editor.deltaDecorations(oldDecorations, []);

        // Add new decorations
        const decorationIds = editor.deltaDecorations([], newDecorations);
        decorationsRef.current = Object.fromEntries(
            Object.keys(cursors).map((user, index) => [user, decorationIds[index]])
        );
    };

    const getLanguageForFile = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
        };
        return languageMap[extension] || 'plaintext';
    };

    if (!selectedFile) {
        return (
            <div className="panel-content editor-panel text-center py-5">
                <p className="text-muted">Select a file to view its contents</p>
            </div>
        );
    }

    return (
        <div className="panel-content editor-panel">
            <div className="editor-header">
                <span>{selectedFile.name}</span>
            </div>
            {isLoading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <Editor
                    height="100%"
                    language={getLanguageForFile(selectedFile.name)}
                    value={fileContent}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                    }}
                />
            )}
        </div>
    );
};

export default CodeEditor;