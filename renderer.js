// const { ipcRenderer } = require('electron');

// 页面元素引用
const infoText = document.getElementById('info');
const deviceTableBody = document.getElementById('deviceTableBody');
const refreshBtn = document.getElementById('refreshBtn');
const showAllBtn = document.getElementById('showAllBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const connectedBtn = document.getElementById('connectedBtn');
const vendorStatsBtn = document.getElementById('vendorStatsBtn');
const timeseriesBtn = document.getElementById('timeseriesBtn');
const filterVendorBtn = document.getElementById('filterVendorBtn');
const filterTimeBtn = document.getElementById('filterTimeBtn');
const vendorInput = document.getElementById('vendorInput');
const startTimeInput = document.getElementById('startTimeInput');
const endTimeInput = document.getElementById('endTimeInput');
const vendorStatsBody = document.getElementById('vendorStatsBody');
const timeseriesBody = document.getElementById('timeseriesBody');

let API_BASE_URL = '';

// 初始化API基础URL
async function initApiBaseUrl() {
  try {
    const port = await window.electronAPI.getBackendPort();
    API_BASE_URL = `http://127.0.0.1:${port}/api`;
    console.log('后端服务地址:', API_BASE_URL);
    return true;
  } catch (err) {
    console.error('获取后端端口失败:', err);
    infoText.textContent = '初始化失败：无法获取后端服务端口';
    return false;
  }
}

// 通用带耗时统计的fetch
async function timedFetch(url, options) {
  const startTime = Date.now();
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const endTime = Date.now();
    console.log(`请求 ${url} 耗时: ${endTime - startTime} ms`);
    return data;
  } catch (err) {
    const endTime = Date.now();
    console.log(`请求 ${url} 失败，耗时: ${endTime - startTime} ms`);
    throw err;
  }
}

//打印时间戳
async function fetchDeviceList() {
  infoText.textContent = '正在获取设备信息...';
  setButtonsDisabled(true);
  try {
    const result = await timedFetch(`${API_BASE_URL}/devices`);
    if (result.code === 1) {
      const newDevices = result.data;
      if (JSON.stringify(newDevices) !== JSON.stringify(cachedDevices)) {
        currentPage = 1;
        renderDeviceTable(newDevices);
        cachedDevices = newDevices;
        infoText.textContent = `已加载 ${newDevices.length} 条设备信息`;
      } else {
        infoText.textContent = '设备信息无变化';
      }
    } else {
      throw new Error(result.msg || '获取设备列表失败');
    }
  } catch (err) {
    infoText.textContent = `设备信息获取失败：${err.message}`;
  } finally {
    setButtonsDisabled(false);
  }
}

// 页面加载时自动请求设备列表
window.onload = async () => {
  infoText.textContent = '正在初始化...';
  if (await initApiBaseUrl()) {
    fetchDeviceList();
  }
};

// 点击刷新按钮
refreshBtn.onclick = () => {

  infoText.textContent = '正在刷新设备列表...';
  fetchDeviceList();
};

// 工具函数：批量禁用/启用按钮
function setButtonsDisabled(disabled) {
  [refreshBtn, showAllBtn, exportJsonBtn, exportCsvBtn, connectedBtn, vendorStatsBtn, timeseriesBtn, filterVendorBtn, filterTimeBtn].forEach(btn => {
    if (btn) btn.disabled = disabled;
  });
}

// 分页相关
let currentPage = 1;
const pageSize = 10;
let pagedDevices = [];

