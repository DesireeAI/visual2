# Clinic Management Dashboard

Um sistema completo de gerenciamento de clínicas com interface moderna e funcionalidades avançadas para gestão de leads, perfil da clínica, horários de funcionamento e canais de WhatsApp.

## 🚀 Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização e design responsivo
- **React Beautiful DnD** - Funcionalidade drag-and-drop no Kanban
- **Lucide React** - Ícones modernos
- **React Router DOM** - Navegação entre páginas
- **Vite** - Build tool e desenvolvimento

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React organizados por funcionalidade
│   ├── auth/           # Componentes de autenticação
│   ├── channels/       # Gerenciamento de canais WhatsApp
│   ├── hours/          # Configuração de horários
│   ├── layout/         # Componentes de layout (sidebar, etc)
│   ├── leads/          # Gestão de leads (Kanban board)
│   ├── profile/        # Perfil da clínica
│   └── ui/             # Componentes de interface reutilizáveis
├── context/            # Contextos React (autenticação, etc)
├── hooks/              # Custom hooks
├── types/              # Definições de tipos TypeScript
├── App.tsx             # Componente principal da aplicação
└── main.tsx            # Ponto de entrada da aplicação
```

## 🔧 Localização das Features

### 🔐 Sistema de Autenticação

**Arquivos principais:**
- `src/components/auth/LoginForm.tsx` - Formulário de login com email/senha
- `src/components/auth/ResetPasswordForm.tsx` - Página de recuperação de senha
- `src/context/AuthContext.tsx` - Contexto de autenticação (placeholder para Supabase)

**Funcionalidades:**
- Login com email e senha
- Link "Esqueci minha senha"
- Página de reset de senha com confirmação por email
- Validação de formulários
- Estados de loading
- Integração preparada para Supabase

---

### 📊 Dashboard Principal

**Arquivo principal:**
- `src/App.tsx` - Componente principal que gerencia o roteamento e estado da aplicação

**Funcionalidades:**
- Roteamento condicional baseado no estado de autenticação
- Gerenciamento de abas ativas
- Layout responsivo

---

### 🎯 Gestão de Leads (Kanban Board)

**Arquivo principal:**
- `src/components/leads/KanbanBoard.tsx` - Board completo com drag-and-drop

**Funcionalidades:**
- 7 colunas de status: New, Contacted, No Show, In Attendance, Canceled, To Reschedule, Rescheduled
- Drag-and-drop entre colunas usando React Beautiful DnD
- Cards com informações do cliente:
  - Nome do cliente
  - Telefone
  - Data do último contato
  - Data e horário do agendamento
  - Notas adicionais
- Contadores de leads por coluna
- Design responsivo com scroll horizontal em telas menores

**Para modificar:**
- Adicionar novas colunas: edite o array `COLUMNS`
- Modificar campos dos cards: edite a interface `Lead` em `src/types/index.ts`
- Alterar dados mock: edite o array `mockLeads`

---

### 🏥 Perfil da Clínica

**Arquivo principal:**
- `src/components/profile/ClinicProfile.tsx` - Formulário completo de configuração

**Funcionalidades:**
- **Informações básicas:**
  - Nome da clínica
  - Telefone de suporte
  - Endereço
  - Recomendações
- **Configuração de APIs:**
  - Toggle e chave API do Asaas (pagamentos)
  - Toggle e chave API do Klingo (comunicação)
- **Configuração de Agentes:**
  - 4 agentes: Attendance, Scheduling, Payment, Reminder
  - Editor de prompts com variáveis dinâmicas
  - Sistema de variáveis padrão: `{clinic_name}`, `{client_name}`, `{appointment_time}`, etc.
  - Adição de variáveis customizadas
  - Toggles individuais para cada agente

**Para modificar:**
- Adicionar novos campos: edite a interface `ClinicProfile` em `src/types/index.ts`
- Modificar agentes: edite o array `agentPrompts` no estado inicial
- Adicionar variáveis padrão: edite o array `defaultVariables`

---

### ⏰ Horários de Funcionamento

**Arquivo principal:**
- `src/components/hours/OperatingHours.tsx` - Configuração de horários por dia da semana

**Funcionalidades:**
- Configuração individual para cada dia da semana
- Toggle para habilitar/desabilitar dias
- Seleção de horário de abertura e fechamento
- Interface visual clara com preview dos horários
- Validação de horários

**Para modificar:**
- Adicionar novos dias ou períodos: edite o array `DAYS`
- Modificar estrutura de horários: edite a interface `OperatingHours` em `src/types/index.ts`

---

### 📱 Canais WhatsApp

**Arquivo principal:**
- `src/components/channels/WhatsAppChannels.tsx` - Gerenciamento completo de instâncias WhatsApp

**Funcionalidades:**
- Criação de novas instâncias WhatsApp
- Seleção entre tipos: WHATSAPP-BAILEYS e WHATSAPP-BUSINESS
- Exibição de QR Code para conexão
- Status das instâncias: connecting, connected, disconnected
- Interface para múltiplas instâncias
- Simulação de processo de conexão

**Para modificar:**
- Adicionar novos tipos de WhatsApp: edite a interface `WhatsAppInstance` em `src/types/index.ts`
- Modificar estados de conexão: edite os ícones e cores nas funções `getStatusIcon` e `getStatusColor`
- Alterar URL do QR Code: edite a variável `mockQRCode`

---

### 🎨 Componentes de Interface (UI)

**Arquivos:**
- `src/components/ui/Button.tsx` - Botão reutilizável com variantes
- `src/components/ui/Input.tsx` - Input com label, erro e texto de ajuda
- `src/components/ui/Toggle.tsx` - Switch toggle customizável

**Variantes do Button:**
- `primary` - Azul principal
- `secondary` - Roxo/Indigo
- `outline` - Borda cinza
- `ghost` - Transparente
- `danger` - Vermelho

**Tamanhos disponíveis:**
- `sm` - Pequeno
- `md` - Médio (padrão)
- `lg` - Grande

---

### 🧭 Layout e Navegação

**Arquivo principal:**
- `src/components/layout/Sidebar.tsx` - Barra lateral com navegação

**Funcionalidades:**
- Menu de navegação com ícones
- Indicador visual da aba ativa
- Botão de logout
- Design responsivo

**Para modificar:**
- Adicionar novas abas: edite o array `menuItems`
- Modificar ícones: importe novos ícones do Lucide React

---

### 🔗 Integrações e APIs

**Arquivos:**
- `src/hooks/useApi.ts` - Hook customizado para chamadas à API
- `src/context/AuthContext.tsx` - Placeholders para Supabase

**Configurações:**
- **FastAPI URL:** `https://3352e2ee46a2.ngrok-free.app`
- **Supabase:** Placeholders preparados para integração
- Headers configurados para ngrok

