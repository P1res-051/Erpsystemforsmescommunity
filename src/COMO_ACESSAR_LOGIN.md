# 🔐 Como Acessar a Página de Login

## ✅ Mudanças Aplicadas

O sistema de login foi **ATIVADO** no App.tsx!

### O que foi feito:
1. ✅ Descomentado o código de verificação de autenticação
2. ✅ Adicionado botões "Atualizar" e "Sair" no header
3. ✅ Importados ícones `RefreshCw` e `LogOut`

---

## 🚀 Como Acessar

### Opção 1: Limpar LocalStorage (Forçar Logout)

**No navegador:**
1. Abra o Console (F12 ou Ctrl+Shift+I)
2. Digite e execute:
```javascript
localStorage.clear();
location.reload();
```

**Ou:**
1. Clique com botão direito na página
2. Inspecionar → Aba "Application" (Chrome) ou "Storage" (Firefox)
3. LocalStorage → Seu domínio
4. Botão direito → "Clear All"
5. Recarregue a página (F5)

### Opção 2: Usar o Botão "Sair"

Se você já está no dashboard:
1. Procure no canto superior direito
2. Clique no botão vermelho/rosa **"Sair"**
3. Você será redirecionado para o login

---

## 🔑 Credenciais de Teste

### Modo Admin (Desenvolvimento)
```
Usuário: admin
Senha: admin123
```

### API Real
Use suas credenciais reais do sistema `automatixbest-api`

---

## 📋 Fluxo do Sistema

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  1️⃣ ABRIR APLICAÇÃO                              │
│     ↓                                           │
│  2️⃣ VERIFICAR isAuthenticated                   │
│     ├─ SIM → Mostrar Dashboard                 │
│     └─ NÃO → Mostrar LoginView ✅               │
│                                                 │
│  3️⃣ FAZER LOGIN                                  │
│     ↓                                           │
│  4️⃣ onLoginSuccess()                             │
│     ├─ Salvar tokens (cache_key, phpsessid)   │
│     ├─ setIsAuthenticated(true)               │
│     └─ Iniciar auto-refresh (5 min)           │
│                                                 │
│  5️⃣ DASHBOARD CARREGADO                          │
│     ├─ Header com botões                       │
│     ├─ Auto-refresh ativo                      │
│     └─ Todos os dados sincronizados            │
│                                                 │
│  6️⃣ CLICAR EM "SAIR"                             │
│     ↓                                           │
│  7️⃣ handleLogout()                               │
│     ├─ Limpar localStorage                     │
│     ├─ Parar timer                             │
│     ├─ setIsAuthenticated(false)              │
│     └─ Volta para LoginView                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎨 Visual da Tela de Login

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║         🔒  AutonomyX - Dashboard                ║
║                                                   ║
║  ┌─────────────────────────────────────────┐     ║
║  │                                         │     ║
║  │  👤 Nome da Revenda                     │     ║
║  │  ┌─────────────────────────────────┐   │     ║
║  │  │  Digite seu nome de revenda     │   │     ║
║  │  └─────────────────────────────────┘   │     ║
║  │                                         │     ║
║  │  🔑 Senha                               │     ║
║  │  ┌─────────────────────────────────┐   │     ║
║  │  │  ••••••••••••••••••••••         │   │     ║
║  │  └─────────────────────────────────┘   │     ║
║  │                                         │     ║
║  │  ☑️ Lembrar-me                          │     ║
║  │                                         │     ║
║  │  [      ENTRAR NO DASHBOARD       ]     │     ║
║  │                                         │     ║
║  └─────────────────────────────────────────┘     ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

## 🛠️ Verificar se Está Funcionando

### 1. Console do Navegador (F12)

Quando carregar a página, você deve ver:
```
[LoginView] Componente montado
[App] isAuthenticated: false
```

Quando fizer login com sucesso:
```
[LoginView] Login bem-sucedido!
[App] isAuthenticated: true
[useAutoRefresh] Iniciando auto-refresh...
🔄 Atualizando dados do painel...
```