function renderPagination(total, page, pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  let html = '';
  if (totalPages <= 1) {
    document.getElementById('pagination')?.remove();
    return;
  }
  html += `<nav><ul class="pagination justify-content-center" id="pagination">`;
  html += `<li class="page-item${page === 1 ? ' disabled' : ''}"><a class="page-link" href="#" data-page="${page - 1}">上一页</a></li>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item${i === page ? ' active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  html += `<li class="page-item${page === totalPages ? ' disabled' : ''}"><a class="page-link" href="#" data-page="${page + 1}">下一页</a></li>`;
  html += `</ul></nav>`;
  let old = document.getElementById('pagination');
  if (old) old.outerHTML = html;
  else deviceTableBody.parentElement.insertAdjacentHTML('afterend', html);
  document.querySelectorAll('#pagination .page-link').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      const p = parseInt(link.getAttribute('data-page'));
      if (p >= 1 && p <= totalPages && p !== currentPage) {
        currentPage = p;
        renderDeviceTable(pagedDevices);
        renderPagination(pagedDevices.length, currentPage, pageSize);
      }
    };
  });
}

function renderDeviceTable(devices) {
  pagedDevices = devices;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  let html = '';
  for (const device of devices.slice(start, end)) {
    html += `<tr>
      <td>${device.deviceName || '未知设备'}</td>
      <td>${device.vendor || '未知厂商'}</td>
      <td>${device.serialNumber || '无序列号'}</td>
      <td>${device.firstInsertTime || '-'}</td>
      <td>${device.lastInsertTime || '-'}</td>
      <td>${device.isConnected ? '已连接' : '已拔出'}</td>
    </tr>`;
  }
  deviceTableBody.innerHTML = html;
  renderPagination(devices.length, currentPage, pageSize);
}

// 获取 USB 设备列表
let cachedDevices = [];
// fetchDeviceList 用 timedFetch
async function fetchDeviceList() {
  infoText.textContent = '正在获取设备信息...';
  setButtonsDisabled(true);
  try {
    const result = await timedFetch(`${API_BASE_URL}/devices`);
    if (result.code === 1) {
      const newDevices = result.data;
      if (JSON.stringify(newDevices) !== JSON.stringify(cachedDevices)) {
        currentPage = 1;
        renderDeviceTable(newDevices);
        cachedDevices = newDevices;
        infoText.textContent = `已加载 ${newDevices.length} 条设备信息`;
      } else {
        infoText.textContent = '设备信息无变化';
      }
    } else {
      throw new Error(result.msg || '获取设备列表失败');
    }
  } catch (err) {
    infoText.textContent = `设备信息获取失败：${err.message}`;
  } finally {
    setButtonsDisabled(false);
  }
}

// 仅显示已连接设备
connectedBtn.onclick = async () => {
  infoText.textContent = '正在获取已连接设备...';
  setButtonsDisabled(true);
  try {
    const result = await timedFetch(`${API_BASE_URL}/devices/connected`);
    if (result.code === 1) {
      currentPage = 1;
      renderDeviceTable(result.data);
      infoText.textContent = `已加载 ${result.data.length} 条已连接设备信息`;
    } else {
      throw new Error(result.msg || '获取已连接设备失败');
    }
  } catch (err) {
    infoText.textContent = `获取已连接设备失败：${err.message}`;
  } finally {
    setButtonsDisabled(false);
  }
};

// 厂商统计
vendorStatsBtn.onclick = async () => {
  infoText.textContent = '正在获取厂商统计...';
  setButtonsDisabled(true);
  try {
    const result = await timedFetch(`${API_BASE_URL}/stats/vendor`);
    if (result.code === 1) {
      const vendors = Array.from(result.data).filter(Boolean);
      vendorStatsBody.innerHTML = vendors.length
        ? `<ul>${vendors.map(v => `<li>${v}</li>`).join('')}</ul>`
        : '<p>无厂商信息</p>';
      // 显示弹窗
      const vendorModal = new bootstrap.Modal(document.getElementById('vendorModal'));
      vendorModal.show();
      infoText.textContent = '';
    } else {
      throw new Error(result.msg || '获取厂商统计失败');
    }
  } catch (err) {
    infoText.textContent = `获取厂商统计失败：${err.message}`;
  } finally {
    setButtonsDisabled(false);
  }
};

// 时间序列
// 时间序列格式：[{timestamp, event}]
timeseriesBtn.onclick = async () => {
  infoText.textContent = '正在获取时间序列...';
  setButtonsDisabled(true);
  try {
    const result = await timedFetch(`${API_BASE_URL}/stats/timeseries`);
    if (result.code === 1) {
      const events = result.data.filter(e => e.timestamp && e.event);
      timeseriesBody.innerHTML = events.length
        ? `<ul class="list-group">${events.map(e => `<li class="list-group-item"><b>${e.timestamp}</b> - ${e.event}</li>`).join('')}</ul>`
        : '<p>无时间序列数据</p>';
      // 显示弹窗
      const timeseriesModal = new bootstrap.Modal(document.getElementById('timeseriesModal'));
      timeseriesModal.show();
      infoText.textContent = '';
    } else {
      throw new Error(result.msg || '获取时间序列失败');
    }
  } catch (err) {
    infoText.textContent = `获取时间序列失败：${err.message}`;
  } finally {
    setButtonsDisabled(false);
  }
};

// 按厂商过滤
filterVendorBtn.onclick = async () => {
  const vendor = vendorInput.value.trim();
  if (!vendor) {
    infoText.textContent = '请输入厂商名';
    return;
  }
  infoText.textContent = '正在按厂商过滤...';
  setButtonsDisabled(true);
  try {
    const result = await timedFetch(`${API_BASE_URL}/devices/filter/vendor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor })
    });
    if (result.code === 1) {
      currentPage = 1;
      renderDeviceTable(result.data);
      infoText.textContent = `共找到 ${result.data.length} 条厂商为“${vendor}”的设备`;
    } else {
      throw new Error(result.msg || '厂商过滤失败');
    }
  } catch (err) {
    infoText.textContent = `厂商过滤失败：${err.message}`;
  } finally {
    setButtonsDisabled(false);
  }
};

