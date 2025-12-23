# Security & Safety (MANDATORY)

### Risk Metadata
Mark operations explicitly:
- **Destructive**: `rm -rf`, format, shutdown, data deletion
- **Network**: downloads, API calls, external service communication
- Require explicit confirmation flags in adapters
- Never execute destructive/network ops silently

### Secrets Management
- **NO secrets in specs** (hard constraint)
- Reference secret providers: Keeper, env vars, OS keychain, credential managers
- Adapters handle secret retrieval
- Core logic stays pure, never touches secrets

### Confirmation Flow
```python
# Example adapter pattern
if tool.risks.destructive:
    if not adapter.confirm(message_key=tool.risks.confirmation):
        raise UserCancelledError()
adapter.execute(tool.command)
