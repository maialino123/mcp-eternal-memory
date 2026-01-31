---
name: eternal-memory
description: Store and retrieve long-term memories using Eternal Memory API for persistent context across conversations
metadata: {"openclaw":{"requires":{"env":["ETERNAL_MEMORY_URL","ETERNAL_MEMORY_API_KEY"]},"primaryEnv":"ETERNAL_MEMORY_API_KEY"}}
---

# Eternal Memory

Store and search persistent memories across conversations. Use this to remember important decisions, code snippets, conversations, and logs.

## API Endpoints

Base URL: `$ETERNAL_MEMORY_URL` (e.g., `https://openclaw-be-production.up.railway.app`)

All requests require header: `X-API-Key: $ETERNAL_MEMORY_API_KEY`

### Store Memory

```bash
curl -X POST "$ETERNAL_MEMORY_URL/api/v1/memories" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ETERNAL_MEMORY_API_KEY" \
  -d '{
    "type": "decision|code|log|conversation",
    "title": "Short descriptive title",
    "content": "Full content to store",
    "source": "openclaw-assistant",
    "meta": {"optional": "metadata"}
  }'
```

Response: `{"id": 123, "chunk_count": 2}`

### Search Memories

```bash
curl -X POST "$ETERNAL_MEMORY_URL/api/v1/search" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ETERNAL_MEMORY_API_KEY" \
  -d '{
    "query": "natural language search query",
    "types": ["decision", "code"],
    "limit": 10,
    "min_similarity": 0.5,
    "mode": "hybrid"
  }'
```

Search modes: `semantic`, `keyword`, `hybrid` (default)

### List Memories

```bash
curl "$ETERNAL_MEMORY_URL/api/v1/memories?type=decision&limit=20&offset=0" \
  -H "X-API-Key: $ETERNAL_MEMORY_API_KEY"
```

### Get Memory by ID

```bash
curl "$ETERNAL_MEMORY_URL/api/v1/memories/123" \
  -H "X-API-Key: $ETERNAL_MEMORY_API_KEY"
```

### Delete Memory

```bash
curl -X DELETE "$ETERNAL_MEMORY_URL/api/v1/memories/123" \
  -H "X-API-Key: $ETERNAL_MEMORY_API_KEY"
```

## Memory Types

- `decision` - Important decisions and their rationale
- `code` - Code snippets, implementations, solutions
- `log` - Activity logs, events, debugging info
- `conversation` - Important conversation excerpts

## When to Use

- **Store** memories when user makes important decisions, shares code solutions, or discusses key topics
- **Search** memories before answering questions to provide context-aware responses
- **List** memories to show user what has been remembered
- **Delete** memories when user requests removal

## Example Usage

Before answering a question about a past decision:
```bash
curl -X POST "$ETERNAL_MEMORY_URL/api/v1/search" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ETERNAL_MEMORY_API_KEY" \
  -d '{"query": "user preference for database", "types": ["decision"], "limit": 5}'
```

After user makes an important decision:
```bash
curl -X POST "$ETERNAL_MEMORY_URL/api/v1/memories" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ETERNAL_MEMORY_API_KEY" \
  -d '{
    "type": "decision",
    "title": "Database choice: PostgreSQL",
    "content": "User decided to use PostgreSQL for the project because of strong JSON support and reliability.",
    "source": "openclaw-assistant"
  }'
```
