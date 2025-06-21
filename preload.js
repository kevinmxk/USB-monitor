const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 版本信息
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
  },
  // 文件保存对话框
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  // 获取后端端口
  getBackendPort: () => ipcRenderer.invoke('get-backend-port')
})