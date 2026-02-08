.PHONY: help install dev test lint format clean

.DEFAULT_GOAL := help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-15s %s\n", $$1, $$2}'

install: ## Install dependencies
	pip install -r requirements.txt
	cd frontend && npm install

dev: ## Start dev servers (backend + frontend)
	@echo "Starting backend..."
	uvicorn app.main:app --reload &
	@echo "Starting frontend..."
	cd frontend && npm run dev

test: ## Run tests
	pytest tests/ -v
	cd frontend && npm test

lint: ## Lint code
	flake8 app/ --max-line-length=100
	cd frontend && npm run lint

format: ## Format code
	black app/
	isort app/
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,json,css}"

clean: ## Clean build artifacts
	rm -rf __pycache__ app/__pycache__ app/**/__pycache__
	rm -rf .pytest_cache htmlcov .coverage
	rm -rf frontend/node_modules frontend/dist
