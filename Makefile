DENO = deno
MODULE = mod.ts
FILES =  mod.ts deps.ts dep_test.ts lib

CONFIG = --config tsconfig.json
FLAGS = --allow-net --allow-env --unstable

test:
	@$(DENO) test --coverage=coverage $(FLAGS)
.PHONY: test

format:
	@$(DENO) fmt
.PHONY: format

lint:
	@$(DENO) lint
.PHONY: lint

readme:
	@./scripts/readme.ts
.PHONY: readme

release:
	@npx standard-version
release: readme
.PHONY: release


prerelease:
	@npx standard-version --prerelease
release: readme
.PHONY: prerelease
