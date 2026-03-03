'use client';

import { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Sparkles, Plus } from 'lucide-react';
import PlatformSelector from '@/components/PlatformSelector';
import VideoUpload from '@/components/VideoUpload';
import JiraTicketView from '@/components/JiraTicketView';
import MainNavigation from '@/components/MainNavigation';
import SettingsView from '@/components/SettingsView';
import HelpView from '@/components/HelpView';
import { Platform, IJiraTicket } from '@/domain/models';
import { FileService } from '@/services/FileService';
import { AudioService } from '@/services/AudioService';
import { useLanguage } from '@/components/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';

import AnalysisProgress, { ProgressStage } from '@/components/AnalysisProgress';
import HistoryView from '@/components/HistoryView';
import NotificationToast, { useNotification } from '@/components/NotificationToast';
import Footer from '@/components/Footer';

// Client-side services
import { ClientDatabaseService } from '@/services/ClientDatabaseService';
import { ClientRulesService } from '@/services/ClientRulesService';
import { GeminiAiService } from '@/services/GeminiAiService';
import { VideoStorageService } from '@/services/VideoStorageService';
import { v4 as uuidv4 } from 'uuid';

import ProjectsView from '@/components/ProjectsView';
import ProjectDetailView from '@/components/ProjectDetailView';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import { IProject } from '@/domain/models';

