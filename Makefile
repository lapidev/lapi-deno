DENO = deno
MODULE = mod.ts
FILES =  mod.ts deps.ts dep_test.ts lib

CONFIG = --config tsconfig.json
FLAGS = --allow-net --allow-env

setup:
	@sudo ln -s ${DENO_INSTALL}/bin/deno /usr/bin/deno
	@curl https://raw.githubusercontent.com/second-state/ssvmup/master/installer/init.sh -sSf | sh
.PHONY: setup

cache:
	@$(DENO) cache --reload --unstable deps.ts deps_test.ts
.PHONY: cache

test:
	@$(DENO) test $(CONFIG) --coverage=coverage $(FLAGS) --unstable lib
.PHONY: test

int:
	@$(DENO) test $(CONFIG) --allow-run $(FLAGS) --unstable test
.PHONY: int

format:
	@$(DENO) fmt lib test
.PHONY: format

lint:
	@$(DENO) lint --unstable lib test
.PHONY: lint

docs:
	@$(DENO) run --allow-run --allow-write --allow-read scripts/docs.ts
.PHONY: docs

release:
	npx standard-version --commit-all
.PHONY: release

ci: lint cache test
.PHONY: ci
