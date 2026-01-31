# Eternal Memory Skill - Installation Guide

## Installation Steps

### 1. Copy skill to OpenClaw skills directory

```bash
# If OpenClaw runs locally
cp -r ./openclaw-skill ~/.openclaw/skills/eternal-memory

# If OpenClaw runs in Docker (replace CONTAINER_NAME)
docker cp ./openclaw-skill CONTAINER_NAME:/root/.openclaw/skills/eternal-memory
```

### 2. Configure environment variables in openclaw.json

Edit `~/.openclaw/openclaw.json` (or `/root/.openclaw/openclaw.json` in Docker):

```json
{
  "skills": {
    "entries": {
      "eternal-memory": {
        "enabled": true,
        "env": {
          "ETERNAL_MEMORY_URL": "https://openclaw-be-production.up.railway.app",
          "ETERNAL_MEMORY_API_KEY": "YOUR_API_KEY_HERE"
        }
      }
    }
  }
}
```

### 3. Restart OpenClaw

```bash
# Local
openclaw restart

# Docker
docker restart CONTAINER_NAME
```

### 4. Verify installation

Ask your OpenClaw assistant: "List my stored memories"

The assistant should use the Eternal Memory API to fetch and display memories.

## Troubleshooting

- **Skill not found**: Ensure SKILL.md is in `~/.openclaw/skills/eternal-memory/SKILL.md`
- **API errors**: Verify ETERNAL_MEMORY_URL and ETERNAL_MEMORY_API_KEY are correct
- **Permission denied**: Check file permissions in skills directory
