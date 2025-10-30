# 📋 Exemplos de Dados para Teste do Mapa Geográfico

## Dados de Exemplo para Copiar no Excel

### Aba: Clientes Ativos

| telefone | nome | plano | renovacoes |
|----------|------|-------|------------|
| 5511987654321 | João Silva | 1 | 3 |
| 11976543210 | Maria Santos | 3 | 1 |
| (21) 98765-4321 | Pedro Costa | 12 | 5 |
| 21987654321 | Ana Oliveira | 6 | 2 |
| 85987654321 | Carlos Lima | 1 | 0 |
| (11) 91234-5678 | Beatriz Souza | 2 | 4 |
| 5547988887777 | Roberto Alves | 3 | 1 |
| 71999998888 | Fernanda Rocha | 1 | 2 |
| (31) 99999-7777 | Lucas Martins | 12 | 6 |
| 5541987776666 | Juliana Freitas | 6 | 3 |

### Aba: Clientes Expirados

| telefone | nome | plano |
|----------|------|-------|
| 11966665555 | José Pereira | 1 |
| 21955554444 | Paula Dias | 3 |
| 85944443333 | Marcos Silva | 1 |

## Resultado Esperado

Ao carregar esses dados, o mapa mostrará:

### Estados com Clientes
- **SP** (São Paulo): 3 clientes
- **RJ** (Rio de Janeiro): 2 clientes  
- **CE** (Ceará): 1 cliente
- **SC** (Santa Catarina): 1 cliente
- **BA** (Bahia): 1 cliente
- **MG** (Minas Gerais): 1 cliente
- **PR** (Paraná): 1 cliente

### Diagnóstico Esperado
```
Total de registros: 13
Com DDD válido: 13 ✓
Sem DDD reconhecido: 0 ✗
Taxa de sucesso: 100.0%
```

## Variedade de Formatos (Todos Válidos)

Estes exemplos mostram que o sistema aceita vários formatos:

| Formato | Exemplo | Estado |
|---------|---------|--------|
| Código do país | 5511987654321 | SP |
| Sem país | 11987654321 | SP |
| Com parênteses | (11) 98765-4321 | SP |
| Com hífen | 11-98765-4321 | SP |
| Formatado completo | (11) 9 8765-4321 | SP |

## DDDs por Região para Testar

### Para testar todas as regiões:

```
Norte:       68 (AC), 92 (AM), 96 (AP), 91 (PA), 69 (RO), 95 (RR), 63 (TO)
Nordeste:    82 (AL), 71 (BA), 85 (CE), 98 (MA), 83 (PB), 81 (PE), 86 (PI), 84 (RN), 79 (SE)
Centro-Oeste: 61 (DF), 62 (GO), 65 (MT), 67 (MS)
Sudeste:     27 (ES), 31 (MG), 21 (RJ), 11 (SP)
Sul:         41 (PR), 51 (RS), 47 (SC)
```

## Planilha Completa de Teste

Copie e cole no Excel:

```
telefone	nome	plano	renovacoes
5568987654321	Cliente Acre	1	2
5592987654321	Cliente Amazonas	3	1
5596987654321	Cliente Amapá	1	0
5591987654321	Cliente Pará	12	5
5569987654321	Cliente Rondônia	6	3
5595987654321	Cliente Roraima	1	1
5563987654321	Cliente Tocantins	3	2
5582987654321	Cliente Alagoas	1	1
5571987654321	Cliente Bahia	12	4
5585987654321	Cliente Ceará	6	2
5598987654321	Cliente Maranhão	1	0
5583987654321	Cliente Paraíba	3	3
5581987654321	Cliente Pernambuco	12	6
5586987654321	Cliente Piauí	1	2
5584987654321	Cliente RN	6	1
5579987654321	Cliente Sergipe	3	2
5561987654321	Cliente DF	12	8
5562987654321	Cliente Goiás	6	4
5565987654321	Cliente MT	1	1
5567987654321	Cliente MS	3	2
5527987654321	Cliente ES	1	0
5531987654321	Cliente MG	12	7
5521987654321	Cliente RJ	6	3
5511987654321	Cliente SP	12	10
5541987654321	Cliente PR	6	5
5551987654321	Cliente RS	3	2
5547987654321	Cliente SC	1	1
```

## Como Usar

1. **Copie os dados acima**
2. **Abra o Excel**
3. **Cole na aba "Clientes Ativos"** ou "Ativos"
4. **Salve como .xlsx**
5. **Carregue no dashboard**
6. **Acesse a view "Geografia"**
7. **Veja o mapa colorido! 🗺️**

## Cores do Mapa

O mapa usa intensidade de cor baseada no número de clientes:

- 🟢 **Verde**: Baixa concentração (0-30% do máximo)
- 🟡 **Amarelo**: Média concentração (30-70% do máximo)
- 🔴 **Vermelho**: Alta concentração (70-100% do máximo)

## Próximos Passos

Depois de testar com dados de exemplo:

1. Prepare seus dados reais
2. Adicione DDDs aos telefones
3. Importe e visualize
4. Use os insights geográficos para:
   - Identificar estados com mais clientes
   - Encontrar oportunidades de expansão
   - Analisar receita por região
   - Comparar fidelização entre estados

---

**💡 Dica:** Comece com poucos registros (10-20) para validar o formato antes de importar milhares de linhas!
