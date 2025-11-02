# ✅ Padronização Completa - Identidade Visual AutonomyX

## 🎨 **Cores Oficiais do Sistema**

### **Cores Principais**
- **Ciano Elétrico**: `#00BFFF` - Destaque primário, botões, ícones principais
- **Magenta Neon**: `#FF00CC` - Destaque secundário, alertas importantes

### **Cores de Fundo**
- **Fundo Principal**: `#0B0F18` - Background geral do dashboard
- **Fundo de Cards**: `bg-gradient-to-br from-[#10182b] to-[#0b0f19]`
- **Fundo Secundário**: `#0f1621` - Selects, inputs, tooltips

### **Cores de Borda**
- **Borda Padrão**: `border-[#1e2a44]` - Todas as bordas de cards
- **Borda Hover**: `border-[#00BFFF]/50` - Hover states

### **Cores de Texto**
- **Texto Principal**: `text-[#EAF2FF]` - Títulos, valores importantes
- **Texto Secundário**: `text-[#8ea9d9]` - Subtítulos, labels, descrições
- **Texto Desabilitado**: `text-[#6b7896]` - Estados inativos

---

## 📐 **Padrão de Cards**

### **Card Padrão**
```tsx
<Card className="p-8 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
```

### **Card com Hover**
```tsx
<Card className="p-8 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl transition-all hover:scale-[1.02] hover:border-[#00BFFF]/50">
```

### **KPI Card (métricas principais)**
```tsx
<Card className="p-5 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl transition-all hover:scale-[1.02] cursor-pointer" style={{ 
  boxShadow: '0 0 15px rgba(0, 191, 255, 0.3)' 
}}>
```

---

## 🎯 **Estrutura Aplicada**

### ✅ **App.tsx**
- [x] Menu de navegação STICKY (fixo no topo)
- [x] Background padrão atualizado
- [x] Cores de texto padronizadas
- [x] Posicionamento top-36 (abaixo do ticker)

### ✅ **OverviewView (IPTVDashboard.tsx)**
- Status: **Revisar cores antigas ainda presentes**

### ✅ **FinancialView.tsx**
- [x] Cards com background padrão
- [x] Bordas padronizadas `border-[#1e2a44]`
- [x] Textos principais `text-[#EAF2FF]`
- [x] Textos secundários `text-[#8ea9d9]`
- [x] Tooltips com fundo `#0f1621`
- [x] Shadow 2xl aplicado

### ✅ **RetentionView.tsx**
- [x] Header com cores corretas
- [x] KPIs com gradientes e neon
- [x] Cards de gráficos padronizados
- [x] Tabs consistentes
- [x] Tooltips atualizados
- [x] Sub-cards internos

### ⏳ **ClientsView.tsx**
- [ ] Revisar cards principais
- [ ] Padronizar cores de texto
- [ ] Atualizar backgrounds

### ⏳ **ConversionView.tsx**
- [ ] Revisar cards principais
- [ ] Padronizar cores de texto
- [ ] Atualizar backgrounds

### ⏳ **GeographicView.tsx**
- [ ] Revisar cards principais
- [ ] Padronizar cores de texto
- [ ] Atualizar backgrounds

### ⏳ **TrafficView.tsx**
- [ ] Revisar cards principais
- [ ] Padronizar cores de texto
- [ ] Atualizar backgrounds

### ⏳ **GamesView.tsx**
- [ ] Revisar cards principais
- [ ] Padronizar cores de texto
- [ ] Atualizar backgrounds

---

## 📊 **Tooltips de Gráficos**

### **Padrão Recharts**
```tsx
<Tooltip
  contentStyle={{ 
    backgroundColor: '#0f1621', 
    border: '1px solid #1e2a44',
    color: '#EAF2FF',
    borderRadius: '8px'
  }}
/>
```

---

## 🎨 **Gradientes Especiais**

### **Botões Principais**
```tsx
className="bg-gradient-to-r from-[#00BFFF] to-[#0099CC] hover:from-[#00AAEE] hover:to-[#0088BB]"
```

### **Cards de Destaque**
```tsx
className="bg-gradient-to-br from-[#FF00CC]/10 to-[#00BFFF]/10 border-[#FF00CC]/30"
```

---

## 🔧 **Navegação Sticky (NOVO)**

### **Implementação**
```tsx
<div className="sticky top-36 z-30 bg-[#0B0F18]/95 border-b border-[#1e2a44] backdrop-blur-md shadow-lg">
  <div className="max-w-7xl mx-auto px-6">
    <nav className="flex gap-2 overflow-x-auto py-2">
      {/* Tabs aqui */}
    </nav>
  </div>
</div>
```

### **Características**
- **Position**: `sticky top-36` (abaixo do header + ticker)
- **Z-index**: `z-30` (abaixo do header z-50 e ticker z-40)
- **Background**: Semi-transparente com blur `bg-[#0B0F18]/95 backdrop-blur-md`
- **Borda**: `border-b border-[#1e2a44]`

---

## 📝 **Status Atual**

### **Completo** ✅
- [x] Menu de navegação fixo
- [x] FinancialView 100% padronizado
- [x] RetentionView 100% padronizado
- [x] Estrutura base do App.tsx

### **Pendente** ⏳
- [ ] ClientsView
- [ ] ConversionView  
- [ ] GeographicView
- [ ] TrafficView
- [ ] GamesView
- [ ] IPTVDashboard (Overview) - revisar cores antigas

---

## 🎯 **Próximos Passos**

1. Revisar e padronizar ClientsView
2. Revisar e padronizar ConversionView
3. Revisar e padronizar GeographicView
4. Revisar e padronizar TrafficView
5. Revisar e padronizar GamesView
6. Revisar IPTVDashboard (Overview) para remover cores antigas

---

## 💡 **Dicas Importantes**

1. **NUNCA** use classes de cores antigas como:
   - ❌ `bg-slate-900`, `bg-slate-800`
   - ❌ `border-slate-700`, `border-slate-800`
   - ❌ `text-gray-300`, `text-white`
   - ❌ `bg-[#1A1D21]`, `bg-[#121726]`

2. **SEMPRE** use:
   - ✅ `bg-gradient-to-br from-[#10182b] to-[#0b0f19]`
   - ✅ `border-[#1e2a44]`
   - ✅ `text-[#EAF2FF]` ou `text-[#8ea9d9]`
   - ✅ `shadow-2xl`

3. **Efeitos Neon** para KPIs:
   ```tsx
   style={{ boxShadow: '0 0 15px rgba(0, 191, 255, 0.3)' }}
   ```

---

**Data da última atualização**: 30/10/2025
**Versão da identidade**: 2.0 - AutonomyX Ciano & Magenta
