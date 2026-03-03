'use client';

import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Apple, Smartphone, Globe } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { Platform } from '@/domain/models';

interface PlatformSelectorProps {
    value: Platform;
    onChange: (platform: Platform) => void;
}

export default function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
    const { t } = useLanguage();

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                {t.platform}
            </Typography>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={(_, newValue) => newValue && onChange(newValue)}
                aria-label="platform selection"
                fullWidth
                sx={{
                    '& .MuiToggleButton-root': {
                        borderRadius: '12px !important',
                        mx: 0.5,
                        border: '1px solid #79747E33 !important',
                        '&.Mui-selected': {
                            backgroundColor: 'primary.container',
                            color: 'onPrimaryContainer',
                            borderColor: 'primary.main !important',
                        },
                    },
                }}
            >
                <ToggleButton value="iOS" aria-label="iOS">
                    <Apple size={20} style={{ marginRight: 8 }} />
                    iOS
                </ToggleButton>
                <ToggleButton value="Android" aria-label="Android">
                    <Smartphone size={20} style={{ marginRight: 8 }} />
                    Android
                </ToggleButton>
                <ToggleButton value="Web" aria-label="Web">
                    <Globe size={20} style={{ marginRight: 8 }} />
                    Web
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}
