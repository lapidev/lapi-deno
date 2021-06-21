DENO = deno
MODULE = mod.ts
FILES =  mod.ts deps.ts dep_test.ts lib

CONFIG = --config tsconfig.json
FLAGS = --allow-net --allow-env

test:
	@$(DENO) test --coverage=coverage $(FLAGS) --unstable lib
.PHONY: test

format:
	@$(DENO) fmt lib test
.PHONY: format

lint:
	@$(DENO) lint --unstable lib test
.PHONY: lint

release:
	npx standard-version
.PHONY: release


prerelease:
	npx standard-version --prerelease
.PHONY: prerelease
