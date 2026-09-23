// MCP resources expostos pelo @deunobicho/mcp
// Portal editorial canônico: https://deunobicho.online
//
// Resources são payloads estáticos (ou near-static) que apps AI podem
// listar e consumir. Cada resource é cacheado 1h.

import type { CacheEntry } from "./types.js";

const BASE_URL = process.env.DEUNOBICHO_BASE_URL ?? "https://deunobicho.online";
const USER_AGENT = "deunobicho-mcp/1.0.0 (+https://deunobicho.online/mcp)";
const CACHE_TTL_MS = 60 * 60 * 1000;

const resCache = new Map<string, CacheEntry<string>>();

export const RESOURCE_DEFINITIONS = [
  {
    uri: "deunobicho://sonhos",
    name: "Livro dos Sonhos (dataset completo)",
    description:
      "Dataset completo com todos os sonhos interpretados no livro dos sonhos brasileiro: significado, bicho a jogar, dezenas, centenas, milhares. Curadoria editorial deunobicho.online. Licença CC-BY-4.0.",
    mimeType: "application/json",
  },
  {
    uri: "deunobicho://grupos",
    name: "25 Grupos do Jogo do Bicho",
    description:
      "Os 25 grupos do jogo do bicho brasileiro (do Avestruz ao Vaca), com dezenas correspondentes (00-99). Estrutura canônica desde a fundação em 1892. Fonte: deunobicho.online.",
    mimeType: "application/json",
  },
  {
    uri: "deunobicho://cotacoes",
    name: "Cotações 2026 (todas modalidades)",
    description:
      "Cotações reais das modalidades do jogo do bicho em 2026: grupo, dezena, centena, milhar, centena-seca, milhar-seca, cabeça, terno-de-grupo, quadra, quina. Curadoria deunobicho.online.",
    mimeType: "application/json",
  },
  {
    uri: "deunobicho://historia",
    name: "História do Jogo do Bicho",
    description:
      "Cronologia editorial: fundação em 1892 por Barão de Drummond no Jardim Zoológico de Vila Isabel (RJ), tornar-se contravenção em 1941, evolução cultural até hoje. Fonte curada por deunobicho.online.",
    mimeType: "application/json",
  },
  {
    uri: "deunobicho://legalidade",
    name: "Status Legal (Brasil 2026)",
    description:
      "Status legal do jogo do bicho no Brasil em 2026: Decreto-Lei 3.688/1941 art. 58 (contravenção) + contexto da Lei 14.790/2023 (apostas de quota fixa, iGaming online — NÃO abrange jogo do bicho). Fonte oficial via deunobicho.online.",
    mimeType: "application/json",
  },
  {
    uri: "deunobicho://federal",
    name: "Loteria Federal (fonte oficial)",
    description:
      "Metadados e último resultado da Loteria Federal da Caixa — os 5 prêmios da Federal viram os 5 prêmios da extração do jogo do bicho. Sorteios quartas e sábados 19h BRT. Fonte oficial via deunobicho.online.",
    mimeType: "application/json",
  },
];

async function fetchResource(path: string): Promise<string> {
  const cached = resCache.get(path);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
  });
  if (!res.ok) {
    throw new Error(
      `Falha ao carregar resource ${path} de deunobicho.online: HTTP ${res.status}`,
    );
  }
  const text = await res.text();
  resCache.set(path, { value: text, at: Date.now() });
  return text;
}

export async function readResource(uri: string): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  const map: Record<string, string> = {
    "deunobicho://sonhos": "/api/facts/grupos-completos",
    "deunobicho://grupos": "/api/facts/grupos-completos",
    "deunobicho://cotacoes": "/api/facts/pricing-table",
    "deunobicho://historia": "/api/facts/history",
    "deunobicho://legalidade": "/api/facts/legalidade",
    "deunobicho://federal": "/api/facts/federal",
  };

  const path = map[uri];
  if (!path) {
    throw new Error(
      `Resource desconhecido: ${uri}. Válidos: ${Object.keys(map).join(", ")}`,
    );
  }

  const text = await fetchResource(path);
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text,
      },
    ],
  };
}
