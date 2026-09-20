# 💰 Personal Finance Hub (React Edition)

A responsive, component-driven personal finance dashboard built with React and Vite. This application empowers users to track income and expenses in real-time, view category-based analytics via interactive charts, and maintain persistent state across browser sessions.

Originally developed in vanilla JavaScript, this project was refactored into modern React to master component architecture, state management, custom design systems, and client-side data visualization.

![Project Preview](https://placeholder.com)

## 🚀 Key Features

*   **Modular Component Architecture**: Built using decoupled React components (`SummaryCard`, `TransactionForm`, `TransactionList`, `TransactionItem`, `ExpenseChart`) for clean separation of concerns.
*   **State-Driven Dynamic Metrics**: Uses React `useState` and derived state to calculate live income, expense, and net balance metrics without mutating underlying data.
*   **Visual Data Analytics**: Integrated interactive doughnut charts powered by `Chart.js` and `react-chartjs-2` to visualize expense breakdowns by category automatically.
*   **Derived Category Filtering**: Real-time transaction filtering by custom category tags (`Salary`, `Food`, `Utilities`, `Entertainment`, `Other`) using non-destructive array filtering.
*   **Interactive Design System**: Custom CSS variables, Flexbox/Grid layouts, accessible badges, and tactile hover/active micro-interactions.
*   **Responsive Mobile-First UI**: Built using custom `@media` queries and fluid grid columns to ensure seamless usability across desktop and mobile viewports.
*   **Persistent Local Storage**: Fully integrated using React `useEffect` and initializer functions to automatically sync transactions with browser `localStorage`.

## 🛠️ Technical Stack Used

*   **React 18+**: Functional components, controlled form inputs, custom props, and state hooks (`useState`, `useEffect`).
*   **Vite**: Next-generation frontend tooling for rapid local development and optimized build bundling.
*   **Chart.js & react-chartjs-2**: HTML5 Canvas-based chart rendering for client-side financial analytics.
*   **CSS3**: Custom CSS design tokens (variables), Flexbox, CSS Grid, media queries, and dynamic interactive state classes.

## 🧠 Architectural Insights (What I Learned)

### 1. Lifting State Up & Controlled Components
Rather than reading raw values directly from DOM nodes, form inputs are completely bound to React state as **controlled components**. State lives in the top-level `<App />` component ("Lifting State Up"), allowing child components (`SummaryCard`, `TransactionList`, `ExpenseChart`) to stay synchronized whenever transactions are added or removed.

### 2. Derived State vs. State Mutation
Instead of maintaining separate state arrays for filtered categories or running financial totals, these values are computed on the fly (**derived state**) during render passes. This guarantees data integrity, prevents out-of-sync bugs, and allows instant filter toggling without losing historical data.

### 3. Side Effect Synchronization with `useEffect`
Learned how to properly handle browser side effects by coupling `localStorage` synchronization with React's lifecycle using `useEffect`. The initial state uses a lazy initializer function to load saved items once during mounting, preventing unnecessary disk reads on subsequent re-renders.

## 💻 How to Run the Project Locally

1. Clone the repository to your computer:
   ```bash
   git clone [https://github.com/your-username/personal-finance-hub.git](https://github.com/your-username/personal-finance-hub.git)

2. Navigate into project folder:
   ```bash
   cd personal-finance-hub/my-finance-app

3. Install dependencies:
   ```bash
   npm install

4. Start the Vite development server:
   ```bash
   npm run dev
