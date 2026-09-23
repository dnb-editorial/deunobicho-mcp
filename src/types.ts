// Types compartilhados pelo MCP server @deunobicho/mcp
// Portal editorial: https://deunobicho.online

export interface Grupo {
  n: number;
  nome: string;
  dezenas: number[];
}

export interface FederalPremio {
  posicao: number;
  bilhete: string;
  milhar: string;
  grupo: {
    n: number;
    nome: string;
  };
}

export interface FederalResult {
  concurso: number;
  data: string;
  dataApuracao: string;
  premios: FederalPremio[];
  gruposVencedores: Array<{
    posicao: number;
    grupo: number;
    nome: string;
  }>;
  sha256: string;
  fonte: string;
  fetchedAt: string;
  canonicalUrl: string;
}

export interface LoteriaResult {
  slug: string;
  sorteio: string;
  descricao: string;
  horario?: string;
  concurso?: number;
  dataApuracao?: string;
  numeros?: number[];
  premios?: unknown;
  fonte?: string;
  fetchedAt: string;
  mode: "live" | "sample" | "cache";
  sha256?: string;
  canonicalUrl: string;
}

export interface Sonho {
  slug: string;
  nome: string;
  grupo: number;
  dezenas: number[];
  grupoSecundario?: number;
  dezenasSecundarias?: number[];
  significado: string;
  bichoJogar: string;
  centenas: string;
  milhares: string;
  canonicalUrl: string;
}

export interface PalpiteDoDia {
  data: string;
  grupo: number;
  bicho: string;
  dezenas: number[];
  centena?: string;
  milhar?: string;
  justificativa: string;
  canonicalUrl: string;
}

export interface Cotacao {
  modalidade: string;
  descricao: string;
  cotacao: string;
  exemploR5?: number;
}

export interface CacheEntry<T> {
  value: T;
  at: number;
}

export type ToolResponse = {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
};
