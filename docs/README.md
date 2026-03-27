# Documentação — Level Bot

Esta pasta contém toda a documentação do projeto.

## Plans

Plans são documentos detalhados de design e implementação para features ou refactors maiores.

### NestJS Migration (2026-03-27)

- **Design:** `plans/2026-03-27-nestjs-migration-design.md` — Arquitetura completa, estrutura de módulos, schema Drizzle, sistema de comandos, eventos, workers, features novas, infraestrutura.
- **Implementation Plan:** `plans/2026-03-27-nestjs-migration-plan.md` — 25 tasks bite-sized em 7 fases, com código completo, passos TDD, e commits frequentes.

**O que inclui:**
- Refactor completo de Node.js/discord.js para NestJS + Necord + Drizzle ORM + Redis
- 5 features novas: notificações de level-up, Robux na loja, resgate via thread privada, auto-leave de servers não autorizados, seeds para VIP
- Schema PostgreSQL preservado exatamente (zero migrações)
- Todos os 18 slash commands + 16 prefix commands
- 3 cron workers (@nestjs/schedule)
- Docker multi-stage build com Redis

## Status

| Documento | Status | Data |
|---|---|---|
| NestJS Migration Design | ✅ Aprovado | 2026-03-27 |
| NestJS Migration Plan | ✅ Pronto para executar | 2026-03-27 |

## Próximos Passos

1. Escolher modo de execução: Subagent-Driven ou Sessão Paralela
2. Executar Phase 1 (scaffold NestJS)
3. Executar Phase 2 (domain services)
4. Executar Phase 3 (bot layer)
5. Executar Phase 4-7 (workers, seeds, docker, cleanup, verification)

Ver `2026-03-27-nestjs-migration-plan.md` para detalhes completos.
