# AccessiMind - AI Accessibility Analyst

AccessiMind is an intelligent desktop application designed to analyze application screen recordings for accessibility conformance. Powered by **Google Gemini 1.5 Pro**, it acts as a virtual accessibility expert, identifying WCAG violations, UX issues, and navigation barriers in Web, Android, and iOS applications.

![AccessiMind Screenshot](public/favicon.ico)

## 🚀 Key Features

- **AI Vision Analysis**: Upload screen recordings (MP4/MOV) and get instant feedback on accessibility issues.
- **Multi-Platform Rules**: Specialized analysis logic for:
  - 🌐 **Web**: WCAG 2.1/2.2 AA Conformance.
  - 🤖 **Android**: Material Design Accessibility verification.
  - 🍎 **iOS**: Human Interface Guidelines (HIG) Accessibility checks.
- **Project Management**: Organize your analyses into named projects to track progress over time.
- **Smart Reporting**: Generates detailed findings with severity levels (Critical, High, Medium, Low).
- **Jira Integration**: Create ready-to-paste Jira tickets with "Observed Results", "Expected Results", and "Steps to Reproduce".
- **Localization**: Full support for **Turkish (TR)** and **English (EN)** interfaces.
- **Fast Startup**: Optimized portable Windows executable for instant launch.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Desktop Engine**: [Electron](https://www.electronjs.org/)
- **UI Library**: [Material UI (MUI)](https://mui.com/)
- **AI Engine**: [Google Generative AI SDK](https://ai.google.dev/) (Gemini 1.5 Pro)
- **Styling**: Tailwind CSS & Emotion

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/vision_accessibility_analyyst_app.git
   cd vision_accessibility_analyyst_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## ⚙️ Configuration

Before running the analysis, you need a Google Gemini API Key.
1. Launch the application.
2. Go to the **Settings** tab.
3. Enter your **Gemini API Key**.
4. (Optional) Configure default target platform.

## 🖥️ Running the Application

### Development Mode
To run the application locally with hot-reloading:

```bash
npm run electron:dev
```
*This starts the Next.js renderer on port 3000 and launches the Electron window.*

### Building for Production

**1. Clean Build (Web)**
Compiles the Next.js application into static files:
```bash
npm run build
```

**2. Build Portable Executable (Windows)**
Creates a standalone `.exe` file in the `dist/` directory:
```bash
npm run electron:build
```
*Note: The Windows build is configured for `store` compression to maximize startup speed.*

## 📂 Project Structure

- `src/app`: Next.js pages and app router.
- `src/components`: UI components (Views, Dialogs, Cards).
- `src/services`: Logic for AI, Database, and Storage services.
- `src/lib`: Shared utilities and translations.
- `electron`: Main process code and preload scripts.
- `public/rules`: Custom accessibility prompt templates for different platforms.

## 🔒 Privacy & Data

- Video files are processed locally or sent securely to the Gemini API (depending on configuration) but are not stored permanently by the AI provider for training (subject to Google's Enterprise API terms).
- Analysis history is stored locally on your machine in `data/db.json`.

---
*Developed with ❤️ and AI.*
