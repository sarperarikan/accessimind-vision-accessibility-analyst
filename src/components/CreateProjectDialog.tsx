import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';
import { IProject } from '@/domain/models';
import { useLanguage } from './LanguageProvider';

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (name: string, description: string) => void;
    initialData?: IProject | null;
}

export default function CreateProjectDialog({ open, onClose, onSave, initialData }: CreateProjectDialogProps) {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name);
                setDescription(initialData.description);
            } else {
                setName('');
                setDescription('');
            }
        }
    }, [open, initialData]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name, description);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {initialData ? t.createProjectDialog.titleEdit : t.createProjectDialog.titleNew}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    <TextField
                        autoFocus
                        label={t.createProjectDialog.nameLabel}
                        fullWidth
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.createProjectDialog.namePlaceholder}
                    />
                    <TextField
                        label={t.createProjectDialog.descriptionLabel}
                        fullWidth
                        multiline
                        minRows={3}
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t.createProjectDialog.descriptionPlaceholder}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit">
                    {t.createProjectDialog.cancel}
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!name.trim()}
                >
                    {initialData ? t.createProjectDialog.update : t.createProjectDialog.create}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
