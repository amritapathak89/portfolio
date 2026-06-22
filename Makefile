# ─────────────────────────────────────────────────────────────────────────────
#  Amrita Vidhate — Portfolio   ·   make targets
# ─────────────────────────────────────────────────────────────────────────────

# Colors
CYAN   := \033[0;36m
GREEN  := \033[0;32m
YELLOW := \033[1;33m
BLUE   := \033[0;34m
BOLD   := \033[1m
RESET  := \033[0m

FRONTEND := frontend
PUBLIC   := $(FRONTEND)/public
PORT     ?= 8080

.DEFAULT_GOAL := help

# ── Help ─────────────────────────────────────────────────────────────────────
.PHONY: help
help: ## Show this help
	@printf "$(BOLD)$(CYAN)Amrita Vidhate — Portfolio$(RESET)\n"
	@printf "$(YELLOW)Usage:$(RESET) make $(GREEN)<target>$(RESET)\n\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "} {printf "  $(GREEN)%-12s$(RESET) %s\n", $$1, $$2}'
	@printf "\n$(BLUE)Tip:$(RESET) override the serve port with $(YELLOW)PORT=3000 make serve$(RESET)\n"

# ── Setup ────────────────────────────────────────────────────────────────────
.PHONY: install
install: ## Install npm dependencies (Tailwind CLI)
	@printf "$(CYAN)→ Installing dependencies…$(RESET)\n"
	@cd $(FRONTEND) && npm install
	@printf "$(GREEN)✓ Dependencies installed$(RESET)\n"

# ── Dev / Build ──────────────────────────────────────────────────────────────
.PHONY: dev
dev: ## Watch & rebuild Tailwind CSS on change
	@printf "$(CYAN)→ Watching CSS (Ctrl-C to stop)…$(RESET)\n"
	@cd $(FRONTEND) && npm run dev

.PHONY: build
build: ## Build minified production CSS
	@printf "$(CYAN)→ Building minified CSS…$(RESET)\n"
	@cd $(FRONTEND) && npm run build
	@printf "$(GREEN)✓ Built $(PUBLIC)/output.css$(RESET)\n"

# ── Format ───────────────────────────────────────────────────────────────────
PRETTIER := $(FRONTEND)/node_modules/.bin/prettier

.PHONY: format
format: ## Format HTML/CSS/JS/JSON/MD with Prettier
	@printf "$(CYAN)→ Formatting with Prettier…$(RESET)\n"
	@$(PRETTIER) --write "**/*.{js,css,html,json,md}"
	@printf "$(GREEN)✓ Formatted$(RESET)\n"

.PHONY: format-check
format-check: ## Check formatting without writing changes
	@printf "$(CYAN)→ Checking formatting…$(RESET)\n"
	@$(PRETTIER) --check "**/*.{js,css,html,json,md}"

# ── Serve ────────────────────────────────────────────────────────────────────
.PHONY: serve
serve: ## Serve the static site (PORT=8080 by default)
	@printf "$(CYAN)→ Serving $(PUBLIC) at $(YELLOW)http://localhost:$(PORT)$(RESET)\n"
	@python3 -m http.server --directory $(PUBLIC) $(PORT)

.PHONY: open
open: ## Open the page directly in the default browser
	@printf "$(CYAN)→ Opening $(PUBLIC)/index.html…$(RESET)\n"
	@xdg-open $(PUBLIC)/index.html 2>/dev/null || open $(PUBLIC)/index.html 2>/dev/null || \
		printf "$(YELLOW)! Open $(PUBLIC)/index.html manually$(RESET)\n"

# ── Maintenance ──────────────────────────────────────────────────────────────
.PHONY: clean
clean: ## Remove generated CSS
	@printf "$(YELLOW)→ Removing generated output.css…$(RESET)\n"
	@rm -f $(PUBLIC)/output.css
	@printf "$(GREEN)✓ Cleaned$(RESET)\n"

.PHONY: distclean
distclean: clean ## Remove generated CSS + node_modules
	@printf "$(YELLOW)→ Removing node_modules…$(RESET)\n"
	@rm -rf $(FRONTEND)/node_modules
	@printf "$(GREEN)✓ Fully cleaned$(RESET)\n"
