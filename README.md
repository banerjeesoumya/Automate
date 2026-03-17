# Automate

**Automate** is a powerful, AI-powered workflow automation platform designed for the modern developer. It bridges the gap between complex business logic and cutting-edge AI models, allowing you to build intelligent, multi-step automations with a simple drag-and-drop interface.

## 🚀 Key Features

- **Visual Workflow Editor**: Build complex logic with a intuitive node-based interface. No coding required to start.
- **Multi-AI Integration**: Seamlessly connect with **Gemini**, **Anthropic (Claude)**, and **OpenAI** models in a single workflow.
- **Real-Time Execution**: Trigger workflows instantly via **Webhooks**, **Google Forms**, or manual execution.
- **Rich Notifications**: Keep your team in the loop with notifications delivered straight to **Slack** and **Discord**.
- **Template System**: Jumpstart your automation journey with a growing library of ready-to-use templates.
- **Secure by Design**: Built with enterprise-grade security and privacy in mind.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono
- **Database**: Cloudflare D1 (SQLite)
- **AI SDK**: LangChain.js
- **Authentication**: Custom JWT Implementation

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- Cloudflare Account & Wrangler CLI

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd edge-hrms
    ```

2.  **Install Dependencies**
    ```bash
    cd frontend
    npm install
    cd ../backend
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the `backend` directory:
    ```env
    JWT_SECRET=
    DATABASE_URL=""
    CONNECTION_POOL_URL=""
    ```

    Create a `.env` file in the `frontend` directory:
    ```env
    NEXT_PUBLIC_APP_URL="http://localhost:3000/"
    NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8787/api"
    NEXT_PUBLIC_BACKEND_WS_URL="ws://127.0.0.1:8787/api"
    CONNECTION_POOL_URL=""
    BETTER_AUTH_SECRET=""
    BETTER_AUTH_URL="http://localhost:3000/"
    GITHUB_CLIENT_ID=""
    GITHUB_CLIENT_SECRET=""
    GOOGLE_CLIENT_ID=""
    GOOGLE_CLIENT_SECRET=""
    ```

4.  **Run the Application**
    ```bash
    # Start Backend
    cd backend
    npm run dev

    # Start Frontend
    cd ../frontend
    npm run dev
    ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.