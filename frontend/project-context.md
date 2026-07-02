# BarberFlow Pro - Frontend

## Objetivo
Frontend Next.js 14 completo para sistema de gerenciamento de barbearias com App Router, TypeScript, Tailwind CSS, Framer Motion, Recharts, Radix UI.

## Estrutura de Arquivos

### Config
- `package.json` - Dependencias e scripts
- `tsconfig.json` - TypeScript config com path `@/*`
- `next.config.mjs` - Next.js config
- `tailwind.config.ts` - Tailwind com cores primary/barb, fontes, animacoes
- `postcss.config.mjs` - PostCSS config
- `.eslintrc.json` - ESLint config

### Core
- `src/app/layout.tsx` - Root layout com AuthProvider, ThemeProvider, Toaster
- `src/app/page.tsx` - Pagina inicial com redirect para /dashboard ou /login
- `src/app/globals.css` - Estilos globais, dark mode, scrollbar, utilities
- `src/types/index.ts` - Tipos TypeScript (User, Client, Appointment, etc.)
- `src/lib/utils.ts` - Utilitarios (cn, formatCurrency, formatDate, etc.)
- `src/lib/api.ts` - Axios instance com refresh token interceptors
- `src/hooks/useAuth.tsx` - Context de autenticacao
- `src/hooks/useTheme.tsx` - Context de tema (light/dark)

### UI Components (src/components/ui/)
- `button.tsx` - Botao com variantes e loading state
- `input.tsx` - Input com label, erro, icones
- `card.tsx` - Card, CardHeader, CardContent, CardFooter
- `badge.tsx` - Badge com variantes de cor
- `modal.tsx` - Modal com Radix Dialog + Framer Motion
- `select.tsx` - Select com Radix Select
- `table.tsx` - Table, Thead, Tbody, Tr, Th, Td
- `tabs.tsx` - Tabs com Radix Tabs
- `avatar.tsx` - Avatar com fallback de iniciais
- `dropdown.tsx` - Dropdown menu com Radix
- `empty-state.tsx` - Estado vazio com icone, titulo, acao
- `loading.tsx` - Spinner, PageLoading, Skeleton, CardSkeleton, TableSkeleton

### Layout (src/app/(dashboard)/_components/layout/)
- `sidebar.tsx` - Sidebar com navegacao, collapse, mobile drawer
- `header.tsx` - Header com busca, theme toggle, notificacoes, avatar
- `dashboard-layout.tsx` - Layout wrapper combinando sidebar + header

### Paginas
- `login/page.tsx` - Login com split layout, animacoes
- `register/page.tsx` - Cadastro com validacao
- `forgot-password/page.tsx` - Recuperacao de senha
- `dashboard/page.tsx` - Dashboard com stats, graficos, servicos, estoque
- `clientes/page.tsx` - CRUD clientes com grid, busca, modal detalhe
- `agenda/page.tsx` - Agenda com views dia/semana/mes, timeline
- `servicos/page.tsx` - CRUD servicos com grid, categorias, toggle ativo
- `funcionarios/page.tsx` - CRUD funcionarios com detalhe, horarios
- `produtos/page.tsx` - CRUD produtos com estoque, tabela
- `caixa/page.tsx` - Caixa diario, movimentacoes, abre/fecha
- `financeiro/page.tsx` - Financeiro com grafico, receitas/despesas
- `comissoes/page.tsx` - Comissoes com filtros, marcar pago
- `relatorios/page.tsx` - Relatorios PDF/Excel por tipo
- `configuracoes/page.tsx` - Configuracoes da barbearia
- `area-cliente/page.tsx` - Portal do cliente com agendamento

## Decisoes
- Next.js 14 App Router com `'use client'` onde necessario
- Framer Motion para animacoes em cards e transicoes
- Recharts para graficos (barras, linhas)
- Radix UI para componentes acessiveis (Dialog, Select, Tabs, Dropdown)
- Lucide React para icones
- Axios com interceptor de refresh token
- Dark mode com classe `.dark` e localStorage
- Tudo em portugues (labels, botoes, textos)
- Formatacao monetaria em BRL (pt-BR)
- CSS custom properties para theming

## Status
- Build: Sucesso
- 16 paginas estaticas geradas
- Apenas warning de `<img>` no avatar (usar next/image depois)

## Proximos Passos
- Integrar com backend API
- Adicionar formularios completos de criacao/edicao
- Implementar upload de imagens
- Adicionar testes
- Configurar PWA
