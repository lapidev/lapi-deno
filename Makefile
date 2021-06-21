DENO = deno
MODULE = mod.ts
FILES =  mod.ts deps.ts dep_test.ts lib

CONFIG = --config tsconfig.json
FLAGS = --allow-net --allow-env

test:
	@$(DENO) test --coverage=coverage $(FLAGS)
.PHONY: test

format:
	@$(DENO) fmt
.PHONY: format

lint:
	@$(DENO) lint
.PHONY: lint

release:
	npx standard-version
.PHONY: release


prerelease:
	npx standard-version --prerelease
.PHONY: prerelease
