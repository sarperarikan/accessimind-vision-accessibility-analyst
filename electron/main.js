const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

// Force accessibility ON
app.commandLine.appendSwitch('force-renderer-accessibility');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "AccessiMind",
        show: false, // Don't show until ready
        backgroundColor: '#f5f5f5', // Match app background to prevent white flash
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../public/favicon.ico')
    });

    // Remove menu for production look
    if (!isDev) {
        mainWindow.setMenu(null);
    }

    const url = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../out/index.html')}`;

    mainWindow.loadURL(url);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

const fs = require('fs');

// Ensure data/rules directories exist relative to the executable
// process.env.PORTABLE_EXECUTABLE_DIR is set by electron-builder for portable apps
const APP_PATH = isDev
    ? __dirname
    : (process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(app.getPath('exe')));

const DATA_PATH = path.join(APP_PATH, 'data');
const RULES_PATH = path.join(APP_PATH, 'rules');

// Safe file helpers
function ensureDirectories() {
    if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });
    if (!fs.existsSync(RULES_PATH)) fs.mkdirSync(RULES_PATH, { recursive: true });
}

// IPC Handlers
// IPC Handlers

ipcMain.handle('ensure-dirs', async () => {
    ensureDirectories();
    return true;
});

ipcMain.handle('data-read', async (event, filename) => {
    try {
        const filePath = path.join(DATA_PATH, filename);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content);
        }
    } catch (e) {
        console.error('Error reading data:', filename, e);
    }
    return null;
});

ipcMain.handle('data-write', async (event, filename, content) => {
    try {
        ensureDirectories();
        const filePath = path.join(DATA_PATH, filename);
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        return true;
    } catch (e) {
        console.error('Error writing data:', filename, e);
        return false;
    }
});

ipcMain.handle('rules-read', async (event, filename) => {
    try {
        // Try RULES_PATH first
        let filePath = path.join(RULES_PATH, filename);
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        }

        // If dev, allow fallback to source rules? Or maybe not needed if we copy them.
        // For now, return null so frontend can fallback or create default.
        return null;
    } catch (e) {
        console.error('Error reading rule:', filename, e);
        return null;
    }
});

ipcMain.handle('rules-write', async (event, filename, content) => {
    try {
        ensureDirectories();
        const filePath = path.join(RULES_PATH, filename);
        fs.writeFileSync(filePath, content, 'utf-8');
        return true;
    } catch (e) {
        console.error('Error writing rule:', filename, e);
        return false;
    }
});

app.on('ready', () => {
    createWindow();
    ensureDirectories();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
