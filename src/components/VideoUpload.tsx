'use client';

import { useState, useCallback, useRef } from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { UploadCloud, X, FileVideo } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface VideoUploadProps {
    onFileSelect: (file: File) => void;
    onClear: () => void;
    selectedFile: File | null;
}

export default function VideoUpload({ onFileSelect, onClear, selectedFile }: VideoUploadProps) {
    const { t } = useLanguage();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('video/')) {
            onFileSelect(files[0]);
        }
    }, [onFileSelect]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                {t.upload}
            </Typography>

            {!selectedFile ? (
                <Paper
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    role="presentation" // Changed role as the input inside handles interaction
                    sx={{
                        position: 'relative', // Necessary for absolute positioning of input
                        height: 240,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: (theme) => `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
                        backgroundColor: isDragging ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: 3,
                        boxShadow: 'none',
                        '&:hover, &:focus-within': { // Changed focus to focus-within
                            borderColor: 'primary.main',
                            backgroundColor: 'white',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                            transform: 'translateY(-2px)'
                        },
                    }}
                >
                    <input
                        type="file"
                        accept="video/*"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            zIndex: 10
                        }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        aria-label={t.dragDrop}
                    />
                    <Box sx={{
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: 'primary.container',
                        color: 'primary.main',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none' // allow clicks to pass through to input (though input is on top anyway)
                    }}>
                        <UploadCloud size={32} />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: '"Fira Code", monospace', pointerEvents: 'none' }}>
                        {t.dragDrop}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, pointerEvents: 'none' }}>
                        {t.supportedFormats}
                    </Typography>
                </Paper>
            ) : (
                <Paper
                    sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        backgroundColor: 'white',
                        borderRadius: 3,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'primary.container',
                            color: 'primary.main',
                            mr: 2
                        }}>
                            <FileVideo size={24} />
                        </Box>
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: '"Fira Code", monospace' }}>
                                {selectedFile.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClear}
                        size="small"
                        aria-label={t.remove || "Remove video"}
                        sx={{ bgcolor: 'error.container', color: 'error.main', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                    >
                        <X size={18} />
                    </IconButton>
                </Paper>
            )}
        </Box>
    );
}
