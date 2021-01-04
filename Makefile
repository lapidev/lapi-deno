IMPORT_MAP = import_map.json
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

release: test int
	npx standard-version --commit-all --tag-prefix ""
release: docs
.PHONY: release

cov:
	@$(DENO) run --allow-run --allow-read scripts/coverage.ts
.PHONY: cov

ci: lint cache cov
.PHONY: ci

tag:
	@$(DENO) run --allow-read --allow-run scripts/tag.ts
.PHONY: tag
