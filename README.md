# Mock CEO Daily Briefing Dashboard

An AI-powered morning briefing dashboard built for **Aonic** — synthesizing sales, inventory, and customer support data into actionable executive insights.

Image of the web UI:

<img width="3024" height="3952" alt="image" src="https://github.com/user-attachments/assets/e0694900-90ea-42cf-8f86-5d7f8007d282" />

## What It Does

Every morning, the system analyzes three data sources and generates:

- **Key metrics** — weekly revenue, daily revenue, open tickets, AOV
- **Problems requiring attention** — spikes in complaints, quality escalations, unresolved high-priority tickets
- **Inventory risks** — projected stockouts with days-until-runout
- **Revenue trends** — 6-week chart with week-over-week change
- **Suggested actions** — prioritized recommendations with owners

### Example Output

> Inventory of Aonic Daily Greens may run out in 9 days.  
> Customer complaints increased 17% this week.  
> Revenue grew 12% week-over-week.

## Quick Start

Download the code
Open a terminal and use ```cd ceo-daily-briefing``` to go to the folder
Run the following in the terminal:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── data/                    # Mock data (sales, inventory, support tickets)
├── lib/
│   ├── briefing-engine.ts   # Analytics + AI-style insight generation
│   └── types.ts
├── app/api/briefing/        # REST endpoint for daily briefing
└── components/              # Dashboard UI
```

### Data Inputs

| Source | File | Fields |
|--------|------|--------|
| Sales | `sales.json` | date, product, units, revenue, channel |
| Inventory | `inventory.json` | SKU, units on hand, reorder point, lead time, velocity |
| Support | `support-tickets.json` | category, priority, status, subject |

### Briefing Engine

The `generateDailyBriefing()` function in `briefing-engine.ts`:

1. Computes week-over-week revenue and ticket volume changes
2. Projects inventory runway (days until stockout)
3. Flags critical attention items based on thresholds
4. Generates prioritized suggested actions with rationale

In production, this engine would run on a cron schedule (e.g. 7:00 AM PT) and optionally call an LLM to enrich narrative summaries.

## Production Extensions

- Connect real data via Shopify, warehouse WMS, and Zendesk APIs
- Add OpenAI/Anthropic for natural-language executive summaries
- Schedule daily generation with Vercel Cron or AWS EventBridge
- Email/Slack delivery to leadership team
- Historical briefing archive
