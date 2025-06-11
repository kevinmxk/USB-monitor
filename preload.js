const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // �汾��Ϣ
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
  },
  // �ļ�����Ի���
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  // ���Է���
  testClick: () => {
    console.log('��ť����ɹ���');
  }
})

// ���һ�����Է��������ڵ���
// contextBridge.exposeInMainWorld('electronAPI', {
//   testClick: () => {
//     console.log('��ť����ɹ���');
//   }
// });