export default function Dashboard() {
  const { language, t } = useLanguage();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  // Analysis Projects state
  const [projects, setProjects] = useState<IProject[]>([]);
  const [analysisProjectId, setAnalysisProjectId] = useState<string | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  const [platform, setPlatform] = useState<Platform>('iOS');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState<ProgressStage>('preparing');
  const [percentage, setPercentage] = useState(0);
  const [result, setResult] = useState<IJiraTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [base64Video, setBase64Video] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const { notification, notify, closeNotification } = useNotification();
  const db = ClientDatabaseService.getInstance();
  const rulesService = ClientRulesService.getInstance();

  const fetchProjects = () => {
    setProjects(db.getProjects());
  };

  useEffect(() => {
    db.init().then(() => {
      fetchProjects();
    });
  }, [db, currentTab]); // Refetch when tab changes or db updates conceptually

  const handleCreateProject = (name: string, description: string) => {
    try {
      const newProject: IProject = {
        id: uuidv4(),
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.createProject(newProject);
      notify(t.projects.projectSeleted, 'success'); // Reusing success message for now or add new one
      fetchProjects();
      setAnalysisProjectId(newProject.id); // Auto select new project
    } catch (error) {
      console.error(error);
      notify('Failed to create project', 'error');
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    if (newValue !== 1) { // 1 is Projects tab now
      setSelectedProject(null);
    }
  };

  const handleAnalyze = async (projectId?: string) => {
    if (!videoFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setProgressStage('preparing');
    setPercentage(0);

    try {
      // 1. Get Setting
      const provider = db.getSetting('AI_PROVIDER') as import('@/services/AiServiceFactory').AiProvider || 'gemini';
      const apiKey = db.getSetting('GEMINI_API_KEY');
      const geminiModel = db.getSetting('GEMINI_MODEL') || 'gemini-3.0-flash';
      const detailLevel = db.getSetting('OUTPUT_DETAIL_LEVEL') as 'concise' | 'normal' | 'detailed' || 'normal';

      const selectedModel = geminiModel;

      if (provider === 'gemini' && !apiKey) {
        throw new Error('Gemini API Key is missing. Please go to Settings and configure it.');
      }

      // Stage: Preparing (0-20%)
      for (let i = 0; i <= 20; i += 10) {
        setPercentage(i);
        await new Promise(r => setTimeout(r, 100));
      }

      setProgressStage('uploading');
      const base64 = await FileService.fileToBase64(videoFile);
      setBase64Video(base64);
      setMimeType(videoFile.type);

      // Stage: Uploading (20-40%) - Simulating upload since we are local
      for (let i = 21; i <= 40; i += 10) {
        setPercentage(i);
        await new Promise(r => setTimeout(r, 100));
      }

      setProgressStage('analyzing');
      // Stage: Analyzing (40-60%)
      const rules = await rulesService.getCombinedRules(platform, language);

      const aiService = import('@/services/AiServiceFactory').then(m => m.AiServiceFactory.create({
        provider,
        apiKey: apiKey || undefined
      }));

      for (let i = 41; i <= 60; i += 10) {
        setPercentage(i);
        await new Promise(r => setTimeout(r, 200));
      }

      setProgressStage('thinking');
      // Execute Analysis
      // We pass the analysis Promise but await it after starting the progress bar simulation
      const analysisPromise = (await aiService).analyzeAccessibility({
        videoData: base64,
        mimeType: videoFile.type,
        platform: platform,
        language: language,
        systemRules: rules,
        model: selectedModel,
        projectId: projectId,
        detailLevel: detailLevel
      });

      // Simulation while waiting
      let p = 60;
      const interval = setInterval(() => {
        if (p < 90) {
          p += 1;
          setPercentage(p);
        }
      }, 300);

      try {
        const TIMEOUT_MS = 300000; // 5 minutes timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Analysis timed out after 5 minutes.')), TIMEOUT_MS)
        );

        const ticket = await Promise.race([analysisPromise, timeoutPromise]);

        clearInterval(interval);
        setPercentage(90);

        setProgressStage('reporting');

        // Add ID and Timestamp
        const ticketWithMeta = {
          ...ticket,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          platform: platform,
          projectId: projectId
        };

        // Save to History
        db.addToHistory(ticketWithMeta);

        // Save Video Blob to IndexedDB for persistence
        if (base64) {
          VideoStorageService.getInstance().saveVideo(ticketWithMeta.id, base64);
        }

        setPercentage(100);
        await new Promise(r => setTimeout(r, 300));

        AudioService.playProgressCue('complete');
        setResult(ticketWithMeta);

      } catch (innerError) {
        clearInterval(interval);
        throw innerError;
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during analysis.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <MainNavigation currentTab={currentTab} onTabChange={handleTabChange} />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <AnimatePresence mode="wait">
          {currentTab === 0 && (
            <motion.div
              key="agent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main', fontFamily: '"Fira Code", monospace', letterSpacing: -1 }}>
                  AccessiMind
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 500, fontFamily: '"Fira Sans", sans-serif' }}>
                  {t.agent}
                </Typography>
              </Box>

              <Paper sx={{ p: 4, mb: 4, borderRadius: 4, elevation: 0 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    {t.projects.selectProject}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <select
                      value={analysisProjectId || ''}
                      onChange={(e) => setAnalysisProjectId(e.target.value || null)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0',
                        fontSize: '1rem',
                        backgroundColor: '#fff',
                        color: '#333',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">{t.projects.noProject}</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <Button
                      variant="outlined"
                      onClick={() => setIsProjectDialogOpen(true)}
                      sx={{
                        minWidth: 50,
                        borderRadius: 3,
                        borderColor: '#e0e0e0',
                        color: 'primary.main',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.light'
                        }
                      }}
                      title={t.projects.newProject}
                    >
                      <Plus size={24} />
                    </Button>
                  </Box>
                </Box>

                <CreateProjectDialog
                  open={isProjectDialogOpen}
                  onClose={() => setIsProjectDialogOpen(false)}
                  onSave={handleCreateProject}
                />

                <PlatformSelector value={platform} onChange={setPlatform} />

                <VideoUpload
                  selectedFile={videoFile}
                  onFileSelect={setVideoFile}
                  onClear={() => {
                    setVideoFile(null);
                    setResult(null);
                  }}
                />

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  {!isAnalyzing ? (
                    <Button
                      variant="contained"
                      size="large"
                      disabled={!videoFile || isAnalyzing}
                      onClick={() => handleAnalyze(analysisProjectId || undefined)}
                      startIcon={<Sparkles />}
                      sx={{
                        px: 8,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        fontFamily: '"Fira Code", monospace',
                        borderRadius: 3,
                        backgroundColor: 'primary.main',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          backgroundColor: 'primary.dark',
                        }
                      }}
                    >
                      {t.generateReport}
                    </Button>
                  ) : (
                    <AnalysisProgress currentStage={progressStage} percentage={percentage} />
                  )}
                </Box>
              </Paper>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert
                      severity="error"
                      sx={{ mb: 4, borderRadius: 2 }}
                      action={
                        <Button color="inherit" size="small" onClick={() => handleAnalyze(undefined)}>
                          {t.retry}
                        </Button>
                      }
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {result && (
                  <JiraTicketView
                    ticket={result}
                    platform={platform}
                    onNotify={notify}
                    videoData={base64Video || undefined}
                    mimeType={mimeType || undefined}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentTab === 1 && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {selectedProject ? (
                <ProjectDetailView
                  project={selectedProject}
                  onBack={() => setSelectedProject(null)}
                  onStartAnalysis={(projectId) => {
                    setAnalysisProjectId(projectId);
                    setCurrentTab(0);
                    notify(`Project "${selectedProject.name}" selected. Please upload a video to start analysis.`, 'info');
                  }}
                  onNotify={notify}
                />
              ) : (
                <ProjectsView
                  onSelectProject={setSelectedProject}
                  onNotify={notify}
                />
              )}
            </motion.div>
          )}

          {currentTab === 2 && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HistoryView onNotify={notify} />
            </motion.div>
          )}

          {currentTab === 3 && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsView />
            </motion.div>
          )}

          {currentTab === 4 && (
            <motion.div
              key="help"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HelpView />
            </motion.div>
          )}
        </AnimatePresence>

        <NotificationToast
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={closeNotification}
        />
      </Container>
      <Footer />
    </Box>
  );
}
