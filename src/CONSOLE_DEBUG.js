// ═══════════════════════════════════════════════════════════════
//  🔧 CONSOLE DEBUG - Login Admin AutonomyX
//  Cole este código no Console do navegador (F12) para debugar
// ═══════════════════════════════════════════════════════════════

console.log('🔍 INICIANDO DEBUG DO LOGIN ADMIN...\n');

// ═══════════════════════════════════════════════════════════════
// 1. Verificar se está logado
// ═══════════════════════════════════════════════════════════════

const authToken = localStorage.getItem('auth_token');
const isAdmin = localStorage.getItem('is_admin');

console.log('📊 STATUS DO LOGIN:');
console.log('─────────────────────────────────────');
console.log('Token existe?', authToken ? '✅ SIM' : '❌ NÃO');
console.log('Token:', authToken || 'Não encontrado');
console.log('─────────────────────────────────────');
console.log('É admin?', isAdmin === 'true' ? '✅ SIM' : '❌ NÃO');
console.log('is_admin:', isAdmin || 'Não encontrado');
console.log('─────────────────────────────────────\n');

// ═══════════════════════════════════════════════════════════════
// 2. Verificar elementos da tela de login
// ═══════════════════════════════════════════════════════════════

console.log('🔍 VERIFICANDO ELEMENTOS DA INTERFACE:');
console.log('─────────────────────────────────────');

