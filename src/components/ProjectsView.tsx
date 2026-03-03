'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Card, Accordion, AccordionSummary, AccordionDetails, Chip, IconButton, Badge, Tooltip } from '@mui/material';
import { Plus, FolderOpen, ChevronDown, Trash2, Edit2, FileText, Calendar, Bug, AlertTriangle, Info } from 'lucide-react';
import { IProject, IJiraTicketHistory } from '@/domain/models';
import { ClientDatabaseService } from '@/services/ClientDatabaseService';
import CreateProjectDialog from './CreateProjectDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import JiraTicketView from './JiraTicketView'; // Reusing for detail view if needed or custom display
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from './LanguageProvider';

interface ProjectsViewProps {
    onSelectProject: (project: IProject) => void;
    onNotify: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function ProjectsView({ onSelectProject, onNotify }: ProjectsViewProps) {
    const { t } = useLanguage();
    const [projects, setProjects] = useState<IProject[]>([]);
    const [projectHistory, setProjectHistory] = useState<Record<string, IJiraTicketHistory[]>>({});

    // Dialogs
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<IProject | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

    const db = ClientDatabaseService.getInstance();

    const fetchProjects = useCallback(() => {
        const projs = db.getProjects();
        setProjects(projs);

        // Fetch history for each project
        const historyMap: Record<string, IJiraTicketHistory[]> = {};
        projs.forEach(p => {
            historyMap[p.id] = db.getProjectHistory(p.id);
        });
        setProjectHistory(historyMap);
    }, [db]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleCreateProject = (name: string, description: string) => {
        try {
            if (editingProject) {
                db.updateProject(editingProject.id, { name, description });
                onNotify('Project updated successfully', 'success');
            } else {
                const newProject: IProject = {
                    id: uuidv4(),
                    name,
                    description,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                db.createProject(newProject);
                onNotify('Project created successfully', 'success');
            }
            fetchProjects();
            setEditingProject(null);
        } catch (error) {
            console.error(error);
            onNotify('Failed to save project', 'error');
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProjectToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!projectToDelete) return;
        try {
            db.deleteProject(projectToDelete);
            setProjects(prev => prev.filter(p => p.id !== projectToDelete));
            // Cleanup history map
            const newHistory = { ...projectHistory };
            delete newHistory[projectToDelete];
            setProjectHistory(newHistory);

            onNotify('Project deleted', 'success');
        } catch (error) {
            onNotify('Failed to delete project', 'error');
        } finally {
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
        }
    };

    const handleOpenEdit = (project: IProject, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProject(project);
        setIsDialogOpen(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {t.projects.title}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => {
                        setEditingProject(null);
                        setIsDialogOpen(true);
                    }}
                >
                    {t.projects.newProject}
                </Button>
            </Box>

            {projects.length === 0 ? (
                <Card sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <FolderOpen size={64} color="#ccc" />
                    <Box>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            {t.projects.noProjects}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            {t.projects.createFirst}
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Plus size={18} />}
                            onClick={() => {
                                setEditingProject(null);
                                setIsDialogOpen(true);
                            }}
                        >
                            {t.projects.createProject}
                        </Button>
                    </Box>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {projects.map((project) => {
                        const findings = projectHistory[project.id] || [];
                        const lastUpdate = new Date(project.updatedAt).toLocaleDateString();

                        return (
                            <Accordion
                                key={project.id}
                                sx={{
                                    borderRadius: 3,
                                    '&:before': { display: 'none' }, // Remove default divider
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                                    overflow: 'hidden',
                                    mb: 2,
                                    bgcolor: 'background.paper'
                                }}
                                disableGutters
                            >
                                <AccordionSummary
                                    expandIcon={<ChevronDown color="var(--mui-palette-text-secondary)" />}
                                    aria-controls={`panel-${project.id}-content`}
                                    id={`panel-${project.id}-header`}
                                    sx={{
                                        px: 3,
                                        py: 1,
                                        '& .MuiAccordionSummary-content': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            mr: 2 // space for expand icon
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, overflow: 'hidden' }}>
                                        <Box sx={{
                                            p: 1.5,
                                            bgcolor: 'primary.light',
                                            color: 'primary.main',
                                            borderRadius: 2,
                                            display: 'flex',
                                            opacity: 0.15
                                        }}>
                                            <FolderOpen size={24} color="var(--mui-palette-primary-main)" aria-hidden="true" />
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {project.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Calendar size={12} aria-hidden="true" />
                                                    {lastUpdate}
                                                </Typography>
                                                <Chip
                                                    label={`${findings.length} ${t.projects.findings}`}
                                                    size="small"
                                                    color={findings.length > 0 ? "primary" : "default"}
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title={t.projects.editProject}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleOpenEdit(project, e)}
                                                onFocus={(e) => e.stopPropagation()}
                                                aria-label={t.projects.editProject}
                                            >
                                                <Edit2 size={18} />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title={t.projects.deleteProject}>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => handleDeleteClick(project.id, e)}
                                                onFocus={(e) => e.stopPropagation()}
                                                aria-label={t.projects.deleteProject}
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </AccordionSummary>

                                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0, bgcolor: '#f9fafb' }}>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {project.description || t.description}
                                        </Typography>

                                        {findings.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                {findings.map((finding) => (
                                                    <Accordion
                                                        key={finding.id}
                                                        sx={{
                                                            boxShadow: 'none',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px !important',
                                                            '&:before': { display: 'none' }
                                                        }}
                                                    >
                                                        <AccordionSummary
                                                            expandIcon={<ChevronDown size={16} />}
                                                            sx={{ minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                                {/* Icon based on platform or status */}
                                                                <Bug size={18} color="#f59e0b" />

                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                        {finding.summary}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                                        <Chip label={finding.platform} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {new Date(finding.timestamp).toLocaleDateString()}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            {/* Mini Detail View */}
                                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>{t.description}:</Typography>
                                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                                {finding.description}
                                                            </Typography>

                                                            {finding.observedResults && (
                                                                <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fff0f0', borderRadius: 1 }}>
                                                                    <Typography variant="caption" color="error" fontWeight={700}>{t.observedResults}:</Typography>
                                                                    <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '0.875rem' }}>
                                                                        {finding.observedResults.slice(0, 3).map((res, i) => (
                                                                            <li key={i}>{res}</li>
                                                                        ))}
                                                                        {finding.observedResults.length > 3 && <li>...and more</li>}
                                                                    </ul>
                                                                </Box>
                                                            )}
                                                        </AccordionDetails>
                                                    </Accordion>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                p: 3,
                                                border: '1px dashed #e0e0e0',
                                                borderRadius: 2,
                                                textAlign: 'center',
                                                bgcolor: 'white'
                                            }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {t.projects.noFindings}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>
            )}

            <CreateProjectDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleCreateProject}
                initialData={editingProject}
            />

            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                itemName={projectToDelete ? (projects.find(p => p.id === projectToDelete)?.name || 'Project') : ''}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
            />
        </Box>
    );
}
