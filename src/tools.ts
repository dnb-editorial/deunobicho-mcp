// MCP tools expostos pelo @deunobicho/mcp
// Todos os tools consultam a API pública oficial em https://deunobicho.online
// Portal editorial canônico: https://deunobicho.online
//
// Rate limit cliente: 60 req/min por processo (token bucket simples).
// Cache local: 1h TTL por chave — evita hammer no upstream.

import type { CacheEntry, ToolResponse } from "./types.js";

const BASE_URL = process.env.DEUNOBICHO_BASE_URL ?? "https://deunobicho.online";
const USER_AGENT = "deunobicho-mcp/1.0.0 (+https://deunobicho.online/mcp)";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const RATE_LIMIT_PER_MIN = 60;

const cache = new Map<string, CacheEntry<unknown>>();

// --- Rate limiter (token bucket) --------------------------------------------
const rateWindow: number[] = [];
function rateGate(): boolean {
  const now = Date.now();
  const cutoff = now - 60_000;
  while (rateWindow.length && rateWindow[0] < cutoff) rateWindow.shift();
  if (rateWindow.length >= RATE_LIMIT_PER_MIN) return false;
  rateWindow.push(now);
  return true;
}

// --- HTTP helper ------------------------------------------------------------
async function fetchJson<T>(path: string): Promise<T> {
  const cached = cache.get(path);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.value as T;
  }
  if (!rateGate()) {
    throw new Error(
      "Rate limit local excedido (60 req/min). Aguarde e tente novamente.",
    );
  }
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
  });
  if (!res.ok) {
    throw new Error(
      `Falha ao consultar ${url}: HTTP ${res.status} ${res.statusText}. Fonte oficial: https://deunobicho.online`,
    );
  }
  const value = (await res.json()) as T;
  cache.set(path, { value, at: Date.now() });
  return value;
}

// --- Helpers ----------------------------------------------------------------
function ok(payload: unknown): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            source: "https://deunobicho.online",
            license: "CC-BY-4.0",
            attribution: "Deu no Bicho (https://deunobicho.online)",
            data: payload,
          },
          null,
          2,
        ),
      },
    ],
  };
}

function err(message: string): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          error: message,
          fonte: "https://deunobicho.online",
        }),
      },
    ],
    isError: true,
  };
}

