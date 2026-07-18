# Design Document

## 项目命名建议

| 名称 | 理由 |
|---|---|
| **WinSim** | Windows Simulator 缩写，简洁直白 |

---

## 功能清单

### ✅ 已实现

#### 桌面
- [x] Windows 风格桌面背景（渐变色 / 自定义壁纸）
- [x] 桌面图标（File Explorer / Projects / Terminal / Trash）
- [x] 底部任务栏 + 开始菜单
- [x] 窗口拖拽移动、缩放
- [x] 窗口最小化 / 最大化 / 关闭、焦点切换
- [x] 右键桌面 → Choose / Remove Wallpaper

#### 文件管理器
- [x] 图标网格视图
- [x] 面包屑导航
- [x] 新建文件夹 / 文件
- [x] 重命名（内联编辑）
- [x] 删除（工具栏按钮 / 右键菜单 / Delete 键）
- [x] 右键上下文菜单
- [x] 状态栏（文件计数）
- [x] Loading 加载状态

#### 后端
- [x] 文件 CRUD API
- [x] 壁纸上传 / 获取 API
- [x] 路径穿越防护
- [x] 上传大小限制（10MB）

---

### ❌ 待实现

#### 桌面体验
- [ ] **回收站** — Trash 图标无功能，删除直接永久
- [ ] **桌面放置文件** — 不能直接在桌面放文件或文件夹
- [ ] **桌面图标排列** — 无自动排列 / 对齐网格
- [ ] **右键桌面刷新** — 桌面无刷新菜单
- [ ] **任务栏右键菜单** — 开始按钮 / 任务栏程序无右键菜单
- [ ] **时钟悬浮窗** — 点击时间无日历 / 日期弹出
- [ ] **系统托盘** — 右下角无通知区域图标

#### 文件管理器
- [ ] **文件预览 / 打开** — 双击文件无反应（readFile API 已存在但 UI 未接入）
- [ ] **多选** — 不支持 Ctrl / Shift 多选
- [ ] **拖拽移动文件** — 不能跨文件夹拖拽
- [ ] **搜索 / 筛选** — 无搜索框，无类型过滤
- [ ] **视图切换** — 只有图标视图，无列表 / 详细信息视图
- [ ] **排序** — 无按名称 / 大小 / 日期排序
- [ ] **属性对话框** — 右键 Properties 只弹 alert
- [ ] **撤销操作** — 删除 / 重命名不可撤销

#### 窗口管理
- [ ] **窗口吸附** — 拖拽到边缘不自动吸附
- [ ] **层叠 / 平铺** — 无窗口排列功能
- [ ] **Alt+Tab 切换** — 无快捷键切换窗口

