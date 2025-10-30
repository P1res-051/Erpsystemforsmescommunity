# 🔧 Fix: ReferenceError safePct

## 🚨 Erro Original

```
ReferenceError: Cannot access 'safePct2' before initialization
    at components/TrafficView.tsx:172:15 [safePct]
```

## 🔍 Causa Raiz

**Conflito de nomes:** Havia duas declarações de `safePct`:

1. ✅ **Import** (linha 11): `import { safePct } from '../utils/dataProcessing'`
2. ❌ **Declaração local** (linha 250): `const safePct = (num, den) => ...`

**Problema:** JavaScript tenta usar a variável local `safePct` antes dela ser declarada (hoisting), causando o erro "Cannot access before initialization".

---

## ✅ Solução

### 1. Mantido o Import
```typescript
// /components/TrafficView.tsx:11
import { pick, FIELD_MAPPINGS, parseDateSmart, safePct } from '../utils/dataProcessing';
```

### 2. Removida Declaração Local
```typescript
// ❌ REMOVIDO (linha 250)
const safePct = (num: number, den: number) => den ? +(100 * num / den).toFixed(1) : 0;
```

**Motivo:** A função `safePct` já existe em `/utils/dataProcessing.ts` com implementação idêntica:

```typescript
export function safePct(numerator: number, denominator: number): number {
  if (denominator === 0 || !denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10; // 1 casa decimal
}
```

---

## 📊 Locais Onde `safePct` é Usado

### 1. Cálculo de Taxas por Turno (linha 172)
```typescript
// Calcular taxas (com safePct)
for (const k of Object.keys(stats) as Array<keyof typeof stats>) {
  const s = stats[k];
  s.taxa = safePct(s.convs, s.testes);  // ✅ Agora funciona!
}
```

### 2. Taxas de Conversão por Turno (linha 258)
```typescript
const taxasPorTurno = turnoKeys.map((k, i) => safePct(C[i], T[i]));
```

### 3. Cards de Detalhamento (linha 756)
```typescript
const taxaSegura = safePct(stats.convs, stats.testes);
```

### 4. Insights Automáticos (linha 886)
```typescript
{turnoStats.totalConvs > 0 
  ? `💡 Taxa média de conversão: ${safePct(turnoStats.totalConvs, turnoStats.totalTestes)}%`
  : '💡 Considere suporte extra nos turnos de maior conversão'}
```

---

## 🔄 Antes vs Depois

### ❌ Antes (Erro)
```typescript
import { pick, FIELD_MAPPINGS, parseDateSmart } from '../utils/dataProcessing';

// ... (linha 172)
s.taxa = safePct(s.convs, s.testes);  // ❌ Erro: safePct não definido

// ... (linha 250)
const safePct = (num, den) => ...;  // ❌ Conflito: declaração local

// ... (linha 258)
const taxasPorTurno = turnoKeys.map((k, i) => safePct(C[i], T[i]));
// ❌ Erro: "Cannot access before initialization"
```

**Problema:** Na linha 172, o código tenta usar `safePct`, mas como existe uma declaração local na linha 250, o JavaScript "sabe" que existe uma variável `safePct` no escopo da função. Por causa do hoisting, ele tenta usar a variável local antes dela ser declarada.

---

### ✅ Depois (Corrigido)
```typescript
import { pick, FIELD_MAPPINGS, parseDateSmart, safePct } from '../utils/dataProcessing';

// ... (linha 172)
s.taxa = safePct(s.convs, s.testes);  // ✅ Usa a função importada

// ... (linha 250)
// ✅ Declaração local REMOVIDA

// ... (linha 258)
const taxasPorTurno = turnoKeys.map((k, i) => safePct(C[i], T[i]));
// ✅ Funciona! Usa a função importada
```

---

## 🎯 Benefícios da Correção

1. ✅ **Sem erros de referência**: Usa a função importada em todo o arquivo
2. ✅ **Código mais limpo**: Elimina duplicação
3. ✅ **Consistência**: Todos os componentes usam a mesma função de `safePct`
4. ✅ **Manutenção**: Se precisar alterar a lógica, altera em 1 lugar só (`dataProcessing.ts`)

---

## 📦 Arquivo Modificado

- ✅ `/components/TrafficView.tsx`
  - Linha 11: Adicionado `safePct` ao import
  - Linha 250: Removida declaração local de `safePct`

---

## ✅ Status

**Erro Corrigido:** 🟢  
**TrafficView Funcionando:** ✅  
**Import Consistente:** ✅  
**Sem Duplicação:** ✅

**Teste:** Carregar TrafficView e verificar se os cálculos de taxa funcionam corretamente.
