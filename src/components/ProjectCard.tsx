'use client';

import { Card, Box, Typography, IconButton, Chip } from '@mui/material';
import { Folder, Trash2, Edit2, Clock } from 'lucide-react';
import { IProject } from '@/domain/models';

interface ProjectCardProps {
    project: IProject;
    onSelect: (project: IProject) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onEdit: (project: IProject, e: React.MouseEvent) => void;
}

export default function ProjectCard({ project, onSelect, onDelete, onEdit }: ProjectCardProps) {
    return (
        <Card
            onClick={() => onSelect(project)}
            sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)' },
                transition: 'all 0.2s',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Folder size={24} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {project.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Clock size={12} />
                                {new Date(project.updatedAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Box>
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onEdit(project, e); }}
                        sx={{ mr: 1 }}
                        aria-label={`Edit project ${project.name}`}
                    >
                        <Edit2 size={16} />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => { e.stopPropagation(); onDelete(project.id, e); }}
                        aria-label={`Delete project ${project.name}`}
                    >
                        <Trash2 size={16} />
                    </IconButton>
                </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                height: 40
            }}>
                {project.description || 'No description provided.'}
            </Typography>
        </Card>
    );
}
