# USB Viewer

一个基于 Electron + Spring Boot 的 USB 设备监控工具。

## 功能特性
- 实时监控并展示所有已连接 USB 设备
- 显示设备名称、厂商、容量、文件系统等详细信息
- 设备插拔历史记录、厂商统计、时间序列分析
- 支持数据导出（JSON/CSV）
- 一键刷新、条件过滤
- 支持 Windows 7 及以上系统

## 目录结构
```
my-electron-app/
├── assets/                  # 前端依赖（如 bootstrap.min.css/js）
├── resources/               # 图标、后端 JAR、JDK（不建议上传 JDK/JAR）
├── main.js                  # Electron 主进程
├── preload.js               # 预加载脚本
├── renderer.js              # 渲染进程
├── index.html               # 前端页面
├── styles.css               # 样式文件
├── package.json             # 项目配置
├── README.md                # 使用说明
└── .gitignore               # Git 忽略文件
```

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/yourname/usbviewer.git
cd usbviewer
```

### 2. 安装依赖
```bash
npm install
```

### 3. 准备后端 JAR 包和 JDK
- **后端 JAR 包**：请将 `USBmonitor-4.jar` 放入 `resources/` 目录（或自行编译后端 Spring Boot 项目）。
- **JDK**：下载 [OpenJDK 17+](https://adoptium.net/temurin/releases/?version=17) 并解压到 `resources/jdk` 目录（目录结构需包含 `bin/java.exe`）。

### 4. 启动开发环境
```bash
npm start
```

### 5. 打包应用
```bash
npm run dist
```
打包产物在 `dist/` 目录下，包含安装版和便携版。

## 运行环境要求
- Windows 7 或更高版本
- JDK 17 或更高版本（推荐使用随应用一同分发的便携式 JDK）
- 确保 8080 端口未被占用

## 常见问题
- **程序无法启动**
  - 检查 JDK 是否正确放置
  - 以管理员身份运行
  - 检查杀毒软件是否拦截
- **后端无响应**
  - 检查 8080 端口是否被占用
  - 重启程序
  - 检查防火墙设置
- **页面样式丢失**
  - 确认 `assets/bootstrap.min.css` 和 `assets/bootstrap.bundle.min.js` 文件存在
- **数据异常**
  - 点击“重新扫描”刷新
  - 重启程序

## 参与贡献
欢迎 issue、PR 和建议！

## 开源协议
MIT License

## 联系方式
作者：Kevin Huang  