# Three Gods Riddle (三神问题)

基于 Web 的"三神问题"逻辑解谜游戏。玩家需要通过向三位身份未知的神（真理、谎言、随机）提问，根据他们用未知语言（Ja/Da）的回答，推理出真实身份。

## 功能特性

- **三神逻辑**：真理神永远说真话，谎言神永远说假话，随机神随机回答
- **LLM 驱动**：真理与谎言之神的回答由大语言模型生成
- **游戏机制**：限制 3 个问题，Ja/Da 随机对应 Yes/No
- **用户系统**：注册/登录、JWT 认证、历史战绩、管理后台
- **国际化**：支持中英文界面

## 技术栈

- **后端**：Python, FastAPI, SQLModel (SQLite)
- **前端**：React 19 + TypeScript, Vite, Tailwind CSS

## 部署

生产部署请参考 [deploy/README.md](./deploy/README.md)。

## 本地开发

```bash
# 后端
pip install -r requirements.txt
cp .env.example .env  # 配置 OPENAI_API_KEY 等
uvicorn app.main:app --reload

# 前端
cd frontend && npm install && npm run dev
```

## 目录结构

```
├── app/                # 后端
│   ├── core/           # 配置、日志、健康检查
│   ├── services/       # 游戏引擎、LLM 服务
│   ├── main.py         # FastAPI 入口
│   └── models.py       # 数据模型
├── frontend/           # 前端 React 应用
├── deploy/             # 独立部署目录
└── tests/              # 测试
```

## License

MIT
