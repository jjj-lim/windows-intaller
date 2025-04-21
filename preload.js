const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printFile: (filePath) => ipcRenderer.invoke('print-file', filePath)
});
