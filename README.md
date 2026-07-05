# 💰 Personal Finance Hub

A responsive, client-side financial tracking dashboard that empowers users to monitor their live income, expenses, and net balance distributions. This project was built entirely with vanilla web technologies, focusing on clean DOM architecture and bulletproof data persistence.

![Project Preview](https://placeholder.com)

## 🚀 Key Features

*   **Responsive Dual-Pane UI**: Crafted using a mobile-first approach with CSS Grid and Flexbox for seamless cross-device layouts.
*   **State-Driven Calculations**: Real-time evaluation of net balance states formatted safely using custom logic limits.
*   **Advanced Data Filtering**: Dynamic ledger sorting by category tags utilizing highly optimized array filter loops.
*   **Input Sanitization Guardrails**: Custom multi-layered client-side verification to protect layouts from long character strings and block negative numeric inputs.
*   **Browser-Level Persistence**: Fully integrated with browser `localStorage` to ensure financial ledgers persist across manual page refreshes.

## 🛠️ Technical Stack Used

*   **Semantic HTML5**: For standard web layout accessibility.
*   **Modern CSS3**: Powered by custom layout variables and media queries.
*   **Vanilla JavaScript (ES6+)**: Developed without heavy framework abstractions to master core browser languages.

## 🧠 Architectural Insights (What I Learned)

### 1. High-Performance Event Delegation
Instead of binding separate event click tracking hooks to dozens of dynamically generated ledger rows, I implemented **Event Delegation** on parent node containers. By leveraging `.closest()`, the application catches bubbling click records cleanly, preventing memory leaks and optimization blockages as data sizes expand.

### 2. Client-Side Data Modeling
This project served as an introduction to basic software state management. Data inputs are sanitized, mapped cleanly into an internal array database of objects, and run through custom `.filter()` and `.forEach()` methods before updating the visible window elements.

## 💻 How to Run the Project Locally

1. Clone the repository to your computer:
   ```bash
   git clone https://github.com
   ```
2. Navigate into the project folder:
   ```bash
   cd personal-finance-hub
   ```
3. Open `index.html` directly inside your web browser or use a code editor live server extension.
