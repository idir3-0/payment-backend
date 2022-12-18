dev-build:
	docker compose -f docker-compose.dev.yml build

dev-up: dev-down
	docker compose -f docker-compose.dev.yml up

dev-down:
	docker compose -f docker-compose.dev.yml down