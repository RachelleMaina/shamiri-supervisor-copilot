# Shamiri Supervisor Copilot

A web-based dashboard where a Supervisor can log in, view a list of therapy sessions conducted by Fellows assigned to them, and view an AI-generated session analysis of those 1 hour long sessions.


## Overview

The Shamiri Supervisor Copilot allows a Supervisor to:

* Log in securely
* View sessions conducted by Fellows assigned to them
* Open a session and view an AI-generated Session Insight Card/Generate an AI Insight of the session
* Validate or reject the AI’s risk assessment
* Automatically escalate high-risk sessions for expert review

## Technical Stack

* **Framework:** Next.js
* **Language:** TypeScript
* **Database:** PostgreSQL
* **Hosting:** Vercel for Frontend, Railway for PostgreSQL
* **Styling:** Tailwind CSS
* **Data Fetching / State Management:** TanStack Query (React Query)
* **LLM:** OpenAI


## AI Usage

During the development of the Shamiri Supervisor Copilot, I intentionally used AI as an **assistant** rather than a replacement. My process was structured in stages:

1. **System Design First**

   * I carefully read the assignment requirements and sketched a full system design on paper.
   * This included database schema planning (tables, fields, relations) and outlining backend endpoints.
   * The design allowed me to have a clear blueprint before touching any code.

2. **Backend Implementation**

   * After defining the tables, endpoints, and required tools (PostgreSQL, bcrypt, JSON Web Tokens), I used ChatGPT to **scaffold table schemas, backend routes, and seed data**.
   * Importantly, all scaffolding was based on **my pre-defined designs**. I verified the generated code and adapted it as necessary to maintain type safety and follow the assignment’s requirements.

3. **Frontend Implementation**

   * I sketched UI components, layout, and interaction flows on paper before coding.
   * I wrote most of the React/Next.js components myself, relying minimally on Copilot for repetitive snippets.
   * ChatGPT was used selectively to scaffold API hooks, **only after I explicitly instructed what I needed**. This helped speed up integration without compromising the custom UX or functionality.
   * Because frontend behavior is non-deterministic, AI assistance was mostly supportive rather than generative — ensuring the final components matched the planned design.


## Deployment

The application is publicly deployed at:

[Your Deployment URL Here]


## Local Development

```
git clone <repo-url>
cd shamiri-supervisor-copilot
npm install
npm run dev
```

Ensure you have:

* PostgreSQL running
* Environment variables configured:

  * DATABASE_URL
  * JWT_SECRET
  * OPENAI_API_KEY