**Para modificar:**
- Alterar URL da API: edite `API_BASE_URL` em `useApi.ts`
- Implementar Supabase: substitua os placeholders em `AuthContext.tsx`

---

### 📱 Design Responsivo

**Breakpoints utilizados:**
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+

**Cores do sistema:**
- **Primary:** Blue-600 (#2563EB)
- **Secondary:** Indigo-600 (#4F46E5)
- **Success:** Green-600 (#059669)
- **Warning:** Yellow-600 (#D97706)
- **Error:** Red-600 (#DC2626)

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente (futuras)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://3352e2ee46a2.ngrok-free.app
```

### Estrutura de Dados

Todas as interfaces TypeScript estão definidas em `src/types/index.ts`:
- `Lead` - Estrutura dos leads
- `ClinicProfile` - Perfil da clínica
- `AgentPrompt` - Prompts dos agentes
- `OperatingHours` - Horários de funcionamento
- `WhatsAppInstance` - Instâncias do WhatsApp

## 📝 Próximos Passos

1. **Integração com Supabase:**
   - Implementar autenticação real em `AuthContext.tsx`
   - Configurar banco de dados
   - Implementar CRUD operations

2. **Integração com FastAPI:**
   - Conectar endpoints reais em `useApi.ts`
   - Implementar sincronização de dados
   - Adicionar tratamento de erros

3. **Funcionalidades Avançadas:**
   - Notificações em tempo real
   - Relatórios e analytics
   - Backup e sincronização
   - Temas personalizáveis

## 🐛 Solução de Problemas

### Problemas Comuns:

1. **Drag and Drop não funciona:**
   - Verifique se `react-beautiful-dnd` está instalado
   - Confirme que os IDs são únicos

2. **Estilos não aplicados:**
   - Verifique se Tailwind CSS está configurado corretamente
   - Confirme que as classes estão no `content` do `tailwind.config.js`

3. **Rotas não funcionam:**
   - Verifique se `react-router-dom` está instalado
   - Confirme que o `BrowserRouter` está envolvendo a aplicação

---

**Desenvolvido com ❤️ para gestão eficiente de clínicas**