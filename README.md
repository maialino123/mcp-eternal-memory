# MCP Eternal Memory (TypeScript/Bun)

MCP server for Eternal Memory API integration with OpenClaw. Built with TypeScript and Bun for native Docker container compatibility.

## Features

- 5 MCP tools: store, search, list, get, delete memories
- Hybrid semantic + keyword search
- 30s timeout with abort controller
- Fail-fast config validation

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

Required environment variables:
- `ETERNAL_MEMORY_URL` - API endpoint (e.g., `https://your-app.railway.app`)
- `ETERNAL_MEMORY_API_KEY` - API authentication key

### 3. Run

```bash
bun run src/index.ts
```

## OpenClaw Integration

Add to `/root/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "list": [{
      "id": "main",
      "mcp": {
        "servers": [{
          "name": "eternal-memory",
          "command": "bun",
          "args": ["run", "/root/.openclaw/mcp-eternal-memory-ts/src/index.ts"],
          "env": {
            "ETERNAL_MEMORY_URL": "https://your-app.railway.app",
            "ETERNAL_MEMORY_API_KEY": "your-api-key"
          }
        }]
      }
    }]
  }
}
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `store_memory` | Save decision/code/log/conversation |
| `search_memory` | Hybrid semantic search |
| `list_memories` | Paginated listing |
| `get_memory` | Get full content by ID |
| `delete_memory` | Remove memory by ID |

## Deployment to VPS

```bash
# Copy to mounted volume
mkdir -p /root/.openclaw/mcp-eternal-memory-ts
# Copy package.json and src/index.ts

# Install in container
docker exec openclaw bun install --cwd /root/.openclaw/mcp-eternal-memory-ts

# Restart OpenClaw
docker restart openclaw
```

## Troubleshooting

### FATAL: environment variable required
Set both `ETERNAL_MEMORY_URL` and `ETERNAL_MEMORY_API_KEY` in config.

### Timeout errors
Railway cold start can take 10-20s. Timeout is set to 30s.

### Connection refused
Check if Eternal Memory API is running on Railway.
