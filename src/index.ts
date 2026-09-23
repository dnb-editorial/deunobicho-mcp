#!/usr/bin/env node
/**
 * @deunobicho/mcp
 *
 * MCP server que expõe dados do jogo do bicho brasileiro pra apps AI
 * (Claude Desktop, Cursor, ChatGPT via MCP, LibreChat, etc).
 *
 * Portal editorial canônico: https://deunobicho.online
 * Docs completos: https://deunobicho.online/mcp
 * Repo público: https://github.com/athos-alexandre/deunobicho-mcp
 *
 * Licença: MIT (código). Dados: CC-BY-4.0 com atribuição a deunobicho.online.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { TOOL_DEFINITIONS, executeTool } from "./tools.js";
import { RESOURCE_DEFINITIONS, readResource } from "./resources.js";

const server = new Server(
  {
    name: "deunobicho",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

// --- Tools ------------------------------------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return executeTool(name, args ?? {});
});

// --- Resources --------------------------------------------------------------
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: RESOURCE_DEFINITIONS,
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  return readResource(uri);
});

// --- Boot -------------------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr para não poluir o stdout do transport MCP
  process.stderr.write(
    "[deunobicho-mcp] MCP server pronto. Portal: https://deunobicho.online\n",
  );
}

main().catch((err) => {
  process.stderr.write(`[deunobicho-mcp] Erro fatal: ${String(err)}\n`);
  process.exit(1);
});