#### 系统功能
- [ ] **注册 / 登录系统** — JWT + 密码哈希
- [ ] **登录界面** — 独立登录页面
- [ ] **用户切换 / 锁屏** — 开始菜单无关机 / 锁屏选项
- [ ] **设置面板** — 无系统设置 UI
- [ ] **通知中心** — 无右下角通知区域
- [ ] **中英文切换** — 全英文 UI
- [ ] **聊天系统** — WebSocket 在线聊天室
- [ ] **论坛模式** — 分类 / 帖子 / 评论
- [ ] **全局检索** — 搜索文件 / 帖子 / 消息
- [ ] **文件预览** — Markdown / 图片 / 文本渲染

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                  │
│  localhost:5173                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Desktop  │ │   Chat   │ │  Forum   │ │  ...     │  │
│  │ (FileMgr)│ │ (WebSocket│ │ (REST)   │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                        │                                │
│                  Axios / WebSocket                       │
│                        │                                │
└────────────────────────┼────────────────────────────────┘
                         │
              Vite Proxy (/api → :3001)
                         │
┌────────────────────────┼────────────────────────────────┐
│                 Backend (FastAPI)                        │
│  localhost:3001                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Auth     │ │  Files   │ │  Chat    │ │  Forum   │  │
│  │ REST     │ │  REST    │ │ WS+REST  │ │  REST    │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │            │            │            │          │
│       └────────────┼────────────┼────────────┘          │
│                    │            │                        │
│          ┌─────────▼────────────▼──────┐                │
│          │     Service Layer           │                │
│          │  (auth / file / chat / bbs) │                │
│          └─────────┬───────────────────┘                │
│                    │                                    │
│          ┌─────────▼──────────┐                         │
│          │     Database       │  (SQLite / PostgreSQL)  │
│          │  users / messages  │                         │
│          │  forum_posts / ... │                         │
│          └────────────────────┘                         │
│          ┌────────────────────┐                         │
│          │  File System       │  (本地沙箱目录)          │
│          │  files/home/       │                         │
│          │  files/wallpapers/ │                         │
│          └────────────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

---

## 数据库设计（SQLite → 可升 PostgreSQL）

### users
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER PK | |
| username | TEXT UNIQUE | 用户名 |
| email | TEXT UNIQUE | 邮箱 |
| password_hash | TEXT | bcrypt 哈希 |
| avatar | TEXT | 头像路径 |
| created_at | DATETIME | |
| last_login | DATETIME | |

### chat_messages
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER PK | |
| room | TEXT | 聊天室名 |
| user_id | INTEGER FK | 发送者 |
| content | TEXT | 消息内容 |
| created_at | DATETIME | |

### forum_categories
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT | 分类名 |
| description | TEXT | |
| sort_order | INTEGER | 排序 |

### forum_threads
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER PK | |
| category_id | INTEGER FK | |
| user_id | INTEGER FK | 作者 |
| title | TEXT | 标题 |
| content | TEXT | Markdown 正文 |
| pinned | BOOLEAN | 置顶 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### forum_comments
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER PK | |
| thread_id | INTEGER FK | |
| parent_id | INTEGER FK | 回复某条评论（NULL = 直接回复帖子） |
| user_id | INTEGER FK | |
| content | TEXT | |
| created_at | DATETIME | |

---

## 前端路由设计

| 路径 | 页面 | 说明 |
|---|---|---|
| `/login` | LoginPage | 登录/注册 |
| `/desktop` | DesktopPage | 主桌面（当前项目核心） |
| `/chat` | ChatPage | 在线聊天室 |
| `/forum` | ForumPage | 论坛首页（分类列表） |
| `/forum/:id` | ThreadListPage | 帖子列表 |
| `/forum/:id/:threadId` | ThreadPage | 帖子详情 |
| `/search` | SearchPage | 全局搜索 |
| `/profile` | ProfilePage | 用户信息 |

---

## 认证流程

```
Login/Register ──→ JWT ──→ localStorage ──→ Axios interceptor
                                                │
                                          Authorization: Bearer <token>
                                                │
                                          FastAPI Depends(get_current_user)
                                                │
                                          DB lookup → 403 if invalid
```

- JWT 过期时间：24h
- 密码：bcrypt (passlib)
- API 无状态（不存 session）

---

## 聊天系统设计

```
WebSocket: ws://localhost:3001/ws/chat/{room}
  ┌─────┐          ┌─────────┐          ┌─────┐
  │  A  │──────────│  Room   │──────────│  B  │
  └─────┘          │  "lobby"│          └─────┘
                   └─────────┘
                        │
                   ┌────▼────┐
                   │  DB     │ (持久化)
                   └─────────┘
```

- FastAPI 原生 WebSocket 支持
- 使用 broadcast 模式（房间内所有连接）
- 消息持久化到 DB（历史消息）
- 进入房间时加载最近 50 条

---

## 项目目录结构（建议）

```
WinSim/
├── frontend/
│   ├── src/
│   │   ├── components/        # 通用组件
│   │   ├── pages/             # 页面级组件
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DesktopPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── ForumPage.tsx
│   │   │   ├── ThreadPage.tsx
│   │   │   └── SearchPage.tsx
│   │   ├── store/             # Zustand stores
│   │   │   ├── desktopStore.ts
│   │   │   ├── authStore.ts
│   │   │   └── chatStore.ts
│   │   ├── api/               # API 请求层
│   │   │   ├── client.ts      # Axios instance + interceptors
│   │   │   ├── auth.ts
│   │   │   ├── files.ts
│   │   │   ├── chat.ts
│   │   │   ├── forum.ts
│   │   │   └── search.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── App.tsx            # Router + Auth guard
│   │   └── main.tsx
│   └── vite.config.ts
│
├── backend/
│   ├── main.py                # FastAPI app + lifespan + CORS
│   ├── database.py            # SQLAlchemy engine + session
│   ├── models/                # ORM models
│   │   ├── user.py
│   │   ├── chat.py
│   │   └── forum.py
│   ├── routes/
│   │   ├── auth.py            # /api/auth/register, /login
│   │   ├── files.py           # /api/files/*
│   │   ├── chat.py            # /api/chat/* + WebSocket
│   │   ├── forum.py           # /api/forum/*
│   │   ├── search.py          # /api/search
│   │   └── wallpaper.py       # /api/wallpaper
│   ├── services/              # 业务逻辑
│   │   ├── auth_service.py
│   │   ├── chat_service.py
│   │   └── forum_service.py
│   ├── utils/
│   │   ├── file_system.py
│   │   ├── jwt.py
│   │   └── password.py
│   └── requirements.txt
│
├── package.json
├── DESIGN.md
└── README.md
```

---

## 实现顺序（建议）

| 阶段 | 功能 | 预估 |
|---|---|---|
| Phase 1 | **注册/登录系统** + JWT + 路由守卫 | 基础，先做 |
| Phase 2 | **登录界面**（从桌面分离出独立登录页） | Phase 1 后自然完成 |
| Phase 3 | **聊天系统** WebSocket + 房间 + 历史 | 中等 |
| Phase 4 | **论坛模式** 分类/帖子/评论 CRUD | 中等 |
| Phase 5 | **文件预览** Markdown 渲染 | 简单 |
| Phase 6 | **全局检索** 搜索文件/帖子/消息 | 依赖前几阶段 |
