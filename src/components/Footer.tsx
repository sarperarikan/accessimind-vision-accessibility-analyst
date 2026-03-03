'use client';

import { Box, Container, Typography, Link } from '@mui/material';
import { useLanguage } from './LanguageProvider';
import { ChevronUp } from 'lucide-react';

export default function Footer() {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                py: 6,
                mt: 'auto',
                backgroundColor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                textAlign: 'center'
            }}
        >
            <Container maxWidth="md">
                <Link
                    href="#main-nav"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3,
                        textDecoration: 'none',
                        color: 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                    }}
                    aria-label={t.skipToMenu}
                >
                    <ChevronUp size={18} />
                    {t.skipToMenu}
                </Link>

                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    &copy; {currentYear} AccessiMind. Tüm hakları saklıdır.
                </Typography>

                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                    WCAG 2.2 AA & Gemini 3.0 Experimental
                </Typography>
            </Container>
        </Box>
    );
}
