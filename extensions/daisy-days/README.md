# 🌼 Daisy Days

**Engraved by Ahmad Hamdi**

> A high-performance Model Context Protocol (MCP) server for DaisyUI. Generates production-ready UI layouts efficiently.

## 🚀 Overview

**Daisy Days** is a rust-based MCP server designed to accelerate UI development. It provides a heuristic "Idea Engine" and a suite of scaffolding tools to generate complex HTML structures instantly.

## ✨ Features

### 🧠 Idea Engine

Turn vague natural language prompts into complete, themed HTML pages.

- **Input**: "I want a dark cyberpunk portfolio for my hacker art"
- **Output**: A fully coded, responsive portfolio page with a "cyberpunk" theme and "brutalist" styling.

### 🛠️ Productivity Suite

- **Universal Layouts**: Generate any modern skeleton: SaaS, Blog, Social Feed, Inbox, Kanban, Profile, Docs...
- **E-commerce Ready**: Generate Product and Cart pages instantly.
- **Authentication**: scalable Login and Register forms.
- **Form Builder**: JSON-schema driven form generation with validation styles.
- **Theme Generator**: Create custom CSS themes (Hex/Oklch) effortlessly.
- **Interactivity**: Get the exact vanilla JS needed for Modals, Drawers, and Toasts.

### 📚 Documentation Access

- **Offline Cache**: Instantly search and retrieve DaisyUI Component docs.
- **Concept Engine**: Learn how to implement "Glassmorphism" or "Neumorphism" in DaisyUI.

## 📦 Installation & Usage

### Prerequisites

- A compatible MCP Client (e.g., Claude Desktop, specific IDE plugins).
- [Rust](https://www.rust-lang.org/) (if building from source).

### Running the Server

1. **Build the Release Binary**:
   ```bash
   cargo build --release
   ```
2. **Configure your MCP Client**:
   Point your client to the executable located at:
   `./target/release/daisy_days.exe`

### Example Configuration (Claude Desktop)

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "daisy-days": {
      "command": "d:/Dev/RustroverProjects/daisy_mcp/target/release/daisy_days.exe",
      "args": []
    }
  }
}
```

## 🎮 Tools & Examples

### 1. The Idea Engine (`daisyui_idea_to_ui`)

**Prompt**: "Build a glassmorphism business dashboard"

```json
{
  "name": "daisyui_idea_to_ui",
  "arguments": {
    "prompt": "Build a glassmorphism business dashboard"
  }
}
```

### 2. Scaffold a Layout (`daisyui_scaffold_layout`)

**Layouts**: `saas`, `blog`, `social`, `kanban`, `inbox`, `profile`, `docs`, `dashboard`, `auth`, `store`.

```json
{
  "name": "daisyui_scaffold_layout",
  "arguments": {
    "layout": "kanban",
    "title": "Project Alpha"
  }
}
```

### 3. Generate a Theme (`daisyui_generate_theme`)

**Inputs**: Name, Primary Color, Base Color.

```json
{
  "name": "daisyui_generate_theme",
  "arguments": {
    "name": "midnight-blue",
    "primary": "#0029ff",
    "base": "#0f172a"
  }
}
```

### 4. Build a Form (`daisyui_scaffold_form`)

**Inputs**: Title, Fields List.

```json
{
  "name": "daisyui_scaffold_form",
  "arguments": {
    "title": "Contact Us",
    "fields": [
      { "name": "email", "type": "email", "required": true },
      { "name": "message", "type": "textarea" }
    ]
  }
}
```

### 5. Get Component Docs (`daisyui_get_docs`)

**Input**: Component Name.

```json
{
  "name": "daisyui_get_docs",
  "arguments": {
    "component": "modal"
  }
}
```

## 📜 License

This project is authored by **Ahmad Hamdi**.
