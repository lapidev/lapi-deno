.PHONY: default test format lint run

IMPORT_MAP = import_map.json
DENO = deno
TEST_FILTER = lib/.*_test.ts
EXAMPLES = examples/

FLAGS = --importmap=$(IMPORT_MAP) --allow-net --unstable

default: test

test:
	@$(DENO) test --coverage $(FLAGS) --filter $(TEST_FILTER)

format:
	@$(DENO) fmt lib

lint:
	@$(DENO) fmt --check lib

run:
	@$(DENO) run $(FLAGS) $(EXAMPLES)$(filter-out $@,$(MAKECMDGOALS))

doc:
	@$(DENO) doc --json lib/mod.ts > docs.json

%:
	@:
