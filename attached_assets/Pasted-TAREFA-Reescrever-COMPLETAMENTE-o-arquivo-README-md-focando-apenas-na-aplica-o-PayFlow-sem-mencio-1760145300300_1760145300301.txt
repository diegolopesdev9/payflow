TAREFA: Reescrever COMPLETAMENTE o arquivo README.md focando apenas na aplicação PayFlow, sem mencionar plataformas de desenvolvimento.

INSTRUÇÕES CRÍTICAS:
- SUBSTITUA TODO O CONTEÚDO do arquivo README.md
- NÃO mencione Lovable, Replit, ou qualquer plataforma de desenvolvimento
- Foque nas funcionalidades, tecnologias e instruções de uso da aplicação
- Mostre o diff antes de aplicar
- Aguarde aprovação

ARQUIVO A MODIFICAR: README.md

CONTEÚDO COMPLETO DO NOVO README.md:

# PayFlow 💰

Sistema inteligente de controle financeiro pessoal para gerenciar suas contas a pagar, nunca mais esquecer vencimentos e ter total visibilidade dos seus gastos.

## 📋 Sobre o Projeto

PayFlow é uma aplicação web moderna e intuitiva desenvolvida para ajudar pessoas a organizarem suas finanças pessoais. Com interface responsiva e recursos avançados de visualização de dados, você mantém o controle total sobre suas despesas mensais.

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
- TypeScript - Tipagem no servidor
- Prisma ORM - ORM type-safe para banco de dados

### Banco de Dados e Auth
- PostgreSQL - Banco de dados relacional
- Supabase - Backend-as-a-Service Auth e Database

### UI e UX
- Radix UI - Primitivos acessíveis sem estilo
- Lucide React - Ícones modernos
- React Hook Form - Gerenciamento de formulários
- Zod - Validação de schemas

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18 ou superior e npm
- Conta no Supabase gratuita
- PostgreSQL fornecido pelo Supabase

### Passo 1 Clone o Repositório
git clone https://github.com/seu-usuario/payflow.git
cd payflow

### Passo 2 Instale as Dependências
npm install

### Passo 3 Configure as Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto baseado no .env.example com as seguintes variáveis:

PORT_API=8080
NODE_ENV=development
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
DATABASE_URL=sua-connection-string-pooler
DIRECT_URL=sua-connection-string-direct
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

### Passo 4 Configure o Banco de Dados
Execute as migrações do Prisma:
npx prisma migrate dev --name init
npx prisma generate

### Passo 5 Inicie a Aplicação
Para desenvolvimento com Frontend e Backend juntos:
npm run dev

Somente Frontend:
npm run dev:web

Somente Backend:
npm run dev:api

A aplicação estará disponível em:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## 🗂️ Estrutura do Projeto

payflow/
├── src/ - Código fonte do frontend
│   ├── components/ - Componentes React reutilizáveis
│   │   └── ui/ - Componentes shadcn/ui
│   ├── pages/ - Páginas da aplicação
│   ├── lib/ - Utilitários e configurações
│   ├── hooks/ - React hooks customizados
│   └── main.tsx - Ponto de entrada
├── server/ - Código fonte do backend
│   └── dev.ts - Servidor Express e API
├── prisma/ - Schema e migrações do banco
│   └── schema.prisma - Definição do schema
├── shared/ - Código compartilhado types
│   └── schema.ts - Types TypeScript
└── public/ - Arquivos estáticos

## 🎯 Como Usar

### Criar Conta
- Acesse a aplicação
- Clique em Criar Conta
- Preencha seus dados e crie sua senha

### Fazer Login
- Entre com seu e-mail e senha
- Acesse o dashboard principal

### Adicionar Contas
- Clique em Nova Conta
- Preencha nome, valor, data de vencimento e categoria
- Salve a conta

### Gerenciar Contas
- Visualize todas as contas no menu Contas
- Marque como paga quando efetuar o pagamento
- Edite ou exclua conforme necessário

### Visualizar Relatórios
- Acesse Relatórios para ver gráficos
- Analise gastos por categoria
- Acompanhe evolução mensal

## 🔐 Segurança

- Autenticação via JWT Supabase Auth
- Senhas criptografadas com bcrypt
- Proteção contra SQL Injection Prisma ORM
- Rate limiting nas APIs
- CORS configurado
- Validação de dados com Zod

## 📱 Responsividade

O PayFlow foi desenvolvido com abordagem mobile-first, garantindo excelente experiência em smartphones, tablets, desktops e telas grandes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature git checkout -b feature/NovaFuncionalidade
3. Commit suas mudanças git commit -m Adiciona nova funcionalidade
4. Push para a branch git push origin feature/NovaFuncionalidade
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com 💚 por Diego Lopes

## 📞 Contato

- GitHub: @diegolopesdev9
- Email: contato@payflow.com

## 🙏 Agradecimentos

- Comunidade React
- Equipe Supabase
- Contribuidores do shadcn/ui
- Comunidade open source

---

Se este projeto te ajudou, considere dar uma estrela no repositório!

AÇÃO SOLICITADA:
1. Mostre o diff completo entre o README.md atual e o novo
2. Aguarde minha confirmação
3. Aplique SOMENTE após aprovação
4. Confirme que foi aplicado com sucesso

NÃO ALTERE outros arquivos.
APENAS substitua o README.md completamente.