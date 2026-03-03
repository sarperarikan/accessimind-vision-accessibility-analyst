'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Card, Typography, IconButton, Button, Chip, Stack } from '@mui/material';
import { Trash2, Download, History, Calendar, ChevronRight } from 'lucide-react';
import { IJiraTicketHistory } from '@/domain/models';
import { useLanguage } from './LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';
import JiraTicketView from './JiraTicketView';
import { ClientDatabaseService } from '@/services/ClientDatabaseService';
import { VideoStorageService } from '@/services/VideoStorageService';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

interface HistoryViewProps {
    onNotify: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function HistoryView({ onNotify }: HistoryViewProps) {
    const { t } = useLanguage();
    const [history, setHistory] = useState<IJiraTicketHistory[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<IJiraTicketHistory | null>(null);
    const [videoData, setVideoData] = useState<string | undefined>(undefined);
    const db = ClientDatabaseService.getInstance();
    const videoStorage = VideoStorageService.getInstance();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleSelectTicket = async (ticket: IJiraTicketHistory) => {
        const video = await videoStorage.getVideo(ticket.id);
        if (video) {
            setVideoData(video);
        } else {
            setVideoData(undefined);
        }
        setSelectedTicket(ticket);
    };

    const [projectsMap, setProjectsMap] = useState<Record<string, string>>({});

    const fetchHistory = useCallback(() => {
        try {
            const data = db.getHistory();
            setHistory(data);
            // Build projects map
            const projects = db.getProjects();
            const map: Record<string, string> = {};
            projects.forEach(p => map[p.id] = p.name);
            setProjectsMap(map);
        } catch (error) {
            console.error('Failed to fetch history:', error);
            onNotify('Failed to fetch history', 'error');
        }
    }, [onNotify]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;

        try {
            db.deleteFromHistory(itemToDelete);
            videoStorage.deleteVideo(itemToDelete);
            setHistory(prev => prev.filter(item => item.id !== itemToDelete));
            onNotify(t.deleted, 'success');
            if (selectedTicket?.id === itemToDelete) {
                setSelectedTicket(null);
                setVideoData(undefined);
            }
        } catch (error) {
            console.error('Failed to delete history item:', error);
            onNotify('Failed to delete item', 'error');
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleExport = (ticket: IJiraTicketHistory, e: React.MouseEvent) => {
        e.stopPropagation();
        const observed = ticket.observedResults?.map(res => `- ${res}`).join('\n') || '';
        const expected = ticket.expectedResults?.map(res => `- ${res}`).join('\n') || '';
        const steps = ticket.testSteps?.map(step => `- ${step}`).join('\n') || '';

        const text = `JIRA TICKET REPORT
------------------
ID: ${ticket.id}
DATE: ${new Date(ticket.timestamp).toLocaleString()}
PLATFORM: ${ticket.platform}
PROJECT: ${ticket.projectId ? (projectsMap[ticket.projectId] || 'Unknown Project') : 'Unassigned'}

SUMMARY:
${ticket.summary}

DESCRIPTION:
${ticket.description}

OBSERVED RESULTS:
${observed}

EXPECTED RESULTS:
${expected}

TEST STEPS:
${steps}`;

        const element = document.createElement('a');
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `accessibility-report-${ticket.id.slice(0, 8)}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        onNotify(t.exported, 'success');
    };

    if (selectedTicket) {
        return (
            <Box>
                <Button
                    startIcon={<History size={18} />}
                    onClick={() => {
                        setSelectedTicket(null);
                        setVideoData(undefined);
                    }}
                    sx={{ mb: 2 }}
                >
                    Back to History
                </Button>
                <JiraTicketView
                    ticket={selectedTicket}
                    platform={selectedTicket.platform}
                    videoData={videoData}
                    mimeType="video/mp4" // Fallback/Assumption since we don't strictly store mimetype separately but typically it's compatible
                />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: 'primary.main' }}>
                {t.recentAnalysis}
            </Typography>

            {history.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4 }}>
                    <History size={48} color="#ccc" style={{ marginBottom: 16 }} />
                    <Typography color="text.secondary">
                        {t.noHistory}
                    </Typography>
                </Card>
            ) : (
                <Stack spacing={2}>
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
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip label={item.platform} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                    {item.projectId && projectsMap[item.projectId] && (
                                                        <Chip
                                                            label={projectsMap[item.projectId]}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Calendar size={12} />
                                                        {new Date(item.timestamp).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton size="small" onClick={(e) => handleExport(item, e)} title={t.export} aria-label={`${t.export} ${item.summary}`}>
                                                <Download size={18} />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(item.id, e)} title={t.delete} aria-label={`${t.delete} ${item.summary}`}>
                                                <Trash2 size={18} />
                                            </IconButton>
                                            <ChevronRight size={20} color="#ccc" />
                                        </Box>
                                    </Box>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </Stack>
            )}

            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                itemName={itemToDelete ? (history.find(h => h.id === itemToDelete)?.summary || 'Item') : ''}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
            />
        </Box>
    );
}
