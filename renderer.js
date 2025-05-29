const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

const func = async () => {
  const response = await window.versions.ping();
  console.log(response); // prints out 'pong'
};

func();

const deviceTableBody = document.getElementById('deviceTableBody');
// const info = document.getElementById('info');
const refreshBtn = document.getElementById('refreshBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

let currentPage = 1;
const pageSize = 20;

// 获取设备列表并分页
// async function fetchDeviceList(page = 1, size = pageSize) {
//   info.textContent = '正在获取设备列表...';
//   try {
//     const response = await fetch(`http://localhost:8080/api/usb/devices?page=${page}&size=${size}`);
//     if (!response.ok) throw new Error('请求数据失败');
//     const data = await response.json();
//     renderDeviceTable(data.devices);
//     info.textContent = `已加载 ${data.devices.length} 条设备信息，共 ${data.total} 条`;
//     showLoadMore(data.total > page * size);
//   } catch (err) {
//     info.textContent = '获取设备列表失败: ' + err.message;
//   }
// }

// 渲染设备表格
function renderDeviceTable(devices) {
  if (currentPage === 1) deviceTableBody.innerHTML = '';
  devices.forEach(device => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${device.name || ''}</td>
      <td>${device.vendor || ''}</td>
      <td>${device.serialNumber || ''}</td>
      <td>${device.firstInsertTime || ''}</td>
      <td>${device.lastModifyTime || ''}</td>
      <td>${device.status || ''}</td>
    `;
    deviceTableBody.appendChild(tr);
  });
}

// 显示加载更多按钮逻辑
function showLoadMore(show) {
  let btn = document.getElementById('loadMoreBtn');
  if (show) {
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'loadMoreBtn';
      btn.className = 'btn btn-secondary mt-2';
      btn.textContent = '加载更多';
      btn.onclick = () => {
        currentPage++;
        fetchDeviceList(currentPage);
      };
      info.parentNode.insertBefore(btn, info.nextSibling);
    }
  } else if (btn) {
    btn.remove();
  }
}

// 刷新按钮事件
refreshBtn.onclick = () => {
  currentPage = 1;
  fetchDeviceList(currentPage);
};

// 导出为 JSON
exportJsonBtn.onclick = async () => {
  info.textContent = '导出 JSON 中...';
  try {
    const response = await fetch('http://localhost:8080/api/usb/devices?all=true');
    if (!response.ok) throw new Error('导出失败');
    const data = await response.json();
    downloadFile(JSON.stringify(data, null, 2), 'devices.json', 'application/json');
    info.textContent = 'JSON 导出成功';
  } catch (err) {
    info.textContent = '导出 JSON 失败: ' + err.message;
  }
};

// 导出为 CSV
exportCsvBtn.onclick = async () => {
  info.textContent = '导出 CSV 中...';
  try {
    const response = await fetch('http://localhost:8080/api/usb/devices?all=true');
    if (!response.ok) throw new Error('导出失败');
    const data = await response.json();
    let csvContent = '设备名称,厂商,序列号,首次插入时间,最后修改时间,当前状态\n';
    data.devices.forEach(device => {
      csvContent += `${device.name},${device.vendor},${device.serialNumber},${device.firstInsertTime},${device.lastModifyTime},${device.status}\n`;
    });
    downloadFile(csvContent, 'devices.csv', 'text/csv');
    info.textContent = 'CSV 导出成功';
  } catch (err) {
    info.textContent = '导出 CSV 失败: ' + err.message;
  }
};

// 下载文件函数
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// 页面加载时自动获取第一页
window.onload = () => {
  fetchDeviceList();
};