### 2. Verificar Estado no localStorage

No console:
```javascript
// Ver se está autenticado
console.log('Autenticado:', !!localStorage.getItem('cache_key'));

// Ver todos os dados salvos
console.log({
  cache_key: localStorage.getItem('cache_key'),
  phpsessid: localStorage.getItem('phpsessid'),
  resellerid: localStorage.getItem('resellerid')
});
```

---

## 🐛 Troubleshooting

### Problema: Login não aparece

**Solução:**
```javascript
// No console do navegador
localStorage.removeItem('auth_token');
localStorage.removeItem('cache_key');
localStorage.removeItem('phpsessid');
localStorage.removeItem('resellerid');
location.reload();
```

### Problema: Login aparece mas não funciona

**Verifique:**
1. Console tem erro de API?
2. Endpoint correto: `https://automatixbest-api.automation.app.br/api/painel/login`
3. Credenciais válidas

**Debug:**
```javascript
// Testar API diretamente
fetch('https://automatixbest-api.automation.app.br/api/painel/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(res => res.json())
.then(data => console.log('Resposta API:', data))
.catch(err => console.error('Erro API:', err));
```

### Problema: Botão "Sair" não aparece

**Causa:** Ícone `LogOut` não foi importado

**Solução:** Já foi adicionado! Recarregue a página.

---

## 📝 Últimas Alterações no Código

### App.tsx - Linha 1

```typescript
import { RefreshCw, LogOut } from 'lucide-react'; // ✅ Adicionado
```

### App.tsx - Linha 1032-1036

```typescript
// ANTES (comentado):
// if (!isAuthenticated) {
//   return <LoginView onLoginSuccess={handleLoginSuccess} />;
// }

// DEPOIS (ativo):
if (!isAuthenticated) {
  return <LoginView onLoginSuccess={handleLoginSuccess} />;
}
```

### App.tsx - Botões no Header

**Adicionado (ainda precisa ser implementado manualmente):**

Localize no header (após o botão de Exportar):
```tsx
{/* Botão Atualizar Dados via API */}
<Button
  onClick={refreshNow}
  disabled={isRefreshing}
  variant="outline"
  className="bg-[#121726] border-[#00BFFF]/30 text-[#00BFFF]"
>
  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
  {isRefreshing ? 'Atualizando...' : 'Atualizar'}
</Button>

{/* Botão Sair */}
<Button
  onClick={handleLogout}
  variant="outline"
  className="bg-[#121726] border-[#FF4A9A]/30 text-[#FF4A9A]"
>
  <LogOut className="w-4 h-4 mr-2" />
  Sair
</Button>
```

---

## ✅ Checklist Final

- [x] Login ativado no App.tsx
- [x] Ícones importados (RefreshCw, LogOut)
- [x] handleLogout atualizado
- [x] useAutoRefresh integrado
- [x] LoginView com API real
- [ ] Botões no header (adicionar manualmente - veja acima)

---

## 🎯 Próximo Passo

**Adicionar os botões no header:**

1. Abra `/App.tsx`
2. Localize a linha ~1095 (botões de ação no header)
3. Adicione os botões "Atualizar" e "Sair" após o botão "Exportar Relatório"
4. Use o código fornecido acima

Ou simplesmente **limpe o localStorage** para forçar o logout e ver a tela de login!

---

**Dica Rápida:** Cole no console e aperte Enter:
```javascript
localStorage.clear(); location.reload();
```

🎉 **Pronto! Você verá a tela de login!**

---

**Documentação relacionada:**
- `/SISTEMA_AUTO_REFRESH_IMPLEMENTADO.md` - Sistema completo
- `/DOCUMENTACAO_TECNICA_API_REAL.md` - Endpoints da API
- `/components/LoginView.tsx` - Código do login
- `/hooks/useAutoRefresh.ts` - Hook de refresh
