.PHONY: setup cache test format lint docs release ci

IMPORT_MAP = import_map.json
DENO = deno
MODULE = mod.ts
FILES =  mod.ts deps.ts dep_test.ts lib

CONFIG = --config tsconfig.json
FLAGS = --allow-net --allow-env

setup:
	@sudo ln -s ${DENO_INSTALL}/bin/deno /usr/bin/deno
	@curl https://raw.githubusercontent.com/second-state/ssvmup/master/installer/init.sh -sSf | sh

cache:
	@$(DENO) cache --unstable deps.ts deps_test.ts

test:
	@$(DENO) test $(CONFIG) --coverage $(FLAGS) lib

int:
	@$(DENO) test $(CONFIG) --allow-run $(FLAGS) --unstable test

format:
	@$(DENO) fmt lib test

lint:
	@$(DENO) lint --unstable lib test

docs:
	@$(DENO) run --allow-run --allow-write --allow-read scripts/docs.ts

release: clean build test docs
	git add . && git commit -m "built files" && npx standard-version --commit-all --tag-prefix ""

ci: lint cache test-deno docs
