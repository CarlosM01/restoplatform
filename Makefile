# RestoApp Project Makefile
# Standardizes common development tasks for frontend, backend, and database.

.PHONY: help up down restart status logs logs-backend logs-frontend build clean backend-shell frontend-shell db-shell db-migrate db-seed frontend-install frontend-dev frontend-up

# Dynamic Docker Compose CLI detection
DOCKER_COMBO := $(shell docker compose version >/dev/null 2>&1 && echo "docker compose" || echo "docker-compose")

help:
	@echo "========================================================================"
	@echo "                            RestoApp - Makefile                          "
	@echo "========================================================================"
	@echo "Available commands:"
	@echo ""
	@echo "Docker Compose Commands:"
	@echo "  make up                     Start services in the background (detached)"
	@echo "  make down                   Stop and remove all containers"
	@echo "  make restart                Restart all containers"
	@echo "  make status                 Show status of all running containers"
	@echo "  make logs                   Follow logs from all containers"
	@echo "  make logs-backend           Follow logs from the backend API container"
	@echo "  make logs-frontend          Follow logs from the frontend Nginx container"
	@echo "  make build                  Build or rebuild services"
	@echo "  make clean                  Stop containers and remove volumes (wipes database)"
	@echo ""
	@echo "Database & Alembic Commands (inside Docker):"
	@echo "  make db-migrate             Run database migrations (Alembic upgrade head)"
	@echo "  make db-seed                Re-run database seeding"
	@echo "  make db-shell               Open interactive PostgreSQL shell"
	@echo ""
	@echo "Shell Access:"
	@echo "  make backend-shell          Get sh shell inside the backend container"
	@echo "  make frontend-shell         Get sh shell inside the frontend container"
	@echo ""
	@echo "Frontend Commands (Local host):"
	@echo "  make frontend-install       Install frontend dependencies"
	@echo "  make frontend-dev           Start local Astro development server"
	@echo "  make frontend-up            Start local Astro development server (alias for frontend-dev)"
	@echo "========================================================================"

# --- Docker Compose ---

up:
	@echo "Starting services..."
	$(DOCKER_COMBO) up -d

down:
	@echo "Stopping services..."
	$(DOCKER_COMBO) down

restart:
	@echo "Restarting services..."
	$(DOCKER_COMBO) restart

status:
	$(DOCKER_COMBO) ps

logs:
	$(DOCKER_COMBO) logs -f

logs-backend:
	$(DOCKER_COMBO) logs -f backend

logs-frontend:
	$(DOCKER_COMBO) logs -f frontend

build:
	@echo "Building containers..."
	$(DOCKER_COMBO) build

clean:
	@echo "WARNING: This will stop services and completely wipe all volumes!"
	$(DOCKER_COMBO) down -v

# --- Database & Shell ---

db-migrate:
	@echo "Running migrations..."
	$(DOCKER_COMBO) exec backend alembic upgrade head

db-seed:
	@echo "Seeding database..."
	$(DOCKER_COMBO) exec backend python -m app.seed

db-shell:
	$(DOCKER_COMBO) exec postgres psql -U postgres -d restoplatform

backend-shell:
	$(DOCKER_COMBO) exec backend sh

frontend-shell:
	$(DOCKER_COMBO) exec frontend sh

# --- Frontend (Local) ---

frontend-install:
	@echo "Installing frontend packages..."
	cd frontend && npm install

frontend-dev:
	@echo "Starting Astro dev server..."
	cd frontend && npm run dev