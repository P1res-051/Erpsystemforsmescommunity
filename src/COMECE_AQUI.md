# 🎯 COMECE AQUI - Guia Definitivo

## 👋 Bem-vindo ao IPTV Dashboard v2.0!

Você baixou o projeto completo. Agora vamos colocá-lo no ar em **3 etapas simples**.

---

## ⚡ Caminho Mais Rápido (Recomendado)

### Para Windows:

```bash
1. Duplo clique em: preparar-github.bat
2. Siga as instruções na tela
3. Pronto! ✅
```

### Para Mac/Linux:

```bash
1. Abra o terminal nesta pasta
2. Execute: chmod +x preparar-github.sh
3. Execute: ./preparar-github.sh
4. Pronto! ✅
```

**O script fará tudo automaticamente!** 🎉

---

## 📋 Se Preferir Fazer Manualmente

### Passo 1: Criar Repositório no GitHub

1. Vá em: https://github.com/new
2. Nome: `iptv-dashboard` (ou outro nome)
3. Deixe **público**
4. **NÃO** marque "Add README"
5. Clique em **Create repository**

### Passo 2: Editar o vite.config.ts

Abra `vite.config.ts` e altere a linha 7:

```typescript
base: '/iptv-dashboard/', // 👈 Use o nome que você escolheu
```

### Passo 3: Enviar para o GitHub

Abra o terminal nesta pasta e execute:

```bash
# Configure o Git (primeira vez)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Inicialize e faça commit
git init
git add .
git commit -m "Initial commit"

# Conecte ao GitHub (ALTERE SEU-USUARIO e SEU-REPO)
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git branch -M main
git push -u origin main
```

### Passo 4: Deploy

```bash
npm install
npm run deploy
```

### Passo 5: Ativar GitHub Pages

1. Vá em: `https://github.com/SEU-USUARIO/SEU-REPO/settings/pages`
2. Source: **gh-pages** branch
3. Clique em **Save**
4. Aguarde 5 minutos

### Passo 6: Acessar

Seu site estará em:

```
https://SEU-USUARIO.github.io/SEU-REPO/
```

---

## 📚 Documentação Disponível

| Arquivo                                        | Descrição                       | Quando Usar        |
| ---------------------------------------------- | ------------------------------- | ------------------ |
| [COMANDOS_PRONTOS.txt](COMANDOS_PRONTOS.txt)   | ⭐ Comandos prontos para copiar | Sempre!            |
| [ENVIAR_PARA_GITHUB.md](ENVIAR_PARA_GITHUB.md) | Guia completo de deploy         | Dúvidas no deploy  |
| [QUICKSTART.md](QUICKSTART.md)                 | Início rápido                   | Primeira vez       |
| [DEPLOY.md](DEPLOY.md)                         | Deploy detalhado                | Problemas          |
| [CHECKLIST.md](CHECKLIST.md)                   | Checklist completo              | Verificar tudo     |
| [COMANDOS.md](COMANDOS.md)                     | Todos os comandos               | Referência         |
| [README.md](README.md)                         | Documentação completa           | Entender o projeto |

---

## 🎯 Ordem Recomendada de Leitura

### Para Iniciantes Absolutos:

1. ✅ Este arquivo (você está aqui!)
2. 📋 [COMANDOS_PRONTOS.txt](COMANDOS_PRONTOS.txt)
3. ⚡ [QUICKSTART.md](QUICKSTART.md)
4. 🚀 [ENVIAR_PARA_GITHUB.md](ENVIAR_PARA_GITHUB.md)

### Para Quem Tem Pressa:

1. 📋 [COMANDOS_PRONTOS.txt](COMANDOS_PRONTOS.txt) - Copie e cole!
2. ✅ [CHECKLIST.md](CHECKLIST.md) - Verifique

### Para Desenvolvedores:

1. 📖 [README.md](README.md) - Entenda tudo
2. 💻 [COMANDOS.md](COMANDOS.md) - Comandos avançados
3. Código em `/components`

---

## 🚀 3 Formas de Fazer Deploy

### 🥇 Opção 1: Script Automático (MAIS FÁCIL)

**Windows:**

```bash
preparar-github.bat
```

**Mac/Linux:**

```bash
chmod +x preparar-github.sh
./preparar-github.sh
```

---

### 🥈 Opção 2: Comandos Manuais (RÁPIDO)

Abra [COMANDOS_PRONTOS.txt](COMANDOS_PRONTOS.txt) e copie os comandos.

---

### 🥉 Opção 3: Upload Direto (SEM GIT)

