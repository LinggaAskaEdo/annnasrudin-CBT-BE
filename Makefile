# Makefile for Vibe Engineering (CBT Backend)

.PHONY: install dev start test db-migrate db-generate db-studio help

# Default target: show help
help:
	@echo "DB DB an"
	@echo "--------------------------------"
	@echo "Usage:"
	@echo "  make install      - Install all dependencies (npm install)"
	@echo "  make dev          - Run development server with nodemon"
	@echo "  make start        - Run production server"
	@echo "  make test         - Run unit/integration tests with Jest"
	@echo "  make db-migrate   - Create/apply database migrations"
	@echo "  make db-generate  - Generate Prisma client"
	@echo "  make db-studio    - Open Prisma Studio"

install:
	npm install

dev:
	npm run dev

start:
	npm run start

test:
	npm run test

db-migrate:
	npx prisma migrate dev

db-generate:
	npx prisma generate

db-studio:
	npx prisma studio
