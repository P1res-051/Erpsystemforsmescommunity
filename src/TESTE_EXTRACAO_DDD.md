# 🧪 Teste de Extração de DDD - Validação

## 📋 Casos de Teste

Use estes exemplos para validar se o sistema está extraindo corretamente os DDDs:

### ✅ Casos Válidos

| Telefone Original | DDD Esperado | UF Esperada | Região Esperada | Status |
|-------------------|--------------|-------------|-----------------|--------|
| `557391774948`    | `73`         | BA          | Nordeste        | ✅ OK  |
| `11952971214`     | `11`         | SP          | Sudeste         | ✅ OK  |
| `558498198117`    | `84`         | RN          | Nordeste        | ✅ OK  |
| `5521990348826`   | `21`         | RJ          | Sudeste         | ✅ OK  |
| `553172282177`    | `31`         | MG          | Sudeste         | ✅ OK  |
| `559891834768`    | `98`         | MA          | Nordeste        | ✅ OK  |
| `557591510548`    | `75`         | BA          | Nordeste        | ✅ OK  |

### ✅ Formatos Aceitos

| Formato              | Exemplo           | DDD | UF | Região      |
|---------------------|-------------------|-----|----|-----------  |
| Com +55 (12 dig)    | `5511987654321`   | 11  | SP | Sudeste     |
| Com +55 (13 dig)    | `55119876543210`  | 11  | SP | Sudeste     |
| Sem +55 (11 dig)    | `11987654321`     | 11  | SP | Sudeste     |
| Sem +55 (10 dig)    | `1198765432`      | 11  | SP | Sudeste     |
| Formatado           | `(11) 98765-4321` | 11  | SP | Sudeste     |
| Internacional       | `+55 11 9 8765-4321` | 11 | SP | Sudeste  |
| Com espaços         | `55 11 987654321` | 11  | SP | Sudeste     |
| Com traços          | `55-11-987654321` | 11  | SP | Sudeste     |

### ❌ Casos Inválidos (Devem aparecer na aba de validação)

| Telefone       | Motivo                        |
|----------------|-------------------------------|
| `123456789`    | Menos de 10 dígitos           |
| `00123456789`  | DDD = 00 (inválido)           |
| `10987654321`  | DDD = 10 (não existe)         |
| `01987654321`  | DDD = 01 (não existe)         |
| `09987654321`  | DDD = 09 (não existe)         |
| `(vazio)`      | Campo vazio                   |
| `NULL`         | Valor nulo                    |
| `ABC12345678`  | Não numérico (sem números suficientes) |

## 🔍 Como Testar

### 1. Preparar Arquivo Excel de Teste

Crie uma planilha Excel com a aba **"Clientes Ativos"** e adicione:

| Telefone        | Plano | Status |
|-----------------|-------|--------|
| 557391774948    | 1     | Ativo  |
| 11952971214     | 3     | Ativo  |
| 558498198117    | 1     | Ativo  |
| 5521990348826   | 6     | Ativo  |
| (11) 98765-4321 | 1     | Ativo  |
| 123456789       | 1     | Ativo  |
| 00123456789     | 1     | Ativo  |

### 2. Importar no Dashboard

1. Abra o dashboard
2. Clique em **"Importar Excel"**
3. Selecione o arquivo de teste
4. Aguarde o processamento

### 3. Verificar na Aba Geográfico

#### KPIs (topo da página)
- **Estados Cobertos**: Deve mostrar quantos estados únicos foram identificados
- **DDDs Ativos**: Quantidade de DDDs válidos encontrados
- **Telefones Processados**: Total de válidos
- **Inválidos**: Quantidade de telefones não processados

#### Insights Automáticos
- Deve mostrar insights como: "SP concentra X% da base"
- Alertas de vencimentos por estado

#### Aba: Mapa
- Estados devem aparecer coloridos
- Clique em um estado para ver detalhes
- Pizza de região deve mostrar distribuição

#### Aba: Gráficos
- **Top 10 Estados**: Barras coloridas por região
- **Radar**: Performance de cada região
- **Heatmap DDDs**: Top 20 DDDs com status

#### Aba: Tabelas
- **Ranking por UF**: Todos os estados identificados
- **Telefones Inválidos**: Deve listar os números que falharam
  - `123456789` → "Formato inválido"
  - `00123456789` → "DDD inválido"

