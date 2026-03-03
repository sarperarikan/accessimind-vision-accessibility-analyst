const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Add any IPC methods here if needed later
    platform: process.platform,
    fs: {
        ensureDirs: () => ipcRenderer.invoke('ensure-dirs'),
        readData: (filename) => ipcRenderer.invoke('data-read', filename),
        writeData: (filename, content) => ipcRenderer.invoke('data-write', filename, content),
        readRule: (filename) => ipcRenderer.invoke('rules-read', filename),
        writeRule: (filename, content) => ipcRenderer.invoke('rules-write', filename, content),
    }
});
