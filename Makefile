SHELL := /bin/bash

.PHONY: format format-check install upgrade db-fresh db-migrate db-seed db restart stop up rm prune build-prod migrate-prod start-prod deploy

format:
	node ./format/command.js

format-check:
	node ./format/command.js --check

install:
	rm -rf node_modules package-lock.json
	pnpm install

upgrade:
	npx ncu -u
	${MAKE} install

restart:
	docker restart app

db-fresh:
	rm -rf static
	docker compose exec -T app node ace migration:fresh

db-migrate:
	docker compose exec -T app node ace migration:run

db-seed:
	docker compose exec -T app node ace db:seed

db: db-fresh db-seed restart format

stop:
	docker compose down --remove-orphans

up:
	${MAKE} stop
	rm -rf node_modules/.vite .adonisjs
	npx simple-git-hooks
	docker compose up -d --build

rm:
	docker compose down --volumes --remove-orphans

start: install rm up db

prune:
	docker system prune -f
