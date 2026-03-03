'use client';

import { createTheme } from '@mui/material/styles';

// Technical Dashboard Colors (Slate & Green)
const m3Colors = {
    primary: '#0F172A', // Slate 900
    onPrimary: '#FFFFFF',
    primaryContainer: '#1E293B', // Slate 800
    onPrimaryContainer: '#F8FAFC',
    secondary: '#22C55E', // Green 500 (CTA)
    onSecondary: '#FFFFFF',
    secondaryContainer: '#DCFCE7', // Light Green
    onSecondaryContainer: '#14532D',
    tertiary: '#7D5260',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFD8E4',
    onTertiaryContainer: '#31111D',
    error: '#EF4444', // Red 500
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#7F1D1D',
    background: '#F8FAFC', // Slate 50
    onBackground: '#0F172A',
    surface: '#FFFFFF',
    onSurface: '#0F172A',
    outline: '#94A3B8', // Slate 400
};

// HC Colors (Strictly WCAG AAA compatible)
const hcColors = {
    primary: '#FFFF00', // Yellow
    onPrimary: '#000000', // Black
    background: '#000000', // Black
    onBackground: '#FFFFFF', // White
    surface: '#000000',
    onSurface: '#FFFFFF',
    outline: '#FFFFFF',
    secondary: '#00FF00', // Lime
    error: '#FF0000', // Red
};

const commonTypography = {
    fontFamily: '"Fira Sans", "Inter", "Roboto", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, fontFamily: '"Fira Code", monospace' },
    h2: { fontSize: '2rem', fontWeight: 700, fontFamily: '"Fira Code", monospace' },
    h3: { fontSize: '1.5rem', fontWeight: 600, fontFamily: '"Fira Code", monospace' },
};

export const m3Theme = createTheme({
    palette: {
        primary: { main: m3Colors.primary, contrastText: m3Colors.onPrimary },
        secondary: { main: m3Colors.secondary, contrastText: m3Colors.onSecondary },
        error: { main: m3Colors.error, contrastText: m3Colors.onError },
        background: { default: m3Colors.background, paper: m3Colors.surface },
        divider: m3Colors.outline + '44',
    },
    shape: { borderRadius: 12 },
    typography: commonTypography,
    components: {
        MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', padding: '10px 24px', fontWeight: 600, fontFamily: '"Fira Code", monospace' } } },
        MuiCard: { styleOverrides: { root: { borderRadius: 12, padding: 16, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: `1px solid ${m3Colors.outline}33` } } },
    },
});

export const highContrastTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: hcColors.primary, contrastText: hcColors.onPrimary },
        secondary: { main: hcColors.secondary, contrastText: '#000000' },
        error: { main: hcColors.error, contrastText: '#FFFFFF' },
        background: { default: hcColors.background, paper: hcColors.surface },
        text: { primary: '#FFFFFF', secondary: '#FFFF00' },
        divider: '#FFFFFF',
    },
    shape: { borderRadius: 4 }, // Sharper corners for HC
    typography: {
        ...commonTypography,
        allVariants: { fontWeight: 700 }, // Force bold for better readability
    },
    components: {
        MuiButton: { styleOverrides: { root: { borderRadius: 4, border: '2px solid #FFFF00', fontWeight: 900 } } },
        MuiCard: { styleOverrides: { root: { borderRadius: 4, border: '2px solid #FFFFFF' } } },
        MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', backgroundColor: '#000000', border: '1px solid #FFFFFF' } } },
    },
});
