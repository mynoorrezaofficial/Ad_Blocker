# Ad Blocker Extension Pipeline

This diagram shows the main data and control flow for a browser ad blocker extension.

```mermaid
flowchart TD
    A[Browser Tab] -->|Load page| B[Content Script]
    B -->|Scan DOM| C{Ad elements found?}
    C -->|Yes| D[Hide / remove ads]
    C -->|No| E[No action]
    B --> F[Send blocked count]
    A -->|Request ad resource| G[Background Service Worker]
    G -->|Check rules| H{Match block list?}
    H -->|Yes| I[Cancel request]
    H -->|No| J[Allow request]
    G --> K[Update metrics]
    L[Popup UI] -->|Toggle on/off| G
    L -->|Show stats| B
    M[Options Page] -->|Manage filters| G
    M -->|Whitelist domains| G
    style A fill:#e8f1ff,stroke:#1f77b4
    style B fill:#f9f7ef,stroke:#b97a57
    style G fill:#e6f9e5,stroke:#34a853
    style L fill:#fff4e5,stroke:#f39c12
    style M fill:#f0f0f5,stroke:#6f42c1

environment: Browser extension pipeline flow
```
