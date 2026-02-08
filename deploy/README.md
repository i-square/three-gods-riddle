# Three Gods Riddle - 部署指南

独立部署目录，可直接 rsync 到服务器运行。

## 快速部署

```bash
# 1. 配置环境变量
cp .env.example .env
vim .env  # 填写 OPENAI_API_KEY 和 SECRET_KEY

# 2. 构建并启动
docker compose build
docker compose up -d

# 3. 查看状态
docker compose ps
docker compose logs -f
```

## 访问地址

- 前端：http://localhost:3000
- 健康检查：http://localhost:3000/api/health

## 管理员账户

- 用户名：`root`
- 初始密码：`.env` 中的 `ROOT_PASSWORD`
- 首次登录必须修改密码

## 常用命令

```bash
# 查看日志
docker compose logs -f backend
docker compose logs -f frontend

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 重新构建（代码更新后）
docker compose build && docker compose up -d
```

## 数据持久化

- `data/`：SQLite 数据库
- `logs/backend/`：后端日志
- `logs/frontend/`：Nginx 日志

## 调试模式

在 `.env` 中设置 `DEBUG=true` 可在日志中查看 LLM 的 prompt 和 response。
