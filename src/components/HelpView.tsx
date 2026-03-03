'use client';

import { Box, Typography, Card, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useLanguage } from './LanguageProvider';
import { Info, CheckCircle, Video, Accessibility } from 'lucide-react';

export default function HelpView() {
    const { t, language } = useLanguage();

    return (
        <Box sx={{ py: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                {t.help}
            </Typography>

            <Card sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Info size={24} color="var(--mui-palette-primary-main)" style={{ marginRight: 12 }} />
                    <Typography variant="h6">
                        {language === 'tr' ? 'AccessiMind Nasıl Çalışır?' : 'How AccessiMind Works?'}
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    {language === 'tr'
                        ? 'AccessiMind, ekran kayıtlarını analiz etmek için gelişmiş yapay zeka modellerini kullanır. Seçtiğiniz platforma (iOS, Android veya Web) özel bir erişilebilirlik uzmanı gibi düşünerek hataları ve iyileştirme önerilerini Jira formatında sunar.'
                        : 'AccessiMind uses advanced AI models to analyze screen recordings. It thinks like a specialized accessibility expert for your selected platform (iOS, Android, or Web) and provides errors and improvement suggestions in Jira format.'}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Video size={24} color="var(--mui-palette-primary-main)" style={{ marginRight: 12 }} />
                    <Typography variant="h6">
                        {language === 'tr' ? 'Kullanım Adımları' : 'Usage Steps'}
                    </Typography>
                </Box>
                <List>
                    {[
                        {
                            tr: 'Hedef platformunuzu seçin (iOS, Android, Web).',
                            en: 'Select your target platform (iOS, Android, Web).'
                        },
                        {
                            tr: 'Ayarlar menüsünden "Çıktı Ayrıntı Düzeyi"ni (Özet, Normal, Detaylı) seçebilirsiniz.',
                            en: 'You can select "Output Detail Level" (Concise, Normal, Detailed) from Settings.'
                        },
                        {
                            tr: 'Uygulamanızın ekran kaydını yükleyin.',
                            en: 'Upload your app\'s screen recording.'
                        },
                        {
                            tr: 'Analizi başlatın ve Jira raporunuzu alın. (Projeler altında bulguları detaylı görebilirsiniz.)',
                            en: 'Start the analysis and get your Jira report. (See detailed findings under Projects.)'
                        }
                    ].map((item, index) => (
                        <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle size={18} color="var(--mui-palette-primary-main)" />
                            </ListItemIcon>
                            <ListItemText primary={language === 'tr' ? item.tr : item.en} />
                        </ListItem>
                    ))}
                </List>
            </Card>

            <Card sx={{ p: 4, backgroundColor: 'primary.container', color: 'onPrimaryContainer' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Accessibility size={24} style={{ marginRight: 12 }} />
                    <Typography variant="h6">WCAG 2.2 AA</Typography>
                </Box>
                <Typography variant="body2">
                    {language === 'tr'
                        ? 'Bu uygulama en yüksek erişilebilirlik standartlarına uygun olarak tasarlanmıştır. Tüm etkileşimli öğeler ekran okuyucular tarafından tanımlanabilir ve klavye ile tam kontrol sağlanabilir.'
                        : 'This app is designed in accordance with the highest accessibility standards. All interactive elements can be defined by screen readers and full control can be provided with the keyboard.'}
                </Typography>
            </Card>
        </Box>
    );
}
