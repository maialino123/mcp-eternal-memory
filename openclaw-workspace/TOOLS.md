# TOOLS.md - Available Tools

## Eternal Memory API

Persistent memory storage across conversations.

### Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Store | POST | `/api/v1/memories` |
| Search | POST | `/api/v1/search` |
| List | GET | `/api/v1/memories` |
| Get | GET | `/api/v1/memories/{id}` |
| Delete | DELETE | `/api/v1/memories/{id}` |

### Memory Types
- `decision` - Important decisions and rationale
- `code` - Code snippets, solutions, implementations
- `conversation` - Personal info, preferences, habits
- `log` - Events, debugging sessions, activities

### Search Modes
- `hybrid` (default) - Combined semantic + keyword
- `semantic` - Meaning-based similarity
- `keyword` - Exact term matching

### Usage Examples

**Store a decision:**
```bash
curl -X POST "$ETERNAL_MEMORY_URL/api/v1/memories" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ETERNAL_MEMORY_API_KEY" \
  -d '{
    "type": "decision",
    "title": "Database choice: PostgreSQL",
    "content": "Chose PostgreSQL for strong JSON support and reliability",
    "source": "openclaw"
  }'
```

**Search memories:**
```bash
curl -X POST "$ETERNAL_MEMORY_URL/api/v1/search" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ETERNAL_MEMORY_API_KEY" \
  -d '{"query": "database preferences", "limit": 5}'
```

## Web & Research

- Web search for current information
- URL fetching and content extraction
- Documentation lookup

## File Operations

- Read/write files in workspace
- Code execution (with caution)
- System commands (sandboxed)

## Messaging

- Telegram bot integration
- Message formatting (Markdown)
- File/image sharing

---

*Tools extend capabilities. Use wisely.*
