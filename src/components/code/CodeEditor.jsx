import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { toast } from 'react-toastify';

const CodeEditor = ({ projectId, selectedFile }) => {
    const [fileContent, setFileContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Load file content when a new file is selected
    useEffect(() => {
        if (selectedFile && projectId) {
            loadFileContent();
        }
    }, [selectedFile, projectId]);

    // Load file content
    const loadFileContent = async () => {
        const token = localStorage.getItem("accessToken");
        
        try {
            setIsLoading(true);
            const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/files/${selectedFile.id}/content/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch file content');
            }

            const content = await response.text();
            setFileContent(content);
        } catch (error) {
            console.error("Error loading file:", error);
            toast.error("Failed to load file content");
        } finally {
            setIsLoading(false);
        }
    };

    // Save file content
    const saveFile = async () => {
        if (!selectedFile) return;

        const token = localStorage.getItem("accessToken");
        
        try {
            setIsLoading(true);
            const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/files/${selectedFile.id}/content/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ content: fileContent }),
            });

            if (!response.ok) {
                throw new Error('Failed to save file');
            }

            toast.success("File saved successfully");
        } catch (error) {
            console.error("Error saving file:", error);
            toast.error("Failed to save file");
        } finally {
            setIsLoading(false);
        }
    };

    // Determine file language based on extension
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

    // If no file is selected, show a placeholder
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
                    onChange={(value) => setFileContent(value)}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                    }}
                />
            )}
            
            <div className="editor-actions">
                <button 
                    onClick={saveFile} 
                    disabled={isLoading || !selectedFile}
                >
                    Save File
                </button>
            </div>
        </div>
    );
};

export default CodeEditor;