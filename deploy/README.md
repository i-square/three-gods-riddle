# Three Gods Riddle - 部署指南

独立部署目录，可直接 rsync 到服务器运行。

## 使用 `deploy/.env`（不会覆盖）

项目默认读取 `deploy/.env`（以部署文件所在目录为基准）。
请先确认 `deploy/.env` 已配置好 `ROOT_PASSWORD`、`OPENAI_API_KEY`、`DATABASE_URL`、`CORS_ORIGINS` 等。

```bash
cd deploy

# 先复制模板再修改（推荐）：
cp ../.env.template .env
```

## 核心网络约束

当前编排中，前后端使用同一个新建的 bridge 网络 `3gods_bridge`。

- 后端只在容器网络暴露 `8000`，不映射到宿主机端口。
- 前端服务对外仅暴露以下端口：
  - 开发：`3000 -> 5173`
  - 生产：`80`

## 开发模式（源码挂载 + 0.0.0.0）

```bash
cd deploy
# 后端热重载 + 前端 Vite，前端请求走 /api 代理到 backend

docker compose -f docker-compose.yml up -d --build

# 查看状态
docker compose -f docker-compose.yml ps
docker compose -f docker-compose.yml logs -f
```

开发模式前端监听 `0.0.0.0:5173`，对外映射到 `http://localhost:3000`。

## 生产模式（前后端容器化）

```bash
cd deploy
# 前端走 Nginx 静态资源 + /api 反代到 backend

docker compose -f docker-compose.prod.yml up -d --build

# 查看状态
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

生产前端默认对外 `80` 端口，可按需改为 `3000:80`。

## 访问地址

- 开发模式前端：`http://localhost:3000`
- 生产模式前端：`http://localhost`
- 健康检查：仅容器内可直接访问，命令如下

```bash
# 任选一种模式后都可执行（下面示例以开发模式为例）
docker compose -f docker-compose.yml exec backend curl http://localhost:8000/health
```

## 管理员账户

- 用户名：`root`
- 初始密码：`deploy/.env` 中的 `ROOT_PASSWORD`
- 首次登录必须修改密码

### 忘记 root 密码（不删库）

```bash
cd deploy
# 使用 deploy/.env 中的 ROOT_PASSWORD（如果没有 --password 参数）恢复 root，并把 must_change_password 置为 true
docker exec 3gods-backend python /app/app/tools/reset_root_user.py

# 如需指定新密码
docker exec 3gods-backend python /app/app/tools/reset_root_user.py --password 'your_new_password'
```

### LLM 不可达时先用 mock 模式

如果 `OPENAI_BASE_URL`/模型配置不一致导致 `/game/ask` 一直返回
`daydreaming`，可临时启用 mock 模式先跑通登录与流程：

```bash
cd deploy
MOCK_LLM=true docker compose -f docker-compose.yml up -d --build
```

更推荐编辑 `deploy/.env` 持久化：

```bash
MOCK_LLM=true
```

mock 模式会随机返回 `Ja/Da`，用于 UI/流程联调，不依赖外部 LLM。上线前请改回 `false` 并恢复真实配置。

## 常用命令

```bash
# 查看日志（按模式选择）
docker compose -f docker-compose.yml logs -f backend
docker compose -f docker-compose.yml logs -f frontend

docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# 重启服务
docker compose -f docker-compose.yml restart
# 或
docker compose -f docker-compose.prod.yml restart

# 停止服务
docker compose -f docker-compose.yml down
docker compose -f docker-compose.prod.yml down
```

## 数据持久化

- `data/`：SQLite 数据库（两个模式共享同一目录）
- `logs/backend/`：后端日志目录
- 前端开发日志：`docker compose ... logs -f frontend`

## 重置数据库（可选）

```bash
# 停止服务（按需选模式）
docker compose -f docker-compose.yml down
# 或
docker compose -f docker-compose.prod.yml down

# 清理数据库文件（当前目录）
rm -f ./data/database.db

# 重新启动（会重新创建 root）
docker compose -f docker-compose.yml up -d --build
# 或生产
docker compose -f docker-compose.prod.yml up -d --build
```

## 调试模式

在 `deploy/.env` 中设置 `DEBUG=true` 可在日志中查看 LLM 的 prompt 和 response。
