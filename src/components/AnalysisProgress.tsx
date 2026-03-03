'use client';

import { Box, Stepper, Step, StepLabel, Typography, useTheme, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useLanguage } from './LanguageProvider';
import { CheckCircle2, Circle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { AudioService } from '@/services/AudioService';

export type ProgressStage = 'preparing' | 'uploading' | 'analyzing' | 'thinking' | 'reporting' | 'complete';

interface AnalysisProgressProps {
    currentStage: ProgressStage;
    percentage: number;
}

const stages: ProgressStage[] = ['preparing', 'uploading', 'analyzing', 'thinking', 'reporting'];

export default function AnalysisProgress({ currentStage, percentage }: AnalysisProgressProps) {
    const { t } = useLanguage();
    const theme = useTheme();
    const prevStageRef = useRef<ProgressStage | null>(null);

    const activeIndex = stages.indexOf(currentStage);

    useEffect(() => {
        if (currentStage !== prevStageRef.current) {
            AudioService.playProgressCue(currentStage);
            prevStageRef.current = currentStage;
        }
    }, [currentStage]);

    return (
        <Box
            sx={{ mt: 4, width: '100%' }}
            role="status"
            aria-live="polite"
            aria-atomic="false"
            aria-label={`${t.progressStages[currentStage as keyof typeof t.progressStages]}: ${percentage}%`}
        >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: 'primary.main' }}>
                    {percentage}%
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                        }
                    }}
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
                <Typography variant="subtitle2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}>
                    {t.progressStages[currentStage as keyof typeof t.progressStages] || t.analyzing}
                </Typography>
            </Box>

            <Stepper
                activeStep={activeIndex}
                alternativeLabel
                sx={{
                    '& .MuiStepLabel-label': { mt: 1, fontWeight: 500 },
                    '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' },
                    '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' },
                }}
            >
                {stages.map((stage, index) => {
                    const isCompleted = index < activeIndex;
                    const isActive = index === activeIndex;

                    return (
                        <Step key={stage} completed={isCompleted}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <motion.div
                                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isCompleted ? theme.palette.success.main : (isActive ? theme.palette.primary.main : theme.palette.text.disabled)
                                        }}
                                    >
                                        {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={isActive ? 24 : 16} strokeWidth={isActive ? 3 : 2} />}
                                    </motion.div>
                                )}
                            >
                                {t.progressStages[stage as keyof typeof t.progressStages]}
                            </StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
        </Box>
    );
}
