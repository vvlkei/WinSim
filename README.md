# WinSim

一个模拟 Windows 桌面的 Web 全栈项目，支持窗口管理、文件操作和自定义壁纸。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 状态管理 | Zustand |
| 图标 | Lucide React |
| 后端 | Python + FastAPI |
| 运行时 | uvicorn |
| 包管理 | npm workspaces (Monorepo) + pip |

## 项目结构

```
WinSim/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Desktop.tsx        # 桌面背景、图标、右键菜单换壁纸
│   │   │   ├── Taskbar.tsx        # 底部任务栏 + 开始菜单
│   │   │   ├── Window.tsx         # 可拖拽/缩放/最小化的窗口组件
│   │   │   └── FileExplorer.tsx   # 文件管理器
│   │   ├── store/
│   │   │   └── desktopStore.ts    # Zustand 全局状态
│   │   ├── types.ts               # TypeScript 类型定义
│   │   ├── api.ts                 # Axios API 请求层
│   │   ├── App.tsx                # 根组件
│   │   ├── main.tsx               # 入口文件
│   │   └── index.css              # Tailwind + 全局样式
│   ├── index.html
│   ├── vite.config.ts             # Vite 配置（含 API 代理）
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── main.py                    # FastAPI 入口（端口 3001）
│   ├── routes/
│   │   └── files.py               # 文件 CRUD REST 路由
│   ├── utils/
│   │   └── file_system.py         # 文件系统操作（含路径穿越防护）
│   ├── requirements.txt
│   └── files/                     # 运行时自动生成的存储目录
│       ├── home/
│       │   ├── documents/
│       │   └── projects/
│       └── wallpapers/
│
├── package.json
└── README.md
```

## 功能特性

- **模拟桌面** — Windows 风格桌面背景、桌面图标
- **窗口管理** — 拖拽移动、缩放开窗、最小化/最大化/关闭、焦点切换
- **文件管理器** — 图标网格视图、面包屑导航、右键上下文菜单
- **文件操作** — 新建文件夹/文件（下拉选择类型）、重命名、删除（移入回收站）
- **回收站** — 列表视图、还原文件、清空回收站
- **自定义壁纸** — 右键桌面 → Choose Wallpaper / Remove Wallpaper，支持 localStorage 持久化
- **加载状态** — 文件目录切换时显示 Loading 动画
- **Win11 风格** — 窗口控件居右、扁平标题栏、居中任务栏、毛玻璃开始菜单
- **安全防护** — 路径穿越检测、文件重命名注入防护、上传大小限制（10MB）
- **后端 API** — 完整的 REST 接口，文件存储于本地文件系统

## 启动方式

```bash
# 安装前端依赖
npm install

# 安装后端依赖
pip3 install -r backend/requirements.txt

# 同时启动前后端
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3001

单独启动：

```bash
npm run dev:frontend   # 仅前端 (Vite)
npm run dev:backend    # 仅后端 (uvicorn)
```

## API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/files?path=xxx` | 列出目录内容 |
| GET | `/api/files/read?path=xxx` | 读取文件内容 |
| POST | `/api/files` | 创建文件或目录 |
| DELETE | `/api/files?path=xxx` | 删除文件或目录（移入回收站） |
| PUT | `/api/files/rename` | 重命名文件或目录 |
| PUT | `/api/files/write` | 写入文件内容 |
| POST | `/api/wallpaper` | 上传壁纸图片 |
| GET | `/api/wallpaper` | 获取当前壁纸路径 |
| GET | `/api/files/trash` | 列出回收站内容 |
| POST | `/api/files/trash/restore` | 从回收站还原文件 |
| DELETE | `/api/files/trash` | 清空回收站 |

## 更新日志

### 2026-07-18 — v1.2.0

- 新增：**回收站系统** — 删除文件移入回收站，支持还原和清空
- 新增：**TrashView 组件** — 表格视图，显示文件名/原路径/类型/大小，一键还原
- 新增：**新建文件类型选择** — 下拉菜单支持 txt / md / json / html / css / js
- 新增：新建文件/文件夹自动创建默认名 `新文件.txt` / `新文件夹`，立即进入重命名
- 优化：**Win11 风格窗口** — 控件居右、扁平白色标题栏、hover 预览图标
- 优化：**Win11 风格任务栏** — 浅灰背景、居中的窗口标签、毛玻璃开始菜单
- 优化：**桌面图标** — `flex-col` 竖排改为 `grid` 自动网格排列
- 优化：桌面 Trash 图标点击打开回收站窗口
- 修复：右键菜单事件冒泡导致同时弹出壁纸菜单
- 新增：`DESIGN.md` 设计文档（功能清单、架构、数据库设计）

### 2026-07-17

- 修复：**文件重命名路径穿越漏洞**（`newName` 添加注入检测）
- 修复：后端两个不同 `ROOT` 路径导致数据不一致
- 修复：窗口标题栏按钮点击误触拖拽（添加 `stopPropagation`）
- 修复：`PermissionError` 返回 403 而非 400
- 修复：DELETE 请求改用 query param（符合 HTTP 规范）
- 优化：`ensure_root` 改用 FastAPI `lifespan`，生产部署也生效
- 优化：上传壁纸添加 10MB 大小限制
- 优化：文件目录加载添加 Loading 动画
- 优化：窗口组件本地状态同步 store prop 变化
- 优化：后端补全 OSError 异常兜底
- 清理：未使用的 `ChevronDown` 导入、`children` 类型字段
- 清理：简化 `WindowWrapper` 类型、`shutil` 移至模块顶部

### 2026-07-16

- 新增：自定义壁纸功能（右键桌面 → Choose Wallpaper）
- 新增：文件删除工具栏按钮 + Delete/Backspace 快捷键
- 新增：`.gitignore` 文件