1. Crie repositório no GitHub
2. Clique em "uploading an existing file"
3. Arraste todos os arquivos
4. Commit
5. Clone localmente
6. Execute: `npm install && npm run deploy`

---

## ✅ Checklist Rápido

Antes de começar, certifique-se:

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Git instalado (`git --version`)
- [ ] Conta no GitHub criada
- [ ] Repositório criado no GitHub

---

## 🐛 Problemas Comuns

| Problema              | Solução Rápida                     |
| --------------------- | ---------------------------------- |
| "npm não reconhecido" | Instale Node.js em nodejs.org      |
| "git não reconhecido" | Instale Git em git-scm.com         |
| Página em branco      | Verifique `base` no vite.config.ts |
| Erro ao fazer push    | Use Personal Access Token          |

**Soluções detalhadas em:** [DEPLOY.md](DEPLOY.md)

---

## 📊 O Que Este Projeto Faz?

Dashboard profissional para gestão de IPTV que:

- ✅ Processa arquivos Excel automaticamente
- ✅ Calcula métricas (MRR, ARR, LTV, CAC, Churn)
- ✅ Analisa impacto de jogos nas conversões
- ✅ 8 views especializadas
- ✅ Gráficos interativos
- ✅ Exportação para Excel
- ✅ Tema dark moderno

---

## 🎨 Estrutura do Projeto

```
iptv-dashboard/
├── 📄 Arquivos de Início
│   ├── COMECE_AQUI.md           ⭐ Você está aqui
│   ├── COMANDOS_PRONTOS.txt     ⭐ Comandos para copiar
│   ├── LEIA_PRIMEIRO.txt        ℹ️ Resumo do projeto
│   └── preparar-github.*        🚀 Scripts automáticos
│
├── 📘 Documentação
│   ├── QUICKSTART.md
│   ├── DEPLOY.md
│   ├── README.md
│   └── ... (mais 8 arquivos)
│
├── 🔧 Configuração
│   ├── package.json
│   ├── vite.config.ts           ⚠️ Edite o 'base' aqui!
│   ├── tsconfig.json
│   └── index.html
│
├── 🎨 Código Fonte
│   ├── App.tsx
│   ├── components/              (40+ componentes)
│   ├── styles/
│   └── utils/
│
└── 🚫 Ignorados (.gitignore)
    ├── node_modules/
    └── dist/
```

---

## 🎯 Próximos Passos

### Agora:

1. ✅ Escolha uma das 3 opções de deploy acima
2. ✅ Execute os comandos
3. ✅ Aguarde 5 minutos
4. ✅ Acesse seu site!

### Depois do Deploy:

1. 📊 Prepare seu arquivo Excel
2. 📤 Importe no dashboard
3. 📈 Analise suas métricas
4. 🎨 Personalize (opcional)

---

## 🆘 Precisa de Ajuda?

1. 📖 Consulte [COMANDOS_PRONTOS.txt](COMANDOS_PRONTOS.txt)
2. 🔍 Veja [ENVIAR_PARA_GITHUB.md](ENVIAR_PARA_GITHUB.md)
3. 📋 Use [CHECKLIST.md](CHECKLIST.md)
4. 🐛 Leia "Problemas Comuns" em [DEPLOY.md](DEPLOY.md)

---

## 💡 Dicas

- **Use os scripts automáticos** - Eles fazem todo o trabalho!
- **Leia COMANDOS_PRONTOS.txt** - Comandos prontos para copiar
- **Verifique o vite.config.ts** - O `base` deve estar correto
- **Use Personal Access Token** - Não use sua senha do GitHub

---

## 🌟 Recursos

- **Documentação:** 15+ arquivos de ajuda
- **Scripts:** 2 scripts de automação
- **Componentes:** 40+ componentes React
- **Views:** 8 views especializadas
- **Deploy:** Automático com GitHub Actions

---

## ✨ Tecnologias

- React 18 + TypeScript
- Vite 5 (build ultra-rápido)
- Tailwind CSS 4.0
- Recharts (gráficos)
- ShadcN UI (componentes)

---

## 🎉 Pronto para Começar?

### Escolha sua opção:

**🚀 Rápido e Fácil:**

- Execute o script `preparar-github.bat` ou `.sh`

**💻 Linha de Comando:**

- Abra [COMANDOS_PRONTOS.txt](COMANDOS_PRONTOS.txt)

**📖 Passo a Passo Detalhado:**

- Leia [ENVIAR_PARA_GITHUB.md](ENVIAR_PARA_GITHUB.md)

---

**Boa sorte! Qualquer dúvida, consulte a documentação.** 🚀

---

Versão: 2.0  
Atualizado: Outubro 2025