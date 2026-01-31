import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Config from environment with validation
const ETERNAL_MEMORY_URL = process.env.ETERNAL_MEMORY_URL;
const ETERNAL_MEMORY_API_KEY = process.env.ETERNAL_MEMORY_API_KEY;

// Fail fast if config missing
if (!ETERNAL_MEMORY_URL) {
  console.error("FATAL: ETERNAL_MEMORY_URL environment variable is required");
  process.exit(1);
}
if (!ETERNAL_MEMORY_API_KEY) {
  console.error("FATAL: ETERNAL_MEMORY_API_KEY environment variable is required");
  process.exit(1);
}

// Constants
const FETCH_TIMEOUT_MS = 30000;
const CONTENT_PREVIEW_LENGTH = 500;

// Memory types
const MEMORY_TYPES = ["decision", "code", "log", "conversation"] as const;
const SEARCH_MODES = ["semantic", "keyword", "hybrid"] as const;

// API Client
async function apiRequest(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const url = `${ETERNAL_MEMORY_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (ETERNAL_MEMORY_API_KEY) {
    headers["X-API-Key"] = ETERNAL_MEMORY_API_KEY;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error ${response.status}: ${text}`);
    }

    // DELETE may return empty body
    if (method === "DELETE") {
      return { success: true };
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Create MCP server
const server = new McpServer({
  name: "eternal-memory",
  version: "1.0.0",
});

// Tool: store_memory
server.tool(
  "store_memory",
  "Store a new memory (decision, code, log, or conversation)",
  {
    type: z.enum(MEMORY_TYPES).describe("Memory type"),
    title: z.string().max(255).describe("Short descriptive title"),
    content: z.string().describe("Full content to store"),
    source: z.string().default("openclaw-assistant").describe("Origin identifier"),
    meta: z.record(z.unknown()).optional().describe("Optional metadata"),
  },
  async ({ type, title, content, source, meta }) => {
    try {
      const result = await apiRequest("POST", "/api/v1/memories", {
        type,
        title,
        content,
        source,
        meta,
      }) as { id: number; chunk_count: number };

      return {
        content: [
          {
            type: "text" as const,
            text: `Memory stored successfully. ID: ${result.id}, Chunks: ${result.chunk_count}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: search_memory
server.tool(
  "search_memory",
  "Search memories using semantic similarity",
  {
    query: z.string().describe("Natural language search query"),
    types: z.array(z.enum(MEMORY_TYPES)).optional().describe("Filter by types"),
    limit: z.number().min(1).max(50).default(10).describe("Max results"),
    min_similarity: z.number().min(0).max(1).default(0.5).describe("Minimum similarity"),
    mode: z.enum(SEARCH_MODES).default("hybrid").describe("Search mode"),
  },
  async ({ query, types, limit, min_similarity, mode }) => {
    try {
      const result = await apiRequest("POST", "/api/v1/search", {
        query,
        types,
        limit,
        min_similarity,
        mode,
      }) as { results: Array<{ memory: { title: string; memory_id: number; type: string }; chunk: { similarity: number; content: string } }>; total_found: number };

      if (!result.results?.length) {
        return { content: [{ type: "text" as const, text: "No memories found." }] };
      }

      let output = `Found ${result.total_found} memories:\n\n`;
      for (const r of result.results) {
        output += "---\n";
        output += `**${r.memory.title}** (ID: ${r.memory.memory_id})\n`;
        output += `Type: ${r.memory.type} | Similarity: ${r.chunk.similarity.toFixed(2)}\n`;
        const content = r.chunk.content.length > CONTENT_PREVIEW_LENGTH
          ? r.chunk.content.slice(0, CONTENT_PREVIEW_LENGTH) + "..."
          : r.chunk.content;
        output += `Content: ${content}\n\n`;
      }

      return { content: [{ type: "text" as const, text: output }] };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: list_memories
server.tool(
  "list_memories",
  "List stored memories with pagination",
  {
    type: z.enum(MEMORY_TYPES).optional().describe("Filter by type"),
    source: z.string().optional().describe("Filter by source"),
    limit: z.number().min(1).max(100).default(20).describe("Max results"),
    offset: z.number().min(0).default(0).describe("Skip N results"),
  },
  async ({ type, source, limit, offset }) => {
    try {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (source) params.set("source", source);
      params.set("limit", String(limit));
      params.set("offset", String(offset));

      const result = await apiRequest("GET", `/api/v1/memories?${params}`) as {
        items: Array<{ id: number; title: string; type: string; chunk_count: number }>;
        total: number;
      };

      if (!result.items?.length) {
        return { content: [{ type: "text" as const, text: "No memories found." }] };
      }

      let output = `Showing ${result.items.length} of ${result.total} memories:\n\n`;
      for (const m of result.items) {
        output += `- [${m.id}] ${m.title} (${m.type}, ${m.chunk_count} chunks)\n`;
      }

      if (result.total > offset + limit) {
        output += `\nUse offset=${offset + limit} to see more.`;
      }

      return { content: [{ type: "text" as const, text: output }] };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: get_memory
server.tool(
  "get_memory",
  "Get full details of a memory by ID",
  {
    memory_id: z.number().describe("Memory ID to retrieve"),
  },
  async ({ memory_id }) => {
    try {
      const result = await apiRequest("GET", `/api/v1/memories/${memory_id}`) as {
        title: string;
        type: string;
        source: string;
        created_at: string;
        chunk_count: number;
        meta?: Record<string, unknown>;
        chunks?: Array<{ content: string }>;
      };

      let output = `# ${result.title}\n\n`;
      output += `**Type:** ${result.type}\n`;
      output += `**Source:** ${result.source}\n`;
      output += `**Created:** ${result.created_at}\n`;
      output += `**Chunks:** ${result.chunk_count}\n`;

      if (result.meta) {
        output += `**Metadata:** ${JSON.stringify(result.meta)}\n`;
      }

      output += "\n## Content\n\n";
      for (const chunk of result.chunks || []) {
        output += chunk.content + "\n\n";
      }

      return { content: [{ type: "text" as const, text: output }] };
    } catch (error) {
      const msg = String(error);
      if (msg.includes("404")) {
        return {
          content: [{ type: "text" as const, text: `Memory ${memory_id} not found.` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: `Error: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: delete_memory
server.tool(
  "delete_memory",
  "Delete a memory by ID (irreversible)",
  {
    memory_id: z.number().describe("Memory ID to delete"),
  },
  async ({ memory_id }) => {
    try {
      await apiRequest("DELETE", `/api/v1/memories/${memory_id}`);
      return {
        content: [{ type: "text" as const, text: `Memory ${memory_id} deleted.` }],
      };
    } catch (error) {
      const msg = String(error);
      if (msg.includes("404")) {
        return {
          content: [{ type: "text" as const, text: `Memory ${memory_id} not found.` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: `Error: ${error}` }],
        isError: true,
      };
    }
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Eternal Memory MCP server running on stdio");
}

main().catch(console.error);
