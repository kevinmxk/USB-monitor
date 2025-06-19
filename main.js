const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');

let mainWindow;
let javaProcess;
let logStream;
let backendPort = 8080; // 默认端口

// 初始化日志
function initializeLogging() {
  const logDir = path.join(app.getPath('userData'), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, `app-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
  logStream = fs.createWriteStream(logFile, { flags: 'a' });

  // 重定向console输出到日志文件
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  console.log = (...args) => {
    const message = `[${new Date().toISOString()}] INFO: ${args.join(' ')}\n`;
    logStream.write(message);
    originalConsoleLog.apply(console, args);
  };

  console.error = (...args) => {
    const message = `[${new Date().toISOString()}] ERROR: ${args.join(' ')}\n`;
    logStream.write(message);
    originalConsoleError.apply(console, args);
  };

  console.log('应用启动');
  console.log('系统信息:', {
    platform: process.platform,
    arch: process.arch,
    versions: process.versions,
    isPackaged: app.isPackaged
  });
}

// 检查端口是否被占用
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

// 查找可用端口
async function findAvailablePort(startPort, endPort) {
  for (let port = startPort; port <= endPort; port++) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
  }
  throw new Error('在指定范围内未找到可用端口');
}

// 获取Java可执行文件路径
function getJavaExecutable() {
  if (app.isPackaged) {
    // 使用打包的JDK
    const jdkPath = path.join(process.resourcesPath, 'jdk');
    const javaExe = process.platform === 'win32' 
      ? path.join(jdkPath, 'bin', 'java.exe')
      : path.join(jdkPath, 'bin', 'java');
    
    if (fs.existsSync(javaExe)) {
      console.log('使用便携式JDK:', javaExe);
      // 设置JAVA_HOME环境变量
      process.env.JAVA_HOME = jdkPath;
      return javaExe;
    } else {
      console.log('未找到便携式JDK:', javaExe);
    }
  }
  
  // 回退到系统Java
  if (process.env.JAVA_HOME) {
    const systemJava = process.platform === 'win32'
      ? path.join(process.env.JAVA_HOME, 'bin', 'java.exe')
      : path.join(process.env.JAVA_HOME, 'bin', 'java');
    
    if (fs.existsSync(systemJava)) {
      console.log('使用系统JAVA_HOME:', systemJava);
      return systemJava;
    }
  }
  
  console.log('尝试使用PATH中的Java');
  return 'java';
}

// 检查Java环境
async function checkJavaEnvironment() {
  const javaExe = getJavaExecutable();
  
  return new Promise((resolve, reject) => {
    const process = spawn(javaExe, ['-version']);
    let version = '';
    let error = '';
    
    process.stderr.on('data', (data) => {
      version += data.toString();
    });

    process.stdout.on('data', (data) => {
      version += data.toString();
    });

    process.on('error', (err) => {
      error = err.message;
      console.error('Java检测错误:', err);
      reject(new Error('未检测到Java运行环境，请确保应用完整安装或系统已安装Java 17或更高版本'));
    });

    process.on('exit', (code) => {
      if (code === 0) {
        if (version.toLowerCase().includes('version')) {
          console.log('检测到Java版本:', version.split('\n')[0]);
          // 检查是否为Java 17或更高版本
          const versionMatch = version.match(/version "([0-9]+)/);
          if (versionMatch && parseInt(versionMatch[1]) >= 17) {
            resolve(version);
          } else {
            reject(new Error('需要Java 17或更高版本'));
          }
        } else {
          reject(new Error('无法识别Java版本信息'));
        }
      } else {
        reject(new Error('Java版本检查失败：' + (error || '未知错误')));
      }
    });
  });
}

// 验证JAR文件
function verifyJarFile(jarPath) {
  if (!fs.existsSync(jarPath)) {
    throw new Error('找不到后端服务文件：' + jarPath);
  }
  
  // 验证文件大小确保不是空文件
  const stats = fs.statSync(jarPath);
  if (stats.size === 0) {
    throw new Error('后端服务文件无效（文件大小为0）');
  }
  
  console.log('后端服务文件验证通过:', jarPath);
  console.log('文件大小:', Math.round(stats.size / 1024), 'KB');
}

// 启动Java后端
async function startJavaBackend() {
  const jarPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'USBmonitor-4.jar')
    : path.join(__dirname, 'resources', 'USBmonitor-4.jar');

  console.log('启动环境:', app.isPackaged ? '生产环境' : '开发环境');
  console.log('JAR路径:', jarPath);

  try {
    const javaExe = getJavaExecutable();
    console.log('Java执行路径:', javaExe);

    // 检查Java环境
    await checkJavaEnvironment();
    
    // 验证JAR文件
    verifyJarFile(jarPath);
    
    // 查找可用端口
    backendPort = await findAvailablePort(8080, 8099);
    console.log('使用端口:', backendPort);

    // 启动JAR，使用完整路径的java可执行文件
    const javaOptions = [
      // 添加一些优化的JVM参数
      '-Xms64m',                 // 初始堆大小
      '-Xmx256m',               // 最大堆大小
      '-XX:+UseG1GC',           // 使用G1垃圾收集器
      '-XX:+UseCompressedOops', // 使用压缩指针
      '-jar',
      jarPath,
      '--server.port=' + backendPort
    ];

    javaProcess = spawn(javaExe, javaOptions, {
      stdio: 'pipe',
      env: {
        ...process.env,
        JAVA_HOME: process.env.JAVA_HOME // 确保JAVA_HOME被正确传递
      }
    });

    // 添加详细的日志记录
    javaProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log('Java输出:', output);
      }
    });

    javaProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error) {
        console.error('Java错误:', error);
        // 检查常见错误
        if (error.includes('Address already in use')) {
          console.error('端口被占用');
        } else if (error.includes('OutOfMemoryError')) {
          console.error('内存不足');
        }
      }
    });

    javaProcess.on('error', (err) => {
      console.error('启动后端服务失败:', err);
      throw err;
    });

    // 等待后端启动
    await new Promise((resolve, reject) => {
      let startTimeout = setTimeout(() => {
        reject(new Error('后端服务启动超时'));
      }, 15000); // 增加到15秒启动时间

      javaProcess.on('exit', (code) => {
        clearTimeout(startTimeout);
        if (code !== null && code !== 0) {
          reject(new Error('后端服务启动失败，退出代码：' + code));
        }
      });

      // 监听stdout来检测成功启动
      javaProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('启动输出:', output);
        if (output.includes('Started') || output.includes('服务已启动')) {
          clearTimeout(startTimeout);
          console.log('后端服务启动成功');
          resolve();
        }
      });
    });

  } catch (error) {
    console.error('启动后端服务时发生错误:', error);
    dialog.showErrorBox('错误', error.message);
    app.quit();
    throw error;
  }
}

async function createWindow() {
  try {
    // 先启动后端
    await startJavaBackend();

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // 添加加载错误处理
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Page failed to load:', errorDescription);
      dialog.showErrorBox('加载失败', '连接后端服务失败，请检查 Java 环境是否正确安装');
    });

    mainWindow.loadFile('index.html');

    // 开发环境下打开开发者工具
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools();
    }

  } catch (err) {
    console.error('Error during startup:', err);
    dialog.showErrorBox('启动失败', '应用启动失败：' + err.message);
    app.quit();
  }
}

// 清理后端进程
function cleanupBackend() {
  if (javaProcess) {
    try {
      if (process.platform === 'win32') {
        // Windows 上使用 taskkill 确保子进程被终止
        spawn('taskkill', ['/F', '/T', '/PID', javaProcess.pid.toString()]);
      } else {
        javaProcess.kill();
      }
    } catch (err) {
      console.error('Error killing Java process:', err);
    }
  }
}

app.whenReady().then(() => {
  initializeLogging();
  createWindow();
});

app.on('window-all-closed', () => {
  if (logStream) {
    logStream.end();
  }
  cleanupBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 处理文件保存对话框
ipcMain.handle('save-file-dialog', async (event, options) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    ...options,
    properties: ['createDirectory']
  });
  return canceled ? null : filePath;
});

// 添加IPC处理程序，用于获取后端端口
ipcMain.handle('get-backend-port', () => {
  return backendPort;
});