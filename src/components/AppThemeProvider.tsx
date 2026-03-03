'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { m3Theme, highContrastTheme } from '../styles/theme';
import { ReactNode } from 'react';
import { LanguageProvider } from './LanguageProvider';
import { AccessibilityProvider, useAccessibility } from './AccessibilityProvider';

function ThemeWrapper({ children }: { children: ReactNode }) {
    const { isHighContrast } = useAccessibility();
    return (
        <ThemeProvider theme={isHighContrast ? highContrastTheme : m3Theme}>
            <LanguageProvider>
                <CssBaseline />
                {children}
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default function AppThemeProvider({ children }: { children: ReactNode }) {
    return (
        <AppRouterCacheProvider>
            <AccessibilityProvider>
                <ThemeWrapper>
                    {children}
                </ThemeWrapper>
            </AccessibilityProvider>
        </AppRouterCacheProvider>
    );
}
