// const axios = require('axios');
// const { ipcRenderer } = require('electron');

// 页面元素引用
const infoText = document.getElementById('info');
const deviceTableBody = document.getElementById('deviceTableBody');
const refreshBtn = document.getElementById('refreshBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

const API_BASE_URL = 'http://localhost:8080/api';

// 页面加载时自动请求设备列表
window.onload = () => {
  infoText.textContent = '正在初始化...';
  fetchDeviceList();
};

// 点击刷新按钮
refreshBtn.onclick = () => {
  infoText.textContent = '正在刷新设备列表...';
  console.log('刷新按钮被点击');
  window.electronAPI.testClick(); // 测试按钮点击
  fetchDeviceList();
};

// 获取 USB 设备列表
async function fetchDeviceList() {
  infoText.textContent = '正在获取设备信息...';
  console.log('fetchDeviceList被调用');
  try {
    const response = await fetch(`${API_BASE_URL}/devices`);
    const result = await response.json();
    
    if (result.code === 1) { // 检查返回码
      const devices = result.data;
      renderDeviceTable(devices);
      infoText.textContent = `已加载 ${devices.length} 条 USB 设备信息`;
    } else {
      throw new Error(result.msg || '获取设备列表失败');
    }
  } catch (err) {
    console.error(err);
    infoText.textContent = `设备信息获取失败：${err.message}`;
  }
}

// 渲染设备表格
function renderDeviceTable(devices) {
  deviceTableBody.innerHTML = ''; // 清空表格
  devices.forEach(device => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${device.deviceName || '未知设备'}</td>
      <td>${device.vendor || '未知厂商'}</td>
      <td>${device.serialNumber || '无序列号'}</td>
      <td>${device.firstInsertTime || '-'}</td>
      <td>${device.lastInsertTime || '-'}</td>
      <td>${device.isConnected ? '已连接' : '已拔出'}</td>
    `;
    deviceTableBody.appendChild(tr);
  });
}

// 通用导出函数（支持 JSON 和 CSV）
async function exportDeviceData(type = 'json') {
  const suggestFileName = type === 'json' ? 'devices.json' : 'devices.csv';
  const exportUrl = type === 'json'
    ? `${API_BASE_URL}/devices/export/json`
    : `${API_BASE_URL}/devices/export/csv`;

  infoText.textContent = `正在导出 ${type.toUpperCase()} 文件...`;

  try {
    // 弹出保存路径
    const savePath = await window.electronAPI.saveFileDialog({
      fileName: suggestFileName,
      filters: [
        {
          name: type.toUpperCase(),
          extensions: [type]
        }
      ]
    });

    if (!savePath) {
      infoText.textContent = '导出已取消';
      return;
    }

    // 发送请求到后端进行文件保存
    const response = await fetch(`${exportUrl}?filepath=${encodeURIComponent(savePath.substring(0, savePath.lastIndexOf('/')))}&filename=${encodeURIComponent(suggestFileName)}`);
    const result = await response.json();

    if (result.code === 1) {
      infoText.textContent = `${type.toUpperCase()} 导出成功：${result.data}`;
    } else {
      throw new Error(result.msg || '导出失败');
    }
  } catch (err) {
    console.error(err);
    infoText.textContent = `导出失败：${err.message}`;
  }
}

// 绑定导出按钮事件
exportJsonBtn.onclick = () => exportDeviceData('json');
exportCsvBtn.onclick = () => exportDeviceData('csv');

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refreshBtn').addEventListener('click', () => {
    fetchDeviceList();
  });
});
// const information = document.getElementById('info')
// const axios = require('axios');
// const { ipcRenderer } = require('electron');
// const API_BASE_URL = 'http://localhost:8080';
// information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

// const func = async () => {
//   const response = await window.versions.ping();
//   console.log(response); // prints out 'pong'
// };

// func();

// const deviceTableBody = document.getElementById('deviceTableBody');
// const info = document.getElementById('info');
// const refreshBtn = document.getElementById('refreshBtn');
// const exportJsonBtn = document.getElementById('exportJsonBtn');
// const exportCsvBtn = document.getElementById('exportCsvBtn');

// let currentPage = 1;
// const pageSize = 20;

// // 获取设备列表
// async function fetchDeviceList(page = 1, size = 20) {
//   const info = document.getElementById('info');
//   info.textContent = '正在获取设备列表...';

//   try {
//     const response = await axios.get(`${API_BASE_URL}/api/devices`, {
//       params: {}
//     });

//     const data = response.data.data;
//     renderDeviceTable(data.devices);
//     info.textContent = `已加载 ${data.devices.length} 条设备信息，共 ${data.total} 条`;
//     showLoadMore(data.total > page * size);
//   } catch (err) {
//     info.textContent = '获取设备列表失败: ' + err.message;
//   }
// }

// // 渲染设备表格
// function renderDeviceTable(devices) {
//   if (currentPage === 1) deviceTableBody.innerHTML = '';
//   devices.forEach(device => {
//     const tr = document.createElement('tr');
//     tr.innerHTML = `
//       <td>${device.name || ''}</td>
//       <td>${device.vendor || ''}</td>
//       <td>${device.serialNumber || ''}</td>
//       <td>${device.firstInsertTime || ''}</td>
//       <td>${device.lastModifyTime || ''}</td>
//       <td>${device.status || ''}</td>
//     `;
//     deviceTableBody.appendChild(tr);
//   });
// }

// // 显示加载更多按钮逻辑
// function showLoadMore(show) {
//   let btn = document.getElementById('loadMoreBtn');
//   if (show) {
//     if (!btn) {
//       btn = document.createElement('button');
//       btn.id = 'loadMoreBtn';
//       btn.className = 'btn btn-secondary mt-2';
//       btn.textContent = '加载更多';
//       btn.onclick = () => {
//         currentPage++;
//         fetchDeviceList(currentPage);
//       };
//       info.parentNode.insertBefore(btn, info.nextSibling);
//     }
//   } else if (btn) {
//     btn.remove();
//   }
// }

// // 刷新按钮事件
// refreshBtn.onclick = () => {
//   currentPage = 1;
//   fetchDeviceList(currentPage);
// };

// // 下载文件的通用函数
// async function exportDeviceData(exportType, fileNameSuggestion) {
//   const info = document.getElementById('info');
//   info.textContent = `正在导出 ${exportType.toUpperCase()}...`;

//   try {
//     // 请求主进程打开保存文件对话框
//     const filePath = await ipcRenderer.invoke('save-file-dialog', {
//       fileName: fileNameSuggestion,
//       filters: [
//         {
//           name: exportType.toUpperCase(),
//           extensions: [exportType]
//         }
//       ]
//     });

//     if (!filePath) {
//       info.textContent = '导出已取消';
//       return;
//     }

//     // 向后端发送请求，包含文件路径和文件名
//     const apiEndpoint =
//       exportType === 'json'
//         ? '/api/devices/export/json'
//         : '/api/devices/export/csv';

//     const response = await axios.get(apiEndpoint, {
//       params: {
//         all: true,
//         filePath, // 将文件路径传给后端
//         filename: fileNameSuggestion
//       }
//     });

//     const content = exportType === 'json'
//       ? JSON.stringify(response.data, null, 2)
//       : convertToCSV(response.data.devices);

//     const mimeType = exportType === 'json' ? 'application/json' : 'text/csv';
//     const blob = new Blob([content], { type: mimeType });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = fileNameSuggestion;
//     link.click();
//     URL.revokeObjectURL(link.href);

//     info.textContent = `${exportType.toUpperCase()} 导出成功`;
//   } catch (err) {
//     info.textContent = `导出失败: ${err.message}`;
//   }
// }

// // 绑定按钮事件
// exportJsonBtn.onclick = () => {
//   exportDeviceData('json', 'devices.json');
// };
// // 导出为 CSV
// exportCsvBtn.onclick = () => {
//   exportDeviceData('csv', 'devices.csv');
// };

// function convertToCSV(devices) {
//   let csvContent = '设备名称,厂商,序列号,首次插入时间,最后修改时间,当前状态\n';
//   devices.forEach(device => {
//     csvContent += `${device.name},${device.vendor},${device.serialNumber},${device.firstInsertTime},${device.lastModifyTime},${device.status}\n`;
//   });
//   return csvContent;
// }

// // 页面加载时自动获取第一页
// window.onload = () => {
//   fetchDeviceList();
// };

