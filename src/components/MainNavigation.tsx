import { Tabs, Tab, Box, Container } from '@mui/material';
import { Bot, Settings, HelpCircle, History, FolderOpen } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface MainNavigationProps {
    currentTab: number;
    onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export default function MainNavigation({ currentTab, onTabChange }: MainNavigationProps) {
    const { t } = useLanguage();

    return (
        <Box id="main-nav" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, backgroundColor: 'background.paper' }}>
            <Container maxWidth="md">
                <Tabs
                    value={currentTab}
                    onChange={onTabChange}
                    aria-label="main navigation"
                    centered
                    sx={{
                        '& .MuiTab-root': {
                            minHeight: 64,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            gap: 1,
                            fontFamily: '"Fira Code", monospace',
                        },
                        '& .MuiTabs-indicator': {
                            height: 3,
                            borderRadius: '3px 3px 0 0',
                        }
                    }}
                >
                    <Tab
                        icon={<Bot size={20} />}
                        iconPosition="start"
                        label={t.agent}
                        id="tab-agent"
                    />
                    <Tab
                        icon={<FolderOpen size={20} />}
                        iconPosition="start"
                        label={t.projects.title}
                        id="tab-projects"
                    />
                    <Tab
                        icon={<History size={20} />}
                        iconPosition="start"
                        label={t.recentAnalysis}
                        id="tab-history"
                    />
                    <Tab
                        icon={<Settings size={20} />}
                        iconPosition="start"
                        label={t.settings}
                        id="tab-settings"
                    />
                    <Tab
                        icon={<HelpCircle size={20} />}
                        iconPosition="start"
                        label={t.help}
                        id="tab-help"
                    />
                </Tabs>
            </Container>
        </Box>
    );
}
