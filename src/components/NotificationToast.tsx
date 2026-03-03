'use client';

import { Snackbar, Alert } from '@mui/material';
import { useState, useCallback } from 'react';

interface NotificationToastProps {
    message: string;
    severity?: 'success' | 'info' | 'warning' | 'error';
    open: boolean;
    onClose: () => void;
}

export default function NotificationToast({ message, severity = 'success', open, onClose }: NotificationToastProps) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            ContentProps={{
                'role': 'status',
                'aria-live': 'polite',
            }}
        >
            <Alert onClose={onClose} severity={severity} sx={{ width: '100%', borderRadius: 2 }}>
                {message}
            </Alert>
        </Snackbar>
    );
}

export function useNotification() {
    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const notify = useCallback((message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'success') => {
        setNotification({ open: true, message, severity });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification(prev => ({ ...prev, open: false }));
    }, []);

    return { notification, notify, closeNotification };
}
