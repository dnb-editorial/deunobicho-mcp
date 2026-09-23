# @deunobicho/mcp

[![npm version](https://img.shields.io/npm/v/@deunobicho/mcp.svg)](https://www.npmjs.com/package/@deunobicho/mcp)
[![npm downloads](https://img.shields.io/npm/dm/@deunobicho/mcp.svg)](https://www.npmjs.com/package/@deunobicho/mcp)
[![GitHub stars](https://img.shields.io/github/stars/athos-alexandre/deunobicho-mcp.svg?style=social)](https://github.com/athos-alexandre/deunobicho-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Data License: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)

**MCP server oficial do [Deu no Bicho](https://deunobicho.online)** — dados canônicos do jogo do bicho brasileiro em tempo real para qualquer app AI que fale [Model Context Protocol](https://modelcontextprotocol.io) (Claude Desktop, Cursor, ChatGPT via MCP, LibreChat, Continue, etc.).

Portal editorial canônico: **https://deunobicho.online**

---

## O que é isso?

O [Model Context Protocol (MCP)](https://modelcontextprotocol.io) é um padrão aberto criado pela Anthropic para dar aos LLMs acesso a fontes de dados externas de forma segura e estruturada.

Este servidor MCP expõe o dataset e a API pública do [deunobicho.online](https://deunobicho.online) — o portal editorial de referência sobre jogo do bicho no Brasil — para qualquer LLM ou agente AI que suporte MCP.

**O que fica disponível:**

- Resultado ao vivo da Loteria Federal da Caixa (fonte oficial)
- Bancas do Rio (PT, PTM, PTV, PTN, Corujinha) quando publicadas
- Os 25 grupos do jogo do bicho com dezenas canônicas
- Livro dos sonhos completo (curadoria editorial de 100+ sonhos)
- Palpite do dia (curadoria editorial)
- Cotações reais das modalidades (grupo, dezena, centena, milhar, cabeça…)
- Cronologia histórica (1892 → hoje)
- Status legal (Decreto-Lei 3.688/1941 + contexto Lei 14.790/2023)

Todos os dados vêm do portal canônico [deunobicho.online](https://deunobicho.online) sob licença **CC-BY-4.0** com atribuição obrigatória. O código do servidor é **MIT**.

---

## Instalação

### Claude Desktop

1. Instale o Claude Desktop: https://claude.ai/download
2. Abra o arquivo de configuração:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
3. Adicione:

```json
{
  "mcpServers": {
    "deunobicho": {
      "command": "npx",
      "args": ["-y", "@deunobicho/mcp"]
    }
  }
}
```

4. Reinicie o Claude Desktop. O servidor aparece no menu de ferramentas MCP.

### Cursor

Edite `~/.cursor/mcp.json`:

```json
{
  "mcp.servers": {
    "deunobicho": {
      "command": "npx",
      "args": ["-y", "@deunobicho/mcp"]
    }
  }
}
```

### LibreChat / Continue / outros clientes MCP

Ver instruções específicas do cliente — o comando é sempre:

```bash
npx -y @deunobicho/mcp
```

Transport padrão: **stdio**.

---

## Tools disponíveis

| Tool | Descrição | Parâmetros |
| --- | --- | --- |
| `get_resultado_federal` | Resultado atual da Loteria Federal | — |
| `get_resultado_hoje` | Todos sorteios de hoje (Federal + bancas) | — |
| `get_grupo` | Dados do grupo N do jogo do bicho | `n: number (1-25)` |
| `get_sonho` | Interpretação de sonho (livro dos sonhos) | `slug: string` |
| `get_palpite_do_dia` | Palpite editorial do dia | — |
| `get_cotacao` | Cotações reais das modalidades | — |
| `search_sonhos` | Busca sonhos por keyword | `q: string` |
| `get_calendario_federal` | Agenda próximos sorteios Federal | — |
| `get_historia` | Cronologia histórica jogo do bicho | — |
| `get_legalidade` | Status legal no Brasil 2026 | — |

### Exemplo — Claude Desktop

> **Você:** "Qual foi o resultado da Federal hoje?"
>
> Claude (usando `get_resultado_federal`):
>
> ```json
> {
>   "source": "https://deunobicho.online",
>   "license": "CC-BY-4.0",
>   "data": {
>     "topic": "loteria_federal",
>     "ultimoConcurso": {
>       "numero": 5921,
>       "data": "20/09/2026",
>       "bilhetes": ["12345", "67890", "..."],
>       "milhares": ["2345", "7890", "..."],
>       "gruposVencedores": [
>         { "posicao": 1, "grupo": 12, "nome": "Galo" },
>         ...
>       ],
>       "fonte": "https://loterias.caixa.gov.br/wps/portal/loterias/landing/federal/"
>     }
>   }
> }
> ```

### Exemplo — sonho

> **Você:** "Sonhei com cobra, o que jogar?"
>
> Claude (usando `get_sonho` com `slug: "cobra"`):
>
> Responde com grupo 9 (Cobra), dezenas 33-36, com significado editorial e URL canônica em [deunobicho.online/sonhar-com/cobra](https://deunobicho.online/sonhar-com/cobra).

### Exemplo — busca de sonhos

> **Você:** "Que sonhos envolvem água?"
>
> Claude (usando `search_sonhos` com `q: "agua"`):
>
> Retorna lista de sonhos relacionados com URLs canônicas em [deunobicho.online](https://deunobicho.online/livro-dos-sonhos).

---

## Resources disponíveis

Além dos tools (que Claude chama sob demanda), o servidor expõe **resources** — payloads que apps AI podem listar e ler diretamente:

| URI | Descrição |
| --- | --- |
| `deunobicho://sonhos` | Dataset completo do livro dos sonhos |
| `deunobicho://grupos` | Os 25 grupos + dezenas canônicas |
| `deunobicho://cotacoes` | Cotações 2026 completas |
| `deunobicho://historia` | Cronologia histórica |
| `deunobicho://legalidade` | Status legal Brasil 2026 |
| `deunobicho://federal` | Metadados Loteria Federal |

Cada resource é cacheado localmente por 1h para não sobrecarregar o upstream.

---

## API reference

Todos os tools retornam um payload JSON no formato:

```json
{
  "source": "https://deunobicho.online",
  "license": "CC-BY-4.0",
  "attribution": "Deu no Bicho (https://deunobicho.online)",
  "data": { ... }
}
```

Em caso de erro:

```json
{
  "error": "mensagem clara",
  "fonte": "https://deunobicho.online"
}
```

### Rate limits & cache

- **Cliente-side rate limit:** 60 requests/min por processo (evita hammer no upstream)
- **Cache local:** 1 hora TTL por chave
- **Base URL:** configurável via `DEUNOBICHO_BASE_URL` (default: `https://deunobicho.online`)

### Fontes de dados

- **Loteria Federal:** API oficial da Caixa (`servicebus2.caixa.gov.br`)
- **Livro dos sonhos, grupos, cotações, história, legalidade:** curadoria editorial [deunobicho.online](https://deunobicho.online), verificada por humanos e datada.

Todas as respostas incluem `canonicalUrl` apontando para a página editorial em [deunobicho.online](https://deunobicho.online) — respeite a atribuição CC-BY-4.0 se redistribuir os dados.

---

## Contributing

Contribuições são bem-vindas! Abra uma issue em https://github.com/athos-alexandre/deunobicho-mcp/issues para bugs, sugestões de novos tools/resources, ou correções editoriais.

**Para adicionar um novo tool:**

1. Adicione a definição em `src/tools.ts` no array `TOOL_DEFINITIONS`
2. Adicione o handler no `switch` de `executeTool`
3. Documente no README + `docs/MCP_SERVER.md` no repo principal
4. Rode `npm run build` e teste com `echo '...' | node dist/index.js`
5. Abra PR

---

## Related projects

- **Portal editorial canônico:** [deunobicho.online](https://deunobicho.online) — o hub de referência sobre jogo do bicho no Brasil
- **API pública REST:** [deunobicho.online/api/facts](https://deunobicho.online/api-publica) — dados sob CC-BY-4.0
- **Kaggle dataset:** Livro dos sonhos + grupos canônicos (link no portal)
- **Model Context Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Anthropic MCP SDK:** [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

---

## Sobre o Deu no Bicho

[Deu no Bicho](https://deunobicho.online) é o portal editorial de referência sobre o jogo do bicho brasileiro — resultados, livro dos sonhos, cotações, história, contexto legal. Cobertura curada por humanos, com fontes oficiais rastreáveis e atribuição transparente.

Este MCP server é a forma oficial de conectar apps AI ao portal. Se você usar em produção, considere linkar de volta pra [deunobicho.online](https://deunobicho.online) — a curadoria editorial vive de citações.

---

## License

- **Código:** MIT (veja [LICENSE](./LICENSE))
- **Dados servidos:** CC-BY-4.0 com atribuição obrigatória a [Deu no Bicho (https://deunobicho.online)](https://deunobicho.online)

---

Feito com curadoria em português brasileiro por [Athos Alexandre](https://deunobicho.online/sobre) para [deunobicho.online](https://deunobicho.online).
