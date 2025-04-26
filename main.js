// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { exec } = require('child_process');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // mainWindow.loadURL('https://bengkel.cumahai.com');
  mainWindow.loadURL('http://127.0.0.1:8000');
  
}

ipcMain.handle('print-preview', async () => {
  if (mainWindow) {
    mainWindow.webContents.print({
      silent: false,
      printBackground: true,
      deviceName: ''
    });
  }
});

ipcMain.handle('get-printers', async () => {
  if (mainWindow) {
    return mainWindow.webContents.getPrinters();
  }
  return [];
});

ipcMain.handle('print-txt-invoice', async (_, url) => {
  const dirPath = "C:\\Temp";
  const filePath = `${dirPath}\\invoice.txt`;

  console.log("📥 Mulai proses print invoice dari URL:", url);

  if (!fs.existsSync(dirPath)) {
    console.log("📁 Folder tidak ditemukan, membuat:", dirPath);
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const handler = url.startsWith('https') ? https : http;
  const file = fs.createWriteStream(filePath);

  handler.get(url, (res) => {
    console.log("📄 Mulai download file invoice.txt...");
    res.pipe(file);
    file.on('finish', async () => {
      file.close(async () => {
        console.log("✅ File invoice.txt berhasil disimpan di:", filePath);

        const printers = await mainWindow.webContents.getPrintersAsync();
        console.log("🖨️ Printer yang terdeteksi:", printers.map(p => p.name));

        const matched = printers.find(p =>
          p.name.toLowerCase().includes('epson_lx300')
        );

        if (!matched) {
          console.log("❌ Tidak ada printer Epson LX-300 yang cocok.");
          mainWindow.webContents.send('print-fail', 'Tidak ada printer Epson LX-300 yang tersedia di sistem!');
          return;
        }

        console.log(`🖨️ Mengirim file ke printer: ${matched.name}`);

        exec(`print /D:"\\\\localhost\\EPSON_LX300" "${filePath}"`, (error, stdout, stderr) => {
          console.log("📤 Hasil perintah print:");
          console.log("STDOUT:", stdout);
          console.log("STDERR:", stderr);
          if (error || stderr) {
            console.log("❌ Error saat mencetak:", error?.message || stderr);
            mainWindow.webContents.send('print-fail', error?.message || stderr);
            return;
          }

          console.log("✅ Invoice berhasil dikirim ke printer!");
          mainWindow.webContents.send('print-success', 'Invoice berhasil dikirim ke printer!');
        });
      });
    });
  }).on('error', (err) => {
    console.log("❌ Gagal mendownload file:", err.message);
    mainWindow.webContents.send('print-fail', err.message);
  });
});


app.whenReady().then(createWindow);
  
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
