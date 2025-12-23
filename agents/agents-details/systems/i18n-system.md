# i18n/L10n (Internationalization, MANDATORY)

### Message Key System
- **All user-facing text MUST use message keys**
- No hardcoded strings in code
- Keys in JSON: `"msg.tool.git.summary": "Distributed version control"`
- Generator produces typed accessors per language

### Message Key Structure
```json
{
  "messageKeys": {
    "msg.tool.git.title": {
      "en": "Git",
      "es": "Git",
      "fr": "Git",
      "de": "Git",
      "ja": "Git"
    },
    "msg.tool.git.summary": {
      "en": "Distributed version control system",
      "es": "Sistema de control de versiones distribuido",
      "fr": "Système de contrôle de version distribué",
      "de": "Verteiltes Versionskontrollsystem",
      "ja": "分散バージョン管理システム"
    }
  }
}
```

### Required Locales (Initial)
- en (English) - default/fallback
- es (Spanish)
- fr (French)
- de (German)
- ja (Japanese)

Additional locales added via spec, not code changes.
