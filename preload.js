const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printTxtInvoice: (url) => ipcRenderer.invoke('print-txt-invoice', url),
  printPreview: () => ipcRenderer.invoke('print-preview'),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  onPrintSuccess: (callback) => ipcRenderer.on('print-success', callback),
  onPrintFail: (callback) => ipcRenderer.on('print-fail', callback),
});
