# Waldo Backend

Express.js REST API for the Waldo photo tagging game.

## Related Projects
- **Frontend**: [waldo-frontend](https://github.com/mehrdad2929/waldo-frontend)
- **Frontend App**: https://waldo-frontend-phi.vercel.app

## Getting Started

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/signup | Register new user |
| POST | /api/login | Login user |
| GET | /auth/google | Google OAuth login |
| GET | /auth/github | GitHub OAuth login |
| GET | /auth/check | Verify token |

### Game
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/profile | Get user profile |
| PUT | /api/score/:levelId | Submit score |
| GET | /api/leaderboard/:levelId | Get leaderboard |
| GET | /api/my-scores | Get user's scores |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |

## Environment Variables

See `.env.example` for required variables.
