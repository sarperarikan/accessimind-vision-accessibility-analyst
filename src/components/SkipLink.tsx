'use client';

import React from 'react';
import { Box, Button } from '@mui/material';
import { useLanguage } from './LanguageProvider';

export default function SkipLink() {
    const { t } = useLanguage();

    return (
        <Box
            component="a"
            href="#main-content"
            sx={{
                position: 'fixed',
                top: -100,
                left: 10,
                zIndex: 9999,
                bgcolor: 'primary.main',
                color: 'white',
                p: 2,
                borderRadius: '0 0 8px 8px',
                textDecoration: 'none',
                transition: 'top 0.2s',
                '&:focus': {
                    top: 0,
                }
            }}
        >
            {t.skipToContent}
        </Box>
    );
}
