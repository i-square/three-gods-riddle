# Three Gods Riddle Game (三神问题)

一个基于 Web 的“三神问题”逻辑解谜游戏。用户需要通过向三位身份未知的神（真理、谎言、随机）提问，根据他们用未知语言（Ja/Da）回答的结果，推理出他们的真实身份。

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
*   **用户系统**：
    *   注册/登录（ID 不重复）。
    *   JWT 认证。
    *   历史战绩记录。
*   **安全与配置**：
    *   API 全局限速（Rate Limiting）。
    *   敏感配置分离 (`llm.yaml`)。

## 快速开始

### 1. 安装依赖

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
  base_url: "https://api.openai.com/v1" # 或其他兼容接口
  api_key: "sk-xxxxxx"
  model: "gpt-3.5-turbo" # 或其他模型
  temperature: 0.1
```

### 3. 运行服务

```bash
python run.py
```

服务将启动在 `http://127.0.0.1:8000`。

## 技术栈

*   **后端**: Python, FastAPI, SQLModel (SQLite), PyYAML, SlowAPI (限流)
*   **前端**: HTML5, Vanilla JavaScript, Tailwind CSS (CDN)

## 目录结构

```
.
├── app/
│   ├── core/       # 配置与安全
│   ├── routers/    # API 路由
│   ├── services/   # 业务逻辑 (游戏引擎, LLM)
│   ├── main.py     # FastAPI 入口
│   └── models.py   # 数据库模型
├── static/         # 静态资源 (JS, CSS)
├── templates/      # HTML 模板
├── llm.yaml.template
└── requirements.txt
```
