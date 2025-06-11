const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // ��������
      sandbox: true,          // �Ƽ�����
      nodeIntegration: false  // ������Ϊ false���� preload �ṩ����
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('save-file-dialog', async (event, options) => {
  const { fileName, filters } = options;

  const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    defaultPath: fileName,
    filters
  });

  return result.filePath; // �����û�ѡ���·��
});