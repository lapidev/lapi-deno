.PHONY: default test format lint run ci cache docs coverage

IMPORT_MAP = import_map.json
DENO = deno
EXAMPLES = examples/
MODULE = mod.ts

CONFIG = --config tsconfig.json

default: test

cache:
	@$(DENO) cache deps.ts deps_test.ts

test:
	@$(DENO) test $(CONFIG) --coverage --allow-net --unstable

format:
	@$(DENO) fmt $(filter-out $@,$(MAKECMDGOALS))

lint:
	@$(DENO) lint --unstable

run:
	@$(DENO) run $(CONFIG) --watch --allow-net=0.0.0.0 --allow-env --unstable $(EXAMPLES)$(filter-out $@,$(MAKECMDGOALS))

doc:
	@$(DENO) doc --json $(MODULE) > docs.json

docs:
	@$(DENO) run --allow-run --allow-write --allow-read scripts/docs.ts

coverage:
	@$(DENO) run $(CONFIG) --allow-run --allow-read scripts/coverage.ts

ci: cache lint test doc

%:
	@:
