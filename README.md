# BabyCam

Smart baby monitor — turn two smartphones into a baby monitoring system.

**Parent station**: React Native app (installed on the parent's phone)
**Baby station**: Web app (opens in the browser of any old phone — zero install)

Audio streams peer-to-peer via WebRTC. The server only handles the initial handshake.

## Architecture

```
┌─────────────────┐         WebRTC P2P          ┌──────────────────┐
│  Baby Station   │ ◄──────────────────────────► │  Parent Station  │
│  (Web App)      │      Audio + dB data         │  (React Native)  │
│  Browser/Chrome │                              │  Expo Dev Client │
└────────┬────────┘                              └────────┬─────────┘
         │                                                │
         │  Socket.IO (signaling only)                    │
         └──────────────┬─────────────────────────────────┘
                        │
               ┌────────▼────────┐
               │ Signaling Server │
               │ Node.js + Socket │
               │ (Render free)    │
               └─────────────────┘
```

## Tech stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native, Expo Dev Client, react-native-webrtc |
| Web | Vanilla HTML/TS, WebRTC API, Web Audio API |
| Server | Node.js, Express, Socket.IO |
| Shared | TypeScript, Turborepo monorepo |
| Design | Custom design tokens, dark-first theme |

## Patterns

- **Clean Architecture**: domain → data → infrastructure → presentation
- **SOLID**: single-responsibility use cases, dependency inversion via interfaces
- **Design tokens**: centralized color/spacing/typography system
- **Conventional Commits**: enforced in CI

## Project structure

```
babycam/
├── apps/
│   ├── mobile/          # React Native (Expo Dev Client)
│   ├── web/             # Baby station (vanilla HTML/TS)
│   └── server/          # Node.js signaling server
├── packages/
│   ├── shared-types/    # TypeScript interfaces & constants
│   ├── webrtc-config/   # ICE servers, WebRTC constants
│   └── design-tokens/   # Colors, spacing, typography
├── .github/workflows/   # CI: Audit → Lint ‖ TypeCheck → Tests
├── turbo.json
└── pnpm-workspace.yaml
```

## Getting started

```bash
# Install dependencies
pnpm install

# Start all services in dev mode
pnpm dev

# Or start individually
pnpm dev:server   # http://localhost:3001
pnpm dev:web      # http://localhost:5173
pnpm dev:mobile   # Expo Dev Client

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## Environment variables

Copy `.env.example` to `.env` and fill in TURN credentials if needed:

```bash
cp .env.example .env
```

## License

MIT
