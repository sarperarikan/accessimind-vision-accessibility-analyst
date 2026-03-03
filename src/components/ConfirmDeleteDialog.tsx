import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, Box } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface ConfirmDeleteDialogProps {
    open: boolean;
    itemName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmDeleteDialog({ open, itemName, onClose, onConfirm }: ConfirmDeleteDialogProps) {
    const { t } = useLanguage();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { borderRadius: 3, p: 1 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AlertTriangle color="#ef4444" />
                {t.deleteConfirmation.title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t.deleteConfirmation.message.replace('{item}', itemName)}
                </DialogContentText>
                <Box sx={{ mt: 2, p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
                    <Typography variant="body2" color="#b91c1c" fontWeight={600}>
                        {t.deleteConfirmation.warning}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ borderRadius: 2, color: 'text.secondary' }}>
                    {t.deleteConfirmation.cancel}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    sx={{ borderRadius: 2 }}
                    autoFocus
                >
                    {t.deleteConfirmation.confirm}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
