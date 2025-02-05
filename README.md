# MiniPolar - Web Asset Minifier

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)

A minification tool designed to optimize web assets while preserving important development features like React components, template syntax, and code examples.

## Features

- HTML minification with template syntax preservation
- Advanced CSS optimization with multiple compression levels
- Smart JavaScript minification that detects and preserves:
  - React/JSX code structures
  - Code examples and documentation
  - Template literals and expressions
- Recursive directory processing
- Maintains source code readability where needed

## Installation

```bash
# Clone the repository
git clone https://github.com/immapolar/MiniPolar-HTML-CSS-JS-Minifier

# Install dependencies
npm install
```

## Dependencies

```json
{
  "dependencies": {
    "terser": "^5.16.0",
    "clean-css": "^5.3.2",
    "html-minifier-terser": "^7.2.0"
  }
}
```

## Usage

### Basic Usage

```bash
node minipolar.js
```

### Directory Structure

```
project/
├── src/           # Input
│   ├── js/
│   ├── css/
│   └── html/
└── dist/          # Output
    ├── js/
    ├── css/
    └── html/
```

### Configuration

The tool automatically detects file types and applies appropriate optimization strategies. Default paths are:
- Input: `./src`
- Output: `./dist`

## Important Notes

1. **React/JSX Protection**: The tool automatically detects React components and preserves class names and function names to maintain functionality.

2. **Template Syntax**: Supports preservation of various template syntaxes:
   - EJS (`<% %>`)
   - PHP-style (`<?php ?>`)
   - Handlebars/Mustache/Vue (`{{ }}`)
   - Liquid/Django/Nunjucks (`{% %}`)
   - Template literals (`${}`)

3. **Code Examples**: When code examples are detected (marked by backticks or specific keywords), the tool maintains readability by preserving whitespace and formatting.

## Advanced Configuration

### CSS Minification Levels

```javascript
const cssOptions = {
  level: {
    1: { all: true },
    2: {
      all: true,
      removeUnusedAtRules: true,
      restructureRules: true
    }
  }
};
```

### JavaScript Minification Options

```javascript
const terserOptions = {
  compress: {
    dead_code: true,
    drop_console: false,
    drop_debugger: true,
    passes: 2
  },
  // ... (see minipolar.js for full configuration)
};
```

## License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.

---

## Show your support

Give a ⭐️ if this project helped you
