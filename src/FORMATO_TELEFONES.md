# 📱 Guia de Formatos de Telefone para o Mapa Geográfico

## Por que o mapa não aparece?

O mapa geográfico do dashboard depende de telefones com **DDDs válidos** na coluna `telefone` ou `Telefone` da sua planilha Excel.

## ✅ Formatos Aceitos

O sistema reconhece automaticamente estes formatos:

### 1. Com código do país (+55)
```
5511999999999
+5511999999999
```

### 2. Sem código do país
```
11999999999
```

### 3. Formatados
```
(11) 99999-9999
(11) 9999-9999
11-99999-9999
```

## 📊 Diagnóstico Automático

Quando você carrega dados, o sistema mostra:

- ✅ **Total de registros processados**
- ✅ **Quantos têm DDD válido** (aparecem no mapa)
- ❌ **Quantos não têm DDD** (são ignorados)
- 📈 **Taxa de sucesso** (percentual processado corretamente)

### Exemplo de Card de Diagnóstico

```
📊 Diagnóstico de Processamento
─────────────────────────────────
Total de registros:        1.234
Com DDD válido:             987  ✓
Sem DDD reconhecido:        247  ✗
Taxa de sucesso:           80.0%
```

## ⚠️ Formatos NÃO Aceitos

Estes formatos **não funcionam** e serão ignorados:

```
❌ 999999999        (sem DDD)
❌ 0800123456       (número 0800)
❌ abc123           (texto inválido)
❌ 1234             (muito curto)
```

## 🗺️ DDDs Válidos por Região

### Norte
- **AC**: 68
- **AM**: 92, 97
- **AP**: 96
- **PA**: 91, 93, 94
- **RO**: 69
- **RR**: 95
- **TO**: 63

### Nordeste
- **AL**: 82
- **BA**: 71, 73, 74, 75, 77
- **CE**: 85, 88
- **MA**: 98, 99
- **PB**: 83
- **PE**: 81, 87
- **PI**: 86, 89
- **RN**: 84
- **SE**: 79

### Centro-Oeste
- **DF**: 61
- **GO**: 62, 64
- **MT**: 65, 66
- **MS**: 67

### Sudeste
- **ES**: 27, 28
- **MG**: 31, 32, 33, 34, 35, 37, 38
- **RJ**: 21, 22, 24
- **SP**: 11, 12, 13, 14, 15, 16, 17, 18, 19

### Sul
- **PR**: 41, 42, 43, 44, 45, 46
- **RS**: 51, 53, 54, 55
- **SC**: 47, 48, 49

## 🛠️ Como Corrigir Dados

### No Excel (antes de importar)

1. Certifique-se que a coluna se chama `telefone` ou `Telefone`
2. Adicione o DDD no início de cada número
3. Use um formato consistente (recomendamos sem formatação, apenas números)

**Exemplo de correção:**

| ❌ Antes | ✅ Depois |
|---------|----------|
| 999999999 | 11999999999 |
| 99999-9999 | 11999999999 |
| sem telefone | 11999999999 |

### Fórmula Excel para adicionar DDD

Se todos os seus clientes são de São Paulo (DDD 11), use esta fórmula:

```excel
="11" & A2
```

Onde `A2` é a célula com o telefone sem DDD.

## 💡 Dicas Importantes

1. **Não misture formatos**: Escolha um formato e use em todos os registros
2. **DDDs falsos**: Evite usar DDDs inventados (ex: 00, 99)
3. **Backup**: Sempre mantenha uma cópia da planilha original
4. **Teste pequeno**: Teste com 10-20 registros primeiro

## 🎯 Meta de Qualidade

Para aproveitar ao máximo o mapa geográfico:

- **Ideal**: Taxa de sucesso acima de **90%**
- **Bom**: Taxa de sucesso entre **70-90%**
- **Atenção**: Taxa de sucesso abaixo de **70%** (revise seus dados)

## 📞 Exemplo Real

```
Cliente: João Silva
Telefone Original: (11) 98765-4321

✅ Formatos aceitos (qualquer um funciona):
- 5511987654321
- 11987654321
- (11) 98765-4321
- 11-98765-4321

Estado detectado: SP (São Paulo)
Região: Sudeste
```

## 🔍 Troubleshooting

### Problema: "Nenhum Dado Geográfico Disponível"

**Possíveis causas:**
1. Coluna de telefone não existe ou tem nome diferente
2. Todos os telefones estão sem DDD
3. DDDs inválidos (fora da lista brasileira)

**Solução:**
- Verifique o card de diagnóstico
- Adicione DDDs aos telefones
- Renomeie a coluna para `telefone` ou `Telefone`

### Problema: "Taxa de sucesso muito baixa"

**Solução:**
1. Exporte os dados problemáticos
2. Use a função PROCV/VLOOKUP para adicionar DDDs baseado em cidade/estado
3. Reimporte os dados corrigidos

---

**Última atualização:** 28/10/2025
