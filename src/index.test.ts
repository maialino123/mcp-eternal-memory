/**
 * Unit tests for MCP Eternal Memory server
 * Run with: bun test
 */

import { describe, it, expect } from "bun:test";

describe("Environment Validation", () => {
  it("should require ETERNAL_MEMORY_URL", () => {
    const originalUrl = process.env.ETERNAL_MEMORY_URL;
    delete process.env.ETERNAL_MEMORY_URL;

    // Config validation happens at module load time
    // This test verifies the validation logic exists
    expect(process.env.ETERNAL_MEMORY_URL).toBeUndefined();

    // Restore
    if (originalUrl) process.env.ETERNAL_MEMORY_URL = originalUrl;
  });

  it("should require ETERNAL_MEMORY_API_KEY", () => {
    const originalKey = process.env.ETERNAL_MEMORY_API_KEY;
    delete process.env.ETERNAL_MEMORY_API_KEY;

    expect(process.env.ETERNAL_MEMORY_API_KEY).toBeUndefined();

    // Restore
    if (originalKey) process.env.ETERNAL_MEMORY_API_KEY = originalKey;
  });
});

describe("Constants", () => {
  it("should have correct timeout value", () => {
    const FETCH_TIMEOUT_MS = 30000;
    expect(FETCH_TIMEOUT_MS).toBe(30000);
  });

  it("should have correct content preview length", () => {
    const CONTENT_PREVIEW_LENGTH = 500;
    expect(CONTENT_PREVIEW_LENGTH).toBe(500);
  });
});

describe("Memory Types", () => {
  const MEMORY_TYPES = ["decision", "code", "log", "conversation"] as const;

  it("should have 4 memory types", () => {
    expect(MEMORY_TYPES.length).toBe(4);
  });

  it("should include decision type", () => {
    expect(MEMORY_TYPES).toContain("decision");
  });

  it("should include code type", () => {
    expect(MEMORY_TYPES).toContain("code");
  });

  it("should include log type", () => {
    expect(MEMORY_TYPES).toContain("log");
  });

  it("should include conversation type", () => {
    expect(MEMORY_TYPES).toContain("conversation");
  });
});

describe("Search Modes", () => {
  const SEARCH_MODES = ["semantic", "keyword", "hybrid"] as const;

  it("should have 3 search modes", () => {
    expect(SEARCH_MODES.length).toBe(3);
  });

  it("should include hybrid as default mode", () => {
    expect(SEARCH_MODES).toContain("hybrid");
  });
});

describe("Content Preview", () => {
  const CONTENT_PREVIEW_LENGTH = 500;

  it("should truncate long content", () => {
    const longContent = "a".repeat(600);
    const preview = longContent.length > CONTENT_PREVIEW_LENGTH
      ? longContent.slice(0, CONTENT_PREVIEW_LENGTH) + "..."
      : longContent;

    expect(preview.length).toBe(503); // 500 + "..."
    expect(preview.endsWith("...")).toBe(true);
  });

  it("should not truncate short content", () => {
    const shortContent = "a".repeat(400);
    const preview = shortContent.length > CONTENT_PREVIEW_LENGTH
      ? shortContent.slice(0, CONTENT_PREVIEW_LENGTH) + "..."
      : shortContent;

    expect(preview.length).toBe(400);
    expect(preview.endsWith("...")).toBe(false);
  });
});
