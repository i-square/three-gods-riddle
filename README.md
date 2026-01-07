# Three Gods Riddle Game (三神问题)

一个基于 Web 的"三神问题"逻辑解谜游戏。用户需要通过向三位身份未知的神（真理、谎言、随机）提问，根据他们用未知语言（Ja/Da）回答的结果，推理出他们的真实身份。

## 功能特性

*   **三神逻辑模拟**：
    *   **True (真理)**：永远说真话。
    *   **False (谎言)**：永远说假话。
    *   **Random (随机)**：随机回答，不依赖大模型，纯随机逻辑。
    *   **LLM 驱动**：真理与谎言之神的回答由大语言模型（OpenAI 接口格式）生成，增强自然度。
*   **游戏机制**：
    *   限制 3 个问题。
    *   可视化身份猜测（拖拽或选择）。
    *   未知的语言映射（Ja/Da 随机对应 Yes/No）。
    *   新手引导教程（首次登录自动展示）。
*   **用户系统**：
    *   注册/登录（ID 不重复）。
    *   JWT 认证。
    *   历史战绩记录及回看。
    *   Admin 管理后台。
*   **国际化**：
    *   支持中文和英文界面。
*   **安全与配置**：
    *   root 账户初始密码需首次登录修改。
    *   敏感配置分离 (`llm.yaml`)。

## 快速开始

### 1. 后端安装

确保 Python 3.9+ 环境。

```bash
pip install -r requirements.txt
```

### 2. 配置大模型

复制模板文件并填写您的 API Key。

```bash
cp llm.yaml.template llm.yaml
```

编辑 `llm.yaml`：

```yaml
openai:
  base_url: "https://api.openai.com/v1"
  api_key: "sk-xxxxxx"
  model: "gpt-4.1-mini"
  temperature: 0.01

admin:
  root_password: "your_initial_root_password"
```

或使用环境变量覆盖：

```bash
export ROOT_PASSWORD="your_root_password"
```

### 3. 运行后端

```bash
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

后端服务将启动在 `http://127.0.0.1:8000`。

### 4. 前端安装

```bash
cd frontend
npm install
```

### 5. 运行前端（开发模式）

```bash
npm run dev
```

前端将启动在 `http://localhost:5173`。

### 6. 构建前端（生产模式）

```bash
npm run build
```

构建产物在 `frontend/dist/` 目录。

## 技术栈

*   **后端**: Python, FastAPI, SQLModel (SQLite), PyYAML
*   **前端**: React 18 + TypeScript, Vite, Tailwind CSS, react-i18next

## 目录结构

```
.
├── app/
│   ├── core/           # 配置与安全
│   ├── services/       # 业务逻辑 (游戏引擎, LLM)
│   ├── main.py         # FastAPI 入口
│   └── models.py       # 数据库模型
├── frontend/
│   ├── src/
│   │   ├── components/ # React 组件
│   │   ├── hooks/      # 自定义 hooks
│   │   ├── i18n/       # 国际化文件
│   │   ├── services/   # API 服务
│   │   ├── store/      # 状态管理
│   │   └── types/      # TypeScript 类型
│   └── package.json
├── static/             # 旧版静态资源
├── templates/          # 旧版 HTML 模板
├── llm.yaml.template
└── requirements.txt
```

## Admin 账户

首次启动时会自动创建 `root` 管理员账户：
- 用户名: `root`
- 初始密码: 从 `llm.yaml` 的 `admin.root_password` 或环境变量 `ROOT_PASSWORD` 读取
- 首次登录必须修改密码