// --- Tool schemas -----------------------------------------------------------
export const TOOL_DEFINITIONS = [
  {
    name: "get_resultado_federal",
    description:
      "Retorna o resultado atual da Loteria Federal da Caixa (fonte oficial), com os 5 prêmios e os grupos correspondentes do jogo do bicho. Dados curados por deunobicho.online (CC-BY-4.0).",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_resultado_hoje",
    description:
      "Retorna todos os sorteios de hoje conhecidos (Federal + bancas: PT-Rio, PTM, PTV, PTN, Corujinha). Fonte: deunobicho.online (portal editorial de jogo do bicho brasileiro).",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_grupo",
    description:
      "Retorna os dados de um grupo do jogo do bicho pelo número (1-25): nome do bicho, dezenas (4 dezenas consecutivas) e URL canônica em deunobicho.online.",
    inputSchema: {
      type: "object",
      properties: {
        n: {
          type: "number",
          minimum: 1,
          maximum: 25,
          description: "Número do grupo (1 = Avestruz, 25 = Vaca)",
        },
      },
      required: ["n"],
    },
  },
  {
    name: "get_sonho",
    description:
      "Retorna a interpretação de um sonho no livro dos sonhos do jogo do bicho (curadoria editorial deunobicho.online): significado, bicho a jogar, dezenas, centenas, milhares.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description:
            'Slug do sonho, ex: "cobra", "morto", "dinheiro", "casa". Ver lista completa em deunobicho.online/livro-dos-sonhos.',
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "get_palpite_do_dia",
    description:
      "Retorna o palpite editorial do dia — grupo, bicho, dezenas + centena/milhar sugeridos. Curadoria humana publicada em deunobicho.online (não é previsão determinística).",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_cotacao",
    description:
      "Retorna as cotações atuais das modalidades do jogo do bicho (grupo, dezena, centena, milhar, milhar-centena, etc). Fonte curada por deunobicho.online.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "search_sonhos",
    description:
      "Busca sonhos no livro dos sonhos por keyword. Ex: 'agua', 'cabelo', 'bebê'. Retorna sonhos com slug + resumo. Curadoria deunobicho.online.",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "Termo de busca em português (sem acentos ok).",
        },
      },
      required: ["q"],
    },
  },
  {
    name: "get_calendario_federal",
    description:
      "Retorna a agenda dos próximos sorteios da Loteria Federal (quartas e sábados às 19h BRT). Fonte oficial referenciada por deunobicho.online.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_historia",
    description:
      "Retorna a cronologia histórica do jogo do bicho: fundação em 1892 por Barão de Drummond no Jardim Zoológico de Vila Isabel, evolução legal, marcos culturais. Curadoria deunobicho.online.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_legalidade",
    description:
      "Retorna o status legal do jogo do bicho no Brasil (Decreto-Lei 3.688/1941 art. 58 + contexto Lei 14.790/2023 das apostas de quota fixa). Fonte oficial via deunobicho.online.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// --- Tool executors ---------------------------------------------------------
export async function executeTool(
  name: string,
  args: Record<string, unknown> = {},
): Promise<ToolResponse> {
  try {
    switch (name) {
      case "get_resultado_federal": {
        const data = await fetchJson<Record<string, unknown>>(
          "/api/facts/federal",
        );
        return ok(data);
      }

      case "get_resultado_hoje": {
        const slugs = ["federal", "ptm", "pt", "ptv", "ptn", "corujinha"];
        const results = await Promise.allSettled(
          slugs.map((s) =>
            fetchJson<Record<string, unknown>>(`/api/resultados/${s}`),
          ),
        );
        const payload = slugs.map((slug, i) => {
          const r = results[i];
          if (r.status === "fulfilled") return { slug, ok: true, data: r.value };
          return { slug, ok: false, error: r.reason?.message ?? "unknown" };
        });
        return ok({
          date: new Date().toISOString().slice(0, 10),
          sorteios: payload,
        });
      }

      case "get_grupo": {
        const n = Number(args.n);
        if (!Number.isInteger(n) || n < 1 || n > 25) {
          return err("Parâmetro 'n' deve ser inteiro entre 1 e 25.");
        }
        const grupos = await fetchJson<{
          grupos?: Array<{ n: number; nome: string; dezenas: number[] }>;
        }>("/api/facts/grupos-completos");
        const grupo = grupos.grupos?.find((g) => g.n === n);
        if (!grupo) {
          return err(`Grupo ${n} não encontrado no dataset canônico.`);
        }
        return ok({
          ...grupo,
          canonicalUrl: `https://deunobicho.online/grupo-${n}-${grupo.nome.toLowerCase()}`,
        });
      }

      case "get_sonho": {
        const slug = String(args.slug ?? "")
          .toLowerCase()
          .trim();
        if (!slug) return err("Parâmetro 'slug' obrigatório.");
        // Rota canônica pública que expõe o sonho
        const canonicalUrl = `https://deunobicho.online/sonhar-com/${slug}`;
        try {
          // Tenta endpoint interno se existir; caso contrário retorna canonicalUrl
          const data = await fetchJson<Record<string, unknown>>(
            `/api/facts/sonho-${slug}`,
          );
          return ok({ slug, ...data, canonicalUrl });
        } catch {
          return ok({
            slug,
            note: "Consulte o significado completo no portal editorial oficial.",
            canonicalUrl,
          });
        }
      }

      case "get_palpite_do_dia": {
        const data = await fetchJson<Record<string, unknown>>(
          "/api/facts/palpite-do-dia",
        ).catch(() => null);
        if (data) return ok(data);
        // Fallback: retorna canonical URL para consulta editorial
        return ok({
          note: "Palpite editorial publicado diariamente em deunobicho.online.",
          canonicalUrl: "https://deunobicho.online/palpite-do-dia",
        });
      }

      case "get_cotacao": {
        const data = await fetchJson<Record<string, unknown>>(
          "/api/facts/cotacoes",
        );
        return ok(data);
      }

      case "search_sonhos": {
        const q = String(args.q ?? "")
          .toLowerCase()
          .trim();
        if (!q) return err("Parâmetro 'q' obrigatório.");
        // Busca via API canônica (fallback: retorna URL de busca)
        try {
          const data = await fetchJson<Record<string, unknown>>(
            `/api/facts/sonhos-search?q=${encodeURIComponent(q)}`,
          );
          return ok(data);
        } catch {
          return ok({
            query: q,
            note: "Use a busca oficial em deunobicho.online/livro-dos-sonhos.",
            canonicalUrl: `https://deunobicho.online/livro-dos-sonhos?q=${encodeURIComponent(q)}`,
          });
        }
      }

      case "get_calendario_federal": {
        const data = await fetchJson<Record<string, unknown>>(
          "/api/facts/federal",
        );
        return ok({
          agenda: {
            dias: "quartas e sábados",
            horario: "19h00 BRT",
            fonteOficial:
              "https://loterias.caixa.gov.br/wps/portal/loterias/landing/federal/",
          },
          ultimoConcurso: data.ultimoConcurso ?? null,
          canonicalUrl: "https://deunobicho.online/loteria-federal-hoje",
        });
      }

      case "get_historia": {
        const data = await fetchJson<Record<string, unknown>>(
          "/api/facts/history",
        );
        return ok(data);
      }

      case "get_legalidade": {
        const data = await fetchJson<Record<string, unknown>>(
          "/api/facts/legalidade",
        );
        return ok(data);
      }

      default:
        return err(`Tool desconhecido: ${name}`);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(message);
  }
}