### 4. Exportar e Verificar Excel

1. Clique em **"Exportar Excel"**
2. Abra o arquivo baixado
3. Verifique as 4 abas:
   - **Ranking UF**: Estados com métricas
   - **Por Região**: 5 regiões brasileiras
   - **DDDs**: DDDs identificados
   - **Inválidos**: Números rejeitados

## 📊 Resultado Esperado

### Console do Navegador (F12)

Não deve haver erros. Se houver warnings sobre DDDs não mapeados, verifique se o DDD existe no Brasil.

### Métricas Esperadas

Com os 7 telefones de teste acima:

- **Total Processado**: 7
- **Válidos**: 5 (os primeiros 5)
- **Inválidos**: 2 (os 2 últimos)
- **Estados Cobertos**: 4 (BA, SP, RN, RJ)
- **DDDs Ativos**: 5 (73, 11, 84, 21, 11) → 4 únicos

### Validação Visual

#### ✅ Correto:
- Mapa mostra estados coloridos
- Gráfico de pizza tem 3+ regiões
- Top 10 mostra barras
- Insights aparecem
- Tabela de inválidos lista os 2 números

#### ❌ Incorreto:
- Mapa completamente em branco
- "0 estados cobertos"
- Todos os telefones como inválidos
- Gráficos vazios

## 🐛 Solução de Problemas

### Problema: Todos os telefones são inválidos

**Diagnóstico:**
- Verifique o nome da coluna no Excel (deve ser `Telefone`, `telefone`, `Usuario` ou `usuario`)
- Confirme que a aba do Excel se chama "Clientes Ativos" ou "Clientes Expirados"

**Solução:**
- Renomeie a coluna no Excel
- Certifique-se que há números (não texto vazio)

### Problema: DDDs não reconhecidos

**Diagnóstico:**
- DDDs devem estar entre 11-99
- Verifique se o DDD existe no Brasil

**Solução:**
- Consulte a lista de DDDs válidos em `DDD_MAP`
- Corrija telefones com DDDs inexistentes

### Problema: Estados não aparecem no mapa

**Diagnóstico:**
- Pode ser que todos os DDDs sejam de UMA única UF
- Ou todos os telefones sejam inválidos

**Solução:**
- Adicione telefones de diferentes estados
- Verifique a aba "Tabelas" → "Telefones Inválidos"

## 📖 Referências

### DDDs do Brasil por Região

**Sudeste:**
- SP: 11, 12, 13, 14, 15, 16, 17, 18, 19
- RJ: 21, 22, 24
- MG: 31, 32, 33, 34, 35, 37, 38
- ES: 27, 28

**Sul:**
- PR: 41, 42, 43, 44, 45, 46
- SC: 47, 48, 49
- RS: 51, 53, 54, 55

**Nordeste:**
- BA: 71, 73, 74, 75, 77
- SE: 79
- PE: 81, 87
- AL: 82
- PB: 83
- RN: 84
- CE: 85, 88
- PI: 86, 89
- MA: 98, 99

**Norte:**
- AC: 68
- RO: 69
- PA: 91, 93, 94
- AM: 92, 97
- RR: 95
- AP: 96
- TO: 63

**Centro-Oeste:**
- DF: 61
- GO: 62, 64
- MT: 65, 66
- MS: 67

## ✅ Checklist de Validação

- [ ] Importou arquivo Excel com telefones de teste
- [ ] Verificou KPIs no topo da página
- [ ] Estados aparecem no mapa coloridos
- [ ] Gráfico de pizza mostra regiões
- [ ] Top 10 estados exibe barras
- [ ] Radar de performance tem dados
- [ ] Tabela de ranking mostra estados
- [ ] Tabela de inválidos lista telefones rejeitados
- [ ] Exportou Excel e verificou 4 abas
- [ ] Clicou em um estado no mapa e viu detalhes
- [ ] Insights automáticos aparecem

## 🎯 Casos Extremos para Testar

### Volume Alto
- 1000+ telefones
- Múltiplos estados
- Verificar performance

### Dados Problemáticos
- Todos os telefones vazios
- Todos com DDD inválido
- Mistura de formatos

### Edge Cases
- Telefone com 50 dígitos
- Telefones com letras
- Caracteres especiais (#, $, @)
- Unicode/Emojis

---

**Última Atualização**: Outubro 2025  
**Versão do Dashboard**: 2.1
