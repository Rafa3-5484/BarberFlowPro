# BarberFlow Pro - Contexto do Projeto

## Objetivo
Sistema completo de gestão para barbearias com frontend Next.js e backend NestJS.

## Estrutura
```
BarberFlowPro/
├── backend/          # API NestJS (TypeScript, Prisma, PostgreSQL)
│   ├── src/
│   │   ├── auth/           # JWT, Refresh Token, Roles
│   │   ├── users/          # CRUD usuários
│   │   ├── clients/        # CRUD clientes + export
│   │   ├── services/       # CRUD serviços
│   │   ├── employees/      # CRUD funcionários + agenda
│   │   ├── appointments/   # Agendamentos com controle de conflito
│   │   ├── products/       # Produtos + controle de estoque
│   │   ├── cashier/        # Caixa (abrir/fechar/movimentos)
│   │   ├── commissions/    # Comissões automáticas
│   │   ├── financial/      # Financeiro (receitas/despesas)
│   │   ├── dashboard/      # Estatísticas do dashboard
│   │   ├── reports/        # Relatórios PDF/Excel
│   │   ├── notifications/  # Notificações internas
│   │   └── prisma/         # Schema + PrismaService
│   └── ...
├── frontend/         # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/     # Login, Register, Forgot Password
│   │   │   ├── (dashboard)/# Dashboard, Agenda, Clientes, etc.
│   │   │   └── (client)/   # Área do Cliente
│   │   ├── components/ui/  # Button, Input, Card, Modal, etc.
│   │   ├── hooks/          # useAuth, useTheme
│   │   ├── lib/            # utils, api (axios)
│   │   └── types/          # TypeScript interfaces
│   └── ...
└── package.json      # Scripts raiz
```

## Arquivos modificados/criados
- Backend: 14 módulos, ~48 arquivos fonte
- Frontend: 16 páginas, 12 componentes UI, hooks, lib, types
- Compilação: 0 erros em ambos os projetos

## Decisões importantes
- **Auth**: JWT + Refresh Token com roles (OWNER, MANAGER, BARBER, RECEPTIONIST, CLIENT)
- **ORM**: Prisma com PostgreSQL
- **Dashboard**: Endpoint único /dashboard retorna dados flat para o frontend
- **UI**: Tailwind CSS + Framer Motion + Recharts + Radix UI + Lucide Icons
- **Tema**: Dark/Light mode com persistência em localStorage
- **Layout**: Sidebar colapsável + header sticky com notificações

## Status de verificação
- Backend: `nest build` — 0 erros
- Frontend: `next build` — 0 erros, 0 warnings
- Prisma: `prisma generate` — OK

## Próximos passos
1. Configurar PostgreSQL e rodar `prisma db push` ou `prisma migrate dev`
2. Rodar `npm run prisma:seed` no backend para dados iniciais
3. Iniciar backend: `npm start` (porta 3001)
4. Iniciar frontend: `npm run dev` (porta 3000)
5. Conectar integração WhatsApp (webhook)
6. Adicionar testes (E2E e unitários)
