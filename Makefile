.PHONY: default test format lint run ci cache docs coverage

IMPORT_MAP = import_map.json
DENO = deno
EXAMPLES = examples/
MODULE = mod.ts

FLAGS = --allow-net --unstable

default: test

cache:
	@$(DENO) cache deps.ts deps_test.ts

test:
	@$(DENO) test --coverage $(FLAGS)

format:
	@$(DENO) fmt lib

lint:
	@$(DENO) fmt --check lib

run:
	@$(DENO) run $(FLAGS) $(EXAMPLES)$(filter-out $@,$(MAKECMDGOALS))

doc:
	@$(DENO) doc --json $(MODULE) > docs.json

docs:
	@$(DENO) run --allow-run --allow-write --allow-read scripts/docs.ts

coverage:
	@$(DENO) run --allow-run --allow-read scripts/coverage.ts

ci: cache lint test doc

%:
	@:
