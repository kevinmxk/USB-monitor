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
  // 测试方法
  testClick: () => {
    console.log('按钮点击成功！');
  }
})

// 添加一个测试方法，用于调试
// contextBridge.exposeInMainWorld('electronAPI', {
//   testClick: () => {
//     console.log('按钮点击成功！');
//   }
// });