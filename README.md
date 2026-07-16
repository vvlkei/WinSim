# PixelDesktop

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
PixelDesktop/
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
- **文件操作** — 新建文件夹/文件、重命名、删除（工具栏按钮 / 右键菜单 / Delete 键）
- **自定义壁纸** — 右键桌面 → Choose Wallpaper，支持 localStorage 持久化
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
| DELETE | `/api/files` | 删除文件或目录 |
| PUT | `/api/files/rename` | 重命名文件或目录 |
| PUT | `/api/files/write` | 写入文件内容 |
| POST | `/api/wallpaper` | 上传壁纸图片 |
| GET | `/api/wallpaper` | 获取当前壁纸路径 |

## 更新日志

### 2026-07-16
- 新增：自定义壁纸功能（右键桌面 → Choose Wallpaper）
- 新增：文件删除工具栏按钮 + Delete/Backspace 快捷键
- 新增：`.gitignore` 文件
