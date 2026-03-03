'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Card, IconButton, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { RefreshCw, Play, ArrowLeft, Calendar, History, Download, Trash2, ChevronRight } from 'lucide-react';
import { IProject, IJiraTicketHistory } from '@/domain/models';
import { ClientDatabaseService } from '@/services/ClientDatabaseService';
import { VideoStorageService } from '@/services/VideoStorageService';
import { motion, AnimatePresence } from 'framer-motion';
import JiraTicketView from './JiraTicketView';

interface ProjectDetailViewProps {
    project: IProject;
    onBack: () => void;
    onStartAnalysis: (projectId: string) => void;
    onNotify: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function ProjectDetailView({ project, onBack, onStartAnalysis, onNotify }: ProjectDetailViewProps) {
    const [history, setHistory] = useState<IJiraTicketHistory[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<IJiraTicketHistory | null>(null);
    const [videoData, setVideoData] = useState<string | undefined>(undefined);
    const db = ClientDatabaseService.getInstance();
    const videoStorage = VideoStorageService.getInstance();

    const fetchHistory = useCallback(() => {
        const data = db.getProjectHistory(project.id);
        // Sort by timestamp desc
        setHistory(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, [db, project.id]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleSelectTicket = async (ticket: IJiraTicketHistory) => {
        const video = await videoStorage.getVideo(ticket.id);
        if (video) {
            setVideoData(video);
        } else {
            setVideoData(undefined);
        }
        setSelectedTicket(ticket);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this analysis?')) {
            try {
                db.deleteFromHistory(id);
                videoStorage.deleteVideo(id);
                setHistory(prev => prev.filter(item => item.id !== id));
                onNotify('Analysis deleted', 'success');
                if (selectedTicket?.id === id) {
                    setSelectedTicket(null);
                    setVideoData(undefined);
                }
            } catch (error) {
                onNotify('Failed to delete item', 'error');
            }
        }
    };

    if (selectedTicket) {
        return (
            <Box>
                <Button
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => {
                        setSelectedTicket(null);
                        setVideoData(undefined);
                    }}
                    sx={{ mb: 2 }}
                >
                    Back to Project
                </Button>
                <JiraTicketView
                    ticket={selectedTicket}
                    platform={selectedTicket.platform}
                    videoData={videoData}
                    mimeType="video/mp4"
                />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowLeft size={16} />}
                    onClick={onBack}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    Back to Projects
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            {project.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            {project.description}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Play size={20} />}
                        onClick={() => onStartAnalysis(project.id)}
                    >
                        New Analysis
                    </Button>
                </Box>
            </Box>

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Analysis History
            </Typography>

            {history.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4 }}>
                    <History size={48} color="#ccc" style={{ marginBottom: 16 }} />
                    <Typography color="text.secondary">
                        No analysis history for this project yet.
                    </Typography>
                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => onStartAnalysis(project.id)}
                    >
                        Start First Analysis
                    </Button>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <AnimatePresence>
                        {history.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                layout
                            >
                                <Card
                                    component="div"
                                    onClick={() => handleSelectTicket(item)}
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' },
                                        borderRadius: 3,
                                        transition: 'background-color 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                p: 1,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                borderRadius: 2,
                                                display: 'flex'
                                            }}>
                                                <History size={20} />
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                    {item.summary}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Calendar size={12} />
                                                        {new Date(item.timestamp).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton size="small" color="error" onClick={(e) => handleDelete(item.id, e)}>
                                                <Trash2 size={18} />
                                            </IconButton>
                                            <ChevronRight size={20} color="#ccc" />
                                        </Box>
                                    </Box>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </Box>
            )}
        </Box>
    );
}