// Botão Admin
const adminButton = document.querySelector('.admin-button');
console.log('Botão "Acesso Admin":', adminButton ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');

if (adminButton) {
  const computedStyle = window.getComputedStyle(adminButton);
  console.log('  └─ Cor do texto:', computedStyle.color);
  console.log('  └─ Cor da borda:', computedStyle.borderColor);
  console.log('  └─ Visível?', computedStyle.display !== 'none' ? '✅ SIM' : '❌ NÃO');
}

// Badge DEV
const devBadge = document.querySelector('.admin-badge');
console.log('Badge "DEV":', devBadge ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');

if (devBadge) {
  console.log('  └─ Texto:', devBadge.textContent);
}

// Nota de desenvolvimento
const devNote = document.querySelector('.dev-note');
console.log('Nota dev:', devNote ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');

if (devNote) {
  console.log('  └─ Texto:', devNote.textContent);
}

console.log('─────────────────────────────────────\n');

// ═══════════════════════════════════════════════════════════════
// 3. Verificar badge "ADMIN MODE" no header
// ═══════════════════════════════════════════════════════════════

console.log('🎨 VERIFICANDO HEADER (se logado):');
console.log('─────────────────────────────────────');

const header = document.querySelector('header');
if (header && authToken) {
  const adminModeBadge = Array.from(header.querySelectorAll('span')).find(
    span => span.textContent.includes('Admin Mode')
  );
  
  console.log('Badge "ADMIN MODE" no header:', adminModeBadge ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
  
  if (adminModeBadge) {
    const computedStyle = window.getComputedStyle(adminModeBadge);
    console.log('  └─ Cor de fundo:', computedStyle.background);
    console.log('  └─ Cor do texto:', computedStyle.color);
  }
} else if (!authToken) {
  console.log('⚠️  Não logado - Badge só aparece após login');
} else {
  console.log('⚠️  Header não encontrado');
}

console.log('─────────────────────────────────────\n');

// ═══════════════════════════════════════════════════════════════
// 4. Verificar todo o localStorage
// ═══════════════════════════════════════════════════════════════

console.log('💾 CONTEÚDO DO localStorage:');
console.log('─────────────────────────────────────');

const allStorage = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  allStorage[key] = localStorage.getItem(key);
}

console.table(allStorage);

console.log('─────────────────────────────────────\n');

// ═══════════════════════════════════════════════════════════════
// 5. Funções úteis para teste manual
// ═══════════════════════════════════════════════════════════════

console.log('🛠️  FUNÇÕES ÚTEIS DISPONÍVEIS:');
console.log('─────────────────────────────────────');
console.log('Digite estas funções no console para testar:\n');

console.log('1. fazerLoginAdmin()');
console.log('   └─ Faz login admin direto (bypass total)\n');

console.log('2. fazerLogout()');
console.log('   └─ Limpa tudo e recarrega\n');

console.log('3. verificarStatus()');
console.log('   └─ Mostra status atual do login\n');

console.log('4. limparStorage()');
console.log('   └─ Limpa localStorage completo\n');

console.log('5. simularErro()');
console.log('   └─ Remove apenas o token para testar erro\n');

console.log('─────────────────────────────────────\n');

// ═══════════════════════════════════════════════════════════════
// Definir as funções globalmente
// ═══════════════════════════════════════════════════════════════

window.fazerLoginAdmin = function() {
  console.log('🔓 Fazendo login admin...');
  localStorage.setItem('auth_token', 'admin-dev-token-' + Date.now());
  localStorage.setItem('is_admin', 'true');
  console.log('✅ Login admin concluído!');
  console.log('🔄 Recarregando página...');
  setTimeout(() => location.reload(), 500);
};

window.fazerLogout = function() {
  console.log('🚪 Fazendo logout...');
  localStorage.clear();
  console.log('✅ localStorage limpo!');
  console.log('🔄 Recarregando página...');
  setTimeout(() => location.reload(), 500);
};

window.verificarStatus = function() {
  console.log('📊 STATUS ATUAL:');
  console.log('─────────────────────────────────────');
  console.log('Token:', localStorage.getItem('auth_token') || '❌ Não existe');
  console.log('Admin:', localStorage.getItem('is_admin') || '❌ Não existe');
  console.log('Username salvo:', localStorage.getItem('saved_username') || '❌ Não existe');
  console.log('Lembrar-me:', localStorage.getItem('remember_me') || '❌ Não existe');
  console.log('─────────────────────────────────────');
};

window.limparStorage = function() {
  console.log('🗑️  Limpando todo localStorage...');
  const itemsCount = localStorage.length;
  localStorage.clear();
  console.log(`✅ ${itemsCount} itens removidos!`);
  console.log('🔄 Recarregue a página (F5) para ver efeito');
};

window.simularErro = function() {
  console.log('⚠️  Simulando erro (removendo apenas token)...');
  localStorage.removeItem('auth_token');
  console.log('✅ Token removido!');
  console.log('🔄 Recarregue a página (F5) para testar erro');
};

// ═══════════════════════════════════════════════════════════════
// 6. Diagnóstico automático
// ═══════════════════════════════════════════════════════════════

console.log('🔬 DIAGNÓSTICO AUTOMÁTICO:');
console.log('─────────────────────────────────────');

let problemas = 0;

// Verificar se está na tela de login
const loginCard = document.querySelector('.login-card');
const isLoginPage = !!loginCard;

if (isLoginPage) {
  console.log('📍 Localização: Tela de Login\n');
  
  // Verificar botão admin
  if (!adminButton) {
    console.log('❌ PROBLEMA: Botão "Acesso Admin" não encontrado');
    console.log('   → Possível causa: LoginView.tsx não foi atualizado');
    console.log('   → Solução: Limpe cache (Ctrl+Shift+R)');
    problemas++;
  } else {
    console.log('✅ Botão "Acesso Admin" OK');
  }
  
  // Verificar badge DEV
  if (!devBadge) {
    console.log('❌ PROBLEMA: Badge "DEV" não encontrado');
    console.log('   → Possível causa: CSS não carregou');
    problemas++;
  } else {
    console.log('✅ Badge "DEV" OK');
  }
  
  // Verificar nota de desenvolvimento
  if (!devNote) {
    console.log('❌ PROBLEMA: Nota de dev não encontrada');
    problemas++;
  } else {
    console.log('✅ Nota de desenvolvimento OK');
  }
  
} else if (authToken) {
  console.log('📍 Localização: Dashboard (Logado)\n');
  
  // Verificar badge admin mode
  const adminModeBadge = Array.from(document.querySelectorAll('span')).find(
    span => span.textContent.includes('Admin Mode')
  );
  
  if (isAdmin === 'true' && !adminModeBadge) {
    console.log('❌ PROBLEMA: Badge "ADMIN MODE" não encontrado no header');
    console.log('   → Possível causa: App.tsx não foi atualizado');
    problemas++;
  } else if (isAdmin === 'true') {
    console.log('✅ Badge "ADMIN MODE" OK');
  } else {
    console.log('ℹ️  Login normal (não admin)');
  }
  
} else {
  console.log('📍 Localização: Desconhecida\n');
  console.log('⚠️  Não consegui identificar a página atual');
}

console.log('─────────────────────────────────────');

if (problemas === 0) {
  console.log('✅ NENHUM PROBLEMA DETECTADO!');
  console.log('🎉 Sistema funcionando corretamente!');
} else {
  console.log(`⚠️  ${problemas} problema(s) detectado(s)`);
  console.log('📖 Veja as soluções acima');
}

console.log('─────────────────────────────────────\n');

// ═══════════════════════════════════════════════════════════════
// 7. Dicas finais
// ═══════════════════════════════════════════════════════════════

console.log('💡 DICAS RÁPIDAS:');
console.log('─────────────────────────────────────');
console.log('• Para fazer login admin rápido: fazerLoginAdmin()');
console.log('• Para fazer logout: fazerLogout()');
console.log('• Para limpar tudo: limparStorage()');
console.log('• Para ver status: verificarStatus()');
console.log('• Para executar este debug novamente: recarregue esta página');
console.log('─────────────────────────────────────\n');

console.log('📚 DOCUMENTAÇÃO DISPONÍVEL:');
console.log('─────────────────────────────────────');
console.log('• LOGIN_ADMIN.txt - Guia rápido');
console.log('• QUICK_START_ADMIN.md - Setup em 10 segundos');
console.log('• GUIA_VISUAL_LOGIN_ADMIN.txt - Diagramas visuais');
console.log('• TESTE_LOGIN_VISUAL.md - Checklist de testes');
console.log('─────────────────────────────────────\n');

console.log('✅ DEBUG CONCLUÍDO!\n');

// ═══════════════════════════════════════════════════════════════
// Exportar resultado para fácil acesso
// ═══════════════════════════════════════════════════════════════

window.debugInfo = {
  logado: !!authToken,
  isAdmin: isAdmin === 'true',
  token: authToken,
  botaoAdminExiste: !!adminButton,
  badgeDevExiste: !!devBadge,
  problemas: problemas,
  timestamp: new Date().toISOString()
};

console.log('💾 Informações salvas em: window.debugInfo');
console.log('   Use: debugInfo para ver resumo');
console.log('\n═══════════════════════════════════════════════════════════════\n');
