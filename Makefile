# ─────────────────────────────────────────────────────────────────────────────
#  Portfolio — project Makefile
# ─────────────────────────────────────────────────────────────────────────────

# Colors (printf interprets these in recipes)
BOLD   := \033[1m
RESET  := \033[0m
RED    := \033[31m
GREEN  := \033[32m
YELLOW := \033[33m
BLUE   := \033[34m
CYAN   := \033[36m

# Config
FRONTEND_DIR  := frontend
BACKEND_DIR   := backend
FRONTEND_PORT ?= 5500
RUN_DIR       := .run
BACKEND_PID   := $(RUN_DIR)/backend.pid
FRONTEND_PID  := $(RUN_DIR)/frontend.pid

.DEFAULT_GOAL := help
.PHONY: help install build watch-css lint test format \
        start stop restart start-backend start-frontend \
        db-setup clean

help: ## Show this help message
	@printf "$(BOLD)$(CYAN)Portfolio — available commands$(RESET)\n\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "} {printf "  \033[32m%-16s\033[0m %s\n", $$1, $$2}'
	@printf "\n$(YELLOW)Tip:$(RESET) run $(BOLD)make start$(RESET) to launch both servers in the background.\n"

install: ## Install frontend and backend dependencies
	@printf "$(BLUE)➜ Installing frontend deps...$(RESET)\n"
	@cd $(FRONTEND_DIR) && npm install
	@printf "$(BLUE)➜ Installing backend deps...$(RESET)\n"
	@cd $(BACKEND_DIR) && npm install
	@printf "$(GREEN)✓ Dependencies installed$(RESET)\n"

build: ## Build the Tailwind CSS bundle
	@printf "$(BLUE)➜ Building CSS...$(RESET)\n"
	@cd $(FRONTEND_DIR) && npm run build:css
	@printf "$(GREEN)✓ CSS built$(RESET)\n"

watch-css: ## Rebuild Tailwind CSS on change
	@cd $(FRONTEND_DIR) && npm run watch:css

lint: ## Lint the backend code
	@cd $(BACKEND_DIR) && npm run lint

test: ## Run backend tests
	@cd $(BACKEND_DIR) && npm test

format: ## Format code with Prettier
	@cd $(BACKEND_DIR) && npm run format

db-setup: ## Load the database schema (uses backend/.env)
	@printf "$(BLUE)➜ Loading schema into MySQL...$(RESET)\n"
	@set -a; . $(BACKEND_DIR)/.env; set +a; \
		mysql -h "$$MYSQL_HOST_IP" -u "$$MYSQL_USER" -p"$$MYSQL_PASSWORD" "$$MYSQL_DATABASE" < $(BACKEND_DIR)/db/schema.sql
	@printf "$(GREEN)✓ Schema loaded$(RESET)\n"

start-backend: ## Start the backend server (foreground)
	@cd $(BACKEND_DIR) && npm start

start-frontend: ## Serve the static frontend (foreground)
	@printf "$(CYAN)Serving frontend at http://localhost:$(FRONTEND_PORT)$(RESET)\n"
	@python3 -m http.server $(FRONTEND_PORT) --directory $(FRONTEND_DIR)/public

start: build ## Start backend + frontend in the background
	@mkdir -p $(RUN_DIR)
	@printf "$(BLUE)➜ Starting backend...$(RESET)\n"
	@cd $(BACKEND_DIR) && (npm start > ../$(RUN_DIR)/backend.log 2>&1 & echo $$! > ../$(BACKEND_PID))
	@printf "$(BLUE)➜ Starting frontend on port $(FRONTEND_PORT)...$(RESET)\n"
	@python3 -m http.server $(FRONTEND_PORT) --directory $(FRONTEND_DIR)/public > $(RUN_DIR)/frontend.log 2>&1 & echo $$! > $(FRONTEND_PID)
	@printf "$(GREEN)✓ App started$(RESET)\n"
	@printf "  $(BOLD)Frontend:$(RESET) http://localhost:$(FRONTEND_PORT)\n"
	@printf "  $(BOLD)Backend :$(RESET) http://localhost:8000\n"
	@printf "  $(YELLOW)Logs in $(RUN_DIR)/  •  run 'make stop' to stop$(RESET)\n"

stop: ## Stop the background servers
	@printf "$(RED)➜ Stopping servers...$(RESET)\n"
	@-[ -f $(BACKEND_PID) ]  && kill `cat $(BACKEND_PID)`  2>/dev/null && rm -f $(BACKEND_PID)  && printf "  stopped backend\n"  || true
	@-[ -f $(FRONTEND_PID) ] && kill `cat $(FRONTEND_PID)` 2>/dev/null && rm -f $(FRONTEND_PID) && printf "  stopped frontend\n" || true
	@printf "$(GREEN)✓ Stopped$(RESET)\n"

restart: stop start ## Restart the background servers

clean: ## Remove dependencies, build output and run artifacts
	@printf "$(RED)➜ Cleaning...$(RESET)\n"
	@rm -rf $(FRONTEND_DIR)/node_modules $(BACKEND_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/dist $(RUN_DIR)
	@printf "$(GREEN)✓ Clean$(RESET)\n"