// 按时间过滤
filterTimeBtn.onclick = async () => {
  const start = startTimeInput.value;
  const end = endTimeInput.value;
  if (!start || !end) {
    infoText.textContent = '请填写起始和结束时间';
    return;
  }
  // 转换为 yyyy-MM-dd HH:mm:ss
  const format = (dt) => dt.replace('T', ' ') + ':00';
  infoText.textContent = '正在按时间过滤...';
  setButtonsDisabled(true);
  try {
    const result = await timedFetch(`${API_BASE_URL}/devices/filter/time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime: format(start), endTime: format(end) })
    });
    if (result.code === 1) {
      currentPage = 1;
      renderDeviceTable(result.data);
      infoText.textContent = `共找到 ${result.data.length} 条在该时间段内插拔的设备`;
    } else {
      throw new Error(result.msg || '时间过滤失败');
    }
  } catch (err) {
    infoText.textContent = `时间过滤失败：${err.message}`;
  } finally {
    setButtonsDisabled(false);
  }
};

// 通用导出函数（支持 JSON 和 CSV）
async function exportDeviceData(type = 'json') {
  const suggestFileName = type === 'json' ? 'devices.json' : 'devices.csv';
  const exportUrl = type === 'json'
    ? `${API_BASE_URL}/devices/export/json`
    : `${API_BASE_URL}/devices/export/csv`;
  infoText.textContent = `正在导出 ${type.toUpperCase()} 文件...`;
  setButtonsDisabled(true);
  try {
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
    
    // 提取文件名和目录路径
    const fileName = savePath.split(/[\\/]/).pop();
    // 获取目录路径（不包含文件名的部分）
    const directoryPath = savePath.slice(0, savePath.lastIndexOf(fileName) - 1); // -1 是为了去掉最后的斜杠
    
    // 分别传递目录路径和文件名
    const result = await timedFetch(
      `${exportUrl}?filename=${encodeURIComponent(fileName)}&filepath=${encodeURIComponent(directoryPath)}`
    );
    if (result.code === 1) {
      infoText.textContent = `${type.toUpperCase()} 导出成功：${result.data}`;
    } else {
      throw new Error(result.msg || '导出失败');
    }
  } catch (err) {
    infoText.textContent = `导出失败：${err.message}`;
  } finally {
    setButtonsDisabled(false);
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

// 显示全部设备
showAllBtn.onclick = () => {
  // 清空过滤条件
  vendorInput.value = '';
  startTimeInput.value = '';
  endTimeInput.value = '';
  // 重新显示全部设备
  if (cachedDevices.length > 0) {
    currentPage = 1;
    renderDeviceTable(cachedDevices);
    infoText.textContent = `显示全部：共 ${cachedDevices.length} 条设备信息`;
  } else {
    fetchDeviceList();
  }
};