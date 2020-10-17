.PHONY: test format lint ci cache docs release build-deno build-rust test-deno test-rust ci-deno ci-rust

IMPORT_MAP = import_map.json
DENO = deno
CARGO = cargo
EXAMPLES = examples/
MODULE = mod.ts

CONFIG = --config tsconfig.json
FLAGS = --allow-net=0.0.0.0 --allow-read --allow-env --unstable

setup:
  @curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
	@echo export PATH="${PATH}:/usr/local/cargo/bin" >> ~/.bashrc
	@source /usr/local/cargo/env
	@sudo ln -s ${DENO_INSTALL}/bin/deno /usr/bin/deno
	@curl https://raw.githubusercontent.com/second-state/ssvmup/master/installer/init.sh -sSf | sh

clean:
	@$(CARGO) clean
	@rm -rf wasm

cache:
	@$(DENO) cache --unstable deps.ts deps_test.ts

test-rust:
	@$(CARGO) check
	@$(CARGO) test

test-deno:
	@$(DENO) test $(CONFIG) --coverage $(FLAGS) mod.ts lib

test: test-rust test-deno

format:
	@$(DENO) fmt
	@$(CARGO) fmt

lint:
	@$(DENO) lint --unstable

docs:
	@$(DENO) run --allow-run --allow-write --allow-read scripts/docs.ts

build-rust:
	deno run --allow-run --allow-read --allow-write scripts/build.ts

build: build-rust

release: clean build test docs
	git add . && git commit -m "built files" && npx standard-version --commit-all --tag-prefix ""

ci-rust: clean test-rust build-rust

ci-deno: lint cache test-deno doc

ci: ci-rust ci-deno
