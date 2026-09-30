# Commission Calculator

A robust, client-side React application for calculating sales employee commission achievements. This internal tool calculates commission achievement percentages and weighted contributions strictly following standard proportional linear rules.

## Features

* **Real-time Calculation**: Automatically calculates achievement and contribution as you type.
* **Pure Linear Business Rules**: Proportional calculations without tiers, caps, or hidden multipliers.
* **Component-Based Weights**: Voice, Enterprise, Terminal, and Fixed components weighted correctly.
* **Data Privacy**: Operates entirely locally in the browser with no external API calls, tracking, or persistence.
* **Accessible and Responsive**: Built to be robust and fully usable on both desktop and mobile devices.

## Tech Stack

* React 19
* TypeScript (Strict)
* Vite
* Tailwind CSS v4
* Vitest (Unit Testing)
* Lucide React (Icons)

## Business Rules & Weights

The total commission weight is 100%, divided into four main categories:

1. **Voice** — 60%
2. **Enterprise** — 10%
   * Accounts — 5%
   * Lines — 5%
3. **Terminal** — 10%
4. **Fixed** — 20%
   * DSL — 16%
   * Connectivity — 4%

### Calculation Formula

For each component, the calculation strictly follows:
* **Achievement %** = (Actual / Target) × 100
* **Contribution %** = Achievement % × Component Weight

**Over-achievement**: Allowed. No artificial cap is applied.
**Zero Targets**: Safely handled. Invalid targets or values below zero mark the calculation as incomplete to prevent mathematical errors.

## Project Structure

* `src/features/commission/` — Contains pure TypeScript calculation engine, types, validation, and constants. 
* `src/components/` — React UI components (Dashboard and Component Boxes) decoupled from complex logic.
* `src/App.tsx` — Main application entry.

## Installation & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run local dev server:**
   ```bash
   npm run dev
   ```

3. **Run unit tests:**
   ```bash
   npm run test
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment

This project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment to GitHub Pages.

To deploy:
1. Push this repository to GitHub on the `main` branch.
2. In the repository settings, go to **Pages**.
3. Under **Build and deployment**, set the **Source** to **GitHub Actions**.
4. The workflow will automatically test, build, and deploy the application to your GitHub Pages URL.

*(Note: The Vite configuration is already setup with `base: './'` to support GitHub Pages sub-path deployments).*
