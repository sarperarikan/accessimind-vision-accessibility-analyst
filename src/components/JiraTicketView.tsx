'use client';

import { Box, Card, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Chip, Button, Stack, TextField, Paper, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Bug, CheckCircle2, AlertCircle, FileText, Copy, Download, ListChecks, Send, MessageSquareText, Bot, X } from 'lucide-react';
import { IJiraTicket, IChatMessage, Platform } from '@/domain/models';
import { useLanguage } from './LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ClientDatabaseService } from '@/services/ClientDatabaseService';
import { ClientRulesService } from '@/services/ClientRulesService';
import { GeminiAiService } from '@/services/GeminiAiService';

interface JiraTicketViewProps {
    ticket: IJiraTicket;
    platform: Platform;
    onNotify?: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
    videoData?: string;
    mimeType?: string;
}

export default function JiraTicketView({ ticket, platform, onNotify, videoData, mimeType }: JiraTicketViewProps) {
    const { t, language } = useLanguage();
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const db = ClientDatabaseService.getInstance();
    const rulesService = ClientRulesService.getInstance();

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isChatOpen) {
            scrollToBottom();
        }
    }, [messages, isSending, isChatOpen]);

    const handleSendMessage = async () => {
        if (!input.trim() || isSending) return;

        const userMsg: IChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsSending(true);

        try {
            const provider = db.getSetting('AI_PROVIDER') as import('@/services/AiServiceFactory').AiProvider || 'gemini';
            const apiKey = db.getSetting('GEMINI_API_KEY');
            const geminiModel = db.getSetting('GEMINI_MODEL') || 'gemini-3.0-flash';
            const selectedModel = geminiModel;

            console.log('Chat debug:', { provider, model: selectedModel });

            if (provider === 'gemini' && !apiKey) {
                throw new Error('Gemini API Key is missing.');
            }

            const expertRules = await rulesService.getCombinedRules(platform, language);
            console.log('Rules loaded:', { rulesLen: expertRules.length });

            const aiService = import('@/services/AiServiceFactory').then(m => m.AiServiceFactory.create({
                provider,
                apiKey: apiKey || undefined
            }));

            const answer = await (await aiService).askFollowUp(
                ticket,
                userMsg.content,
                platform,
                language,
                expertRules,
                videoData,
                mimeType,
                selectedModel
            );

            const assistantMsg: IChatMessage = { role: 'assistant', content: answer };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error('Chat failed detailed:', error);
            if (onNotify) onNotify(language === 'tr' ? 'Uzman yanıt veremedi. Konsol hatalarını kontrol edin.' : 'Expert failed to respond. Check console.', 'error');
        } finally {
            setIsSending(false);
            // Auto-focus back to input after response
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    const getMarkdownTicketText = () => {
        const observed = ticket.observedResults?.map(res => `- [FAIL] ${res}`).join('\n') || 'None';
        const expected = ticket.expectedResults?.map(res => `- [PASS] ${res}`).join('\n') || 'None';
        const steps = ticket.testSteps?.map((step, i) => `${i + 1}. ${step}`).join('\n') || 'None';
        const criteria = ticket.wcagCriteria?.join(', ') || 'N/A';

        return `## [${ticket.impact || 'Accessibility'}] ${ticket.summary}

### Description
${ticket.description}

### Impact Level
**${ticket.impact || 'Unknown'}**

### WCAG Criteria
${criteria}

### Observed Results
${observed}

### Expected Results
${expected}

### Remediation Priority
**${ticket.remediationPriority || 'Normal'}**

### Test Steps
${steps}
`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getMarkdownTicketText());
        if (onNotify) onNotify(t.copied, 'success');
    };

    const handleExport = () => {
        const element = document.createElement('a');
        const file = new Blob([getMarkdownTicketText()], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = `accessibility-report-${new Date().getTime()}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        if (onNotify) onNotify(t.exported, 'success');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card
                sx={{ mt: 4, p: 3, backgroundColor: 'background.paper', position: 'relative', overflow: 'visible' }}
                role="region"
                aria-label={t.jiraTicket}
            >
                <Chip
                    label={t.jiraTicket}
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: -12, left: 24, fontWeight: 700 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FileText size={24} color="var(--mui-palette-primary-main)" style={{ marginRight: 12 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Fira Code", monospace' }}>
                            {ticket.summary}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Copy size={16} />}
                            onClick={handleCopy}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            {t.copyMarkdown}
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Download size={16} />}
                            onClick={handleExport}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            {t.export}
                        </Button>
                    </Stack>
                </Box>

                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {ticket.impact && (
                        <Chip
                            label={`${t.impact}: ${ticket.impact}`}
                            color={ticket.impact === 'Critical' ? 'error' : ticket.impact === 'High' ? 'warning' : 'primary'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                    {ticket.remediationPriority && (
                        <Chip
                            label={`${t.remediationPriority}: ${ticket.remediationPriority}`}
                            color={ticket.remediationPriority === 'High' ? 'error' : ticket.remediationPriority === 'Medium' ? 'warning' : 'info'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                    {ticket.wcagCriteria?.map((criteria, idx) => (
                        <Chip
                            key={idx}
                            label={criteria}
                            variant="outlined"
                            size="small"
                            sx={{ borderColor: 'primary.light', color: 'primary.main', fontSize: '0.75rem' }}
                        />
                    ))}
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800, fontFamily: '"Fira Code", monospace' }}>
                    {t.description}
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, whiteSpace: 'pre-wrap' }}>
                    {ticket.description}
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AlertCircle size={20} color="#B3261E" style={{ marginRight: 8 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#B3261E' }}>
                            {t.observedResults}
                        </Typography>
                    </Box>
                    <List dense aria-label={t.observedResults}>
                        {ticket.observedResults?.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Bug size={16} color="#B3261E" />
                                </ListItemIcon>
                                <ListItemText primary={item} />
                            </ListItem>
                        )) || (
                                <ListItem>
                                    <ListItemText primary="No issues observed or incomplete data returned." />
                                </ListItem>
                            )}
                    </List>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle2 size={20} color="#2E7D32" style={{ marginRight: 8 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                            {t.expectedResults}
                        </Typography>
                    </Box>
                    <List dense aria-label={t.expectedResults}>
                        {ticket.expectedResults?.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircle2 size={16} color="#2E7D32" />
                                </ListItemIcon>
                                <ListItemText primary={item} />
                            </ListItem>
                        )) || (
                                <ListItem>
                                    <ListItemText primary="No expected results defined or incomplete data returned." />
                                </ListItem>
                            )}
                    </List>
                </Box>

                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ListChecks size={20} color="var(--mui-palette-primary-main)" style={{ marginRight: 8 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {t.testSteps}
                        </Typography>
                    </Box>
                    <List dense aria-label={t.testSteps}>
                        {ticket.testSteps?.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemIcon sx={{ minWidth: 32, color: 'primary.main', fontWeight: 700, fontSize: '0.8rem' }}>
                                    {index + 1}.
                                </ListItemIcon>
                                <ListItemText primary={item} />
                            </ListItem>
                        )) || (
                                <ListItem>
                                    <ListItemText primary="No test steps provided." />
                                </ListItem>
                            )}
                    </List>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<MessageSquareText />}
                        onClick={() => setIsChatOpen(true)}
                        sx={{
                            borderRadius: 4,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            '&:hover': {
                                boxShadow: (theme) => `0 6px 20px 0 ${theme.palette.secondary.main}44`
                            }
                        }}
                    >
                        {t.askMore}
                    </Button>
                </Box>

                {/* Accessibility Expert Chat Dialog */}
                <Dialog
                    open={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 4, height: '80vh', display: 'flex', flexDirection: 'column' }
                    }}
                >
                    <DialogTitle sx={{
                        m: 0,
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                p: 1.2,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}44`
                            }}>
                                <Bot size={24} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1 }}>
                                    {platform} Accessibility Expert
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                    <Chip
                                        label="WCAG 2.2 AA"
                                        size="small"
                                        color="primary"
                                        sx={{
                                            height: 20,
                                            fontSize: '0.65rem',
                                            fontWeight: 900,
                                            borderRadius: 1,
                                            '& .MuiChip-label': { px: 1 }
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                                        Real-time Auditor
                                    </Typography>
                                </Stack>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setIsChatOpen(false)} size="small">
                            <X size={20} />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 2, bgcolor: '#fcfcfc', flexGrow: 1, overflowY: 'auto' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', fontStyle: 'italic' }}>
                            {t.chatDescription}
                        </Typography>

                        <Stack
                            spacing={2}
                            role="log"
                            aria-live="polite"
                            aria-relevant="additions"
                        >
                            <AnimatePresence>
                                {messages.map((msg, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        <Typography variant="caption" sx={{
                                            mb: 0.5,
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            fontSize: '0.65rem',
                                            letterSpacing: 0.5,
                                            color: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                                            px: 1
                                        }}>
                                            {msg.role === 'user'
                                                ? `${t.userLabel}:`
                                                : `${t.agent}:`}
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                            gap: 1.5,
                                            maxWidth: '90%'
                                        }}>
                                            <Paper sx={{
                                                p: 2,
                                                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                                bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                                                color: msg.role === 'user' ? 'white' : 'text.primary',
                                                elevation: 0,
                                                border: '1px solid',
                                                borderColor: msg.role === 'user' ? 'primary.main' : '#e0e0e0',
                                                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(103, 80, 164, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                                            }}>
                                                <Box sx={{
                                                    '& p': { m: 0, mb: 1.5, '&:last-child': { mb: 0 } },
                                                    '& ul, & ol': { m: 0, pl: 2, mb: 1.5 },
                                                    '& li': { mb: 0.5 },
                                                    '& code': { bgcolor: msg.role === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', px: 0.5, borderRadius: 1, fontFamily: '"Fira Code", monospace' }
                                                }}>
                                                    <ReactMarkdown>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </Box>
                                            </Paper>
                                        </Box>
                                    </motion.div>
                                ))}
                                {isSending && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginTop: '16px' }}
                                    >
                                        <Typography variant="caption" sx={{
                                            mb: 0.5,
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            fontSize: '0.65rem',
                                            color: 'secondary.main',
                                            px: 1
                                        }}>
                                            Accessibility Expert:
                                        </Typography>
                                        <Paper sx={{ p: 2, borderRadius: '4px 16px 16px 16px', bgcolor: 'white', border: '1px solid #e0e0e0' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <CircularProgress size={16} thickness={6} sx={{ color: 'secondary.main' }} />
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    {language === 'tr' ? 'Yanıt hazırlanıyor...' : 'Preparing response...'}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={chatEndRef} />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                            <TextField
                                fullWidth
                                inputRef={inputRef}
                                placeholder={t.typeMessage}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
                                inputProps={{
                                    'aria-label': t.typeMessage,
                                    readOnly: isSending
                                }}
                                multiline
                                maxRows={3}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        bgcolor: '#f5f5f5'
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isSending}
                                aria-label={t.sending}
                            >
                                <Send size={20} />
                            </Button>
                        </Box>
                    </DialogActions>
                </Dialog>
            </Card>
        </motion.div>
    );
}
