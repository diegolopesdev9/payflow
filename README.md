# PagueFlow 💰

Sistema inteligente de controle financeiro pessoal para gerenciar suas contas a pagar, nunca mais esquecer vencimentos e ter total visibilidade dos seus gastos.

## 📋 Sobre o Projeto

PagueFlow é uma aplicação web moderna e intuitiva desenvolvida para ajudar pessoas a organizarem suas finanças pessoais. Com interface responsiva e recursos avançados de visualização de dados, você mantém o controle total sobre suas despesas mensais.

## ✨ Funcionalidades

### Gestão de Contas
- Cadastro de contas a pagar com data de vencimento
- Categorização personalizada de despesas
- Marcação de contas como pagas
- Alertas de vencimento próximo
- Histórico completo de pagamentos

### Visualização e Relatórios
- Dashboard interativo com visão geral financeira
- Gráficos de despesas por categoria
- Análise de gastos mensais e anuais
- Insights sobre padrões de consumo
- Acompanhamento de metas financeiras

### Experiência do Usuário
- Interface moderna e intuitiva
- Design responsivo mobile-first
- Modo claro e escuro
- Performance otimizada
- Notificações de vencimentos

## 🚀 Tecnologias Utilizadas

### Frontend
- React 18.3 - Biblioteca para construção de interfaces
- TypeScript - Tipagem estática e desenvolvimento seguro
- Vite - Build tool moderna e extremamente rápida
- Tailwind CSS - Framework CSS utility-first
- shadcn/ui - Componentes UI acessíveis e customizáveis
- React Query - Gerenciamento de estado servidor
- Wouter - Roteamento leve para React
- date-fns - Manipulação de datas

### Backend
- Node.js - Runtime JavaScript
- Express - Framework web minimalista
- Supabase - Backend as a Service (autenticação e banco de dados)
- TypeScript - Tipagem no servidor

### Infraestrutura
- Supabase PostgreSQL - Banco de dados relacional
- Autenticação JWT via Supabase Auth
- Rate limiting para segurança da API
- CORS configurado para segurança

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ e npm
- Conta no Supabase (gratuita)

### Passos para rodar localmente

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd pagueflow
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
# Supabase
SUPABASE_URL=sua-url-do-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Frontend (Vite)
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anon

# API
PORT_API=8080
CORS_ORIGIN=true
```

4. **Execute o projeto em modo desenvolvimento**
```bash
npm run dev
```

Isso iniciará:
- Frontend na porta 5173
- Backend API na porta 8080

## 🗂️ Estrutura do Projeto

```
pagueflow/
├── src/                    # Frontend React
├── components/         # Componentes reutilizáveis
├── pages/             # Páginas da aplicação
├── hooks/             # Custom hooks
└── lib/               # Utilitários e configurações
├── server/                # Backend Node.js
│   ├── dev.ts            # Servidor de desenvolvimento
│   └── supabase.ts       # Integração Supabase
├── shared/               # Tipos compartilhados
└── prisma/              # Schema do banco de dados
```

## 🔐 Segurança

- Autenticação via Supabase Auth com JWT
- Proteção de rotas no frontend e backend
- Rate limiting para prevenir abuso da API
- Validação de dados com Zod
- CORS configurado adequadamente
- Senhas hasheadas (gerenciadas pelo Supabase)

## 📱 Funcionalidades Principais

### Dashboard
Visão geral com:
- Total de contas a pagar no mês
- Contas vencendo hoje/esta semana
- Gráfico de despesas por categoria
- Histórico de pagamentos recentes

### Gerenciamento de Contas
- Criar nova conta com título, valor, categoria e vencimento
- Editar contas existentes
- Marcar como paga/não paga
- Excluir contas
- Filtrar por categoria, status e período

### Categorias Personalizadas
- Criar categorias customizadas
- Definir ícones e cores
- Organizar despesas por tipo

### Relatórios
- Análise mensal de gastos
- Comparativo entre categorias
- Evolução de despesas ao longo do tempo
- Exportação de dados (em desenvolvimento)

## 🎨 Design

- Interface moderna com shadcn/ui
- Paleta de cores personalizada
- Ícones do Lucide React
- Responsivo para mobile, tablet e desktop
- Suporte a modo escuro/claro

## 🚧 Roadmap

- [ ] Notificações por email de vencimento
- [ ] Exportação de relatórios em PDF
- [ ] Integração com Open Banking
- [ ] App mobile nativo
- [ ] Metas de economia
- [ ] Previsão de gastos com IA

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Desenvolvido com ❤️ para ajudar você a ter controle total das suas finanças.