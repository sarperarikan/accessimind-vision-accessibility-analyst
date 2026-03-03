'use client';

import { Box, Typography, Card, TextField, Button, MenuItem, Select, FormControl, InputLabel, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { useAccessibility } from './AccessibilityProvider';
import { Globe, Key, Save, Bot, Accessibility, RefreshCw, Server, Cpu, FileText } from 'lucide-react';
import { Switch, FormControlLabel, Divider } from '@mui/material';
import { ClientDatabaseService } from '@/services/ClientDatabaseService';
import { GeminiAiService } from '@/services/GeminiAiService';


export default function SettingsView() {
    const { language, setLanguage, t } = useLanguage();
    const { isHighContrast, setHighContrast } = useAccessibility();

    // Gemini Settings
    const [apiKey, setApiKey] = useState('');
    const [geminiModel, setGeminiModel] = useState('gemini-3.0-flash');
    const [detailLevel, setDetailLevel] = useState('normal');


    const [saved, setSaved] = useState(false);
    const [availableModels, setAvailableModels] = useState<{ name: string, displayName: string }[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const db = ClientDatabaseService.getInstance();

    const fetchModels = async () => {
        setLoadingModels(true);
        setAvailableModels([]); // Clear first
        try {
            if (!apiKey) return;
            const models = await GeminiAiService.listModels(apiKey);
            if (models.length > 0) setAvailableModels(models);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingModels(false);
        }
    };

    useEffect(() => {
        // Load settings
        const key = db.getSetting('GEMINI_API_KEY');
        const savedGeminiModel = db.getSetting('GEMINI_MODEL');
        const savedDetailLevel = db.getSetting('OUTPUT_DETAIL_LEVEL');

        if (key) setApiKey(key);
        if (savedGeminiModel) setGeminiModel(savedGeminiModel);
        if (savedDetailLevel) setDetailLevel(savedDetailLevel);

        // Initial fetch logic needs dependencies, safer to let user trigger or wait for effect deps
        // But for UX, we try to fetch if we have what we need
        // We can't easily access the closures here directly if we want the *latest* state without dependencies.
        // So we just rely on manual refresh or a separate effect if needed.
        // Actually, let's trigger it if we have consistent data
    }, []);

    // Effect to refetch when provider switches, if credentials exist
    useEffect(() => {
        fetchModels();
    }, [apiKey]);

    const handleSave = () => {
        try {
            db.setSetting('GEMINI_API_KEY', apiKey);
            db.setSetting('GEMINI_MODEL', geminiModel);
            db.setSetting('OUTPUT_DETAIL_LEVEL', detailLevel);


            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const currentModel = geminiModel;
    const setModel = setGeminiModel;

    return (
        <Box sx={{ py: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                {t.settings}
            </Typography>

            <Card sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Globe size={24} color="var(--mui-palette-primary-main)" style={{ marginRight: 12 }} />
                    <Typography variant="h6">{t.language}</Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel id="language-select-label">{t.language}</InputLabel>
                    <Select
                        labelId="language-select-label"
                        value={language}
                        label={t.language}
                        onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}
                        sx={{ borderRadius: 3 }}
                    >
                        <MenuItem value="tr">{t.turkish}</MenuItem>
                        <MenuItem value="en">{t.english}</MenuItem>
                    </Select>
                </FormControl>

                <Divider sx={{ mb: 4 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Key size={24} color="var(--mui-palette-primary-main)" style={{ marginRight: 12 }} />
                    <Typography variant="h6">{t.apiKey}</Typography>
                </Box>
                <TextField
                    fullWidth
                    type="password"
                    label={t.apiKey}
                    placeholder="Enter your Gemini API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />

                {/* Model Selection (Shared UI, dynamic content) */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Bot size={24} color="var(--mui-palette-primary-main)" style={{ marginRight: 12 }} />
                    <Typography variant="h6">{t.model}</Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel id="model-select-label">{t.model}</InputLabel>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Select
                            labelId="model-select-label"
                            value={currentModel}
                            label={t.model}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                    setModel('');
                                } else {
                                    setModel(val);
                                }
                            }}
                            sx={{ borderRadius: 3, flex: 1 }}
                        >
                            {availableModels.length > 0 ? (
                                availableModels.map((m) => (
                                    <MenuItem key={m.name} value={m.name}>
                                        {m.displayName}
                                    </MenuItem>
                                ))
                            ) : (
                                [
                                    <MenuItem key="def1" value="gemini-3.0-flash">Gemini 3.0 Flash</MenuItem>,
                                    <MenuItem key="def2" value="gemini-3.0-pro">Gemini 3.0 Pro</MenuItem>
                                ]
                            )}
                            <Divider />
                            <MenuItem value="custom">Custom ID...</MenuItem>
                        </Select>
                        <Button
                            variant="outlined"
                            onClick={fetchModels}
                            disabled={loadingModels || !apiKey}
                            sx={{ minWidth: 'auto', px: 2, borderRadius: 2 }}
                            title="Refresh Models"
                        >
                            {loadingModels ? '...' : <RefreshCw size={20} />}
                        </Button>
                    </Box>
                </FormControl>

                {/* Custom Input */}
                {(!availableModels.find(m => m.name === currentModel) &&
                    !['gemini-3.0-flash', 'gemini-3.0-pro'].includes(currentModel)) && (
                        <TextField
                            fullWidth
                            label="Custom Model ID"
                            placeholder="e.g. gemini-1.5-pro-002"
                            value={currentModel}
                            onChange={(e) => setModel(e.target.value)}
                            helperText="Enter ID from Google AI Studio"
                            sx={{ mb: 4, mt: -3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    )}

                {/* Report Detail Level */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FileText size={24} color="var(--mui-palette-primary-main)" style={{ marginRight: 12 }} />
                    <Typography variant="h6">{t.detailLevel}</Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel id="detail-select-label">{t.detailLevel}</InputLabel>
                    <Select
                        labelId="detail-select-label"
                        value={detailLevel}
                        label={t.detailLevel}
                        onChange={(e) => setDetailLevel(e.target.value)}
                        sx={{ borderRadius: 3 }}
                    >
                        <MenuItem value="concise">{t.levels.concise}</MenuItem>
                        <MenuItem value="normal">{t.levels.normal}</MenuItem>
                        <MenuItem value="detailed">{t.levels.detailed}</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Accessibility size={24} color="var(--mui-palette-primary-main)" style={{ marginRight: 12 }} />
                    <Typography variant="h6">{t.accessibility}</Typography>
                </Box>

                <FormControlLabel
                    control={
                        <Switch
                            checked={isHighContrast}
                            onChange={(e) => setHighContrast(e.target.checked)}
                            color="primary"
                        />
                    }
                    label={t.highContrast}
                    sx={{ mb: 4, ml: 0 }}
                />

                <Divider sx={{ mb: 4 }} />

                <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    fullWidth
                    sx={{ py: 1.5 }}
                >
                    {t.save}
                </Button>

                {saved && (
                    <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }} role="status">
                        {t.settingsSaved}
                    </Alert>
                )}
            </Card>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {t.conformanceNote}
            </Typography>
        </Box>
    );
}
