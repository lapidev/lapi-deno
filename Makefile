.PHONY: test format lint ci cache docs release build-wasm

IMPORT_MAP = import_map.json
DENO = deno
EXAMPLES = examples/
MODULE = mod.ts

CONFIG = --config tsconfig.json
FLAGS = --allow-net=0.0.0.0 --allow-read --allow-env --unstable

cache:
	@$(DENO) cache deps.ts deps_test.ts

test:
	@$(DENO) test $(CONFIG) --coverage $(FLAGS)

format:
	@$(DENO) fmt $(filter-out $@,$(MAKECMDGOALS))

lint:
	@$(DENO) lint --unstable

docs:
	@$(DENO) run --allow-run --allow-write --allow-read scripts/docs.ts

build-wasm:
	deno run --allow-run --allow-read scripts/build.ts

bundle:
	@rm -rf dist/
	@mkdir dist/
	@$(DENO) bundle $(CONFIG) mod.ts dist/mod.bundle.js

release: build-wasm test bundle docs
	git add . && git commit -m "built files" && npx standard-version --commit-all --tag-prefix ""

ci: cache lint test doc

%:
	@:
