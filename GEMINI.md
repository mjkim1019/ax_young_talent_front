# GEMINI.md

## Project Overview

This is a web application wireframe built with React and Vite. It uses TypeScript and a number of libraries for UI components, including Radix UI, shadcn/ui, and Lucide Icons. The application appears to be a tool for creating and managing prompts, possibly for an AI or large language model. It includes a wizard for creating prompts, a gallery for browsing templates, and a feedback mechanism.

## Building and Running

To get started with this project, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm i
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the development server and open the application in your default browser at http://127.0.0.1:5173.

3.  **Build for production:**
    ```bash
    npm run build
    ```
    This will create a `build` directory with the production-ready files.

4.  **Preview the production build:**
    ```bash
    npm run preview
    ```
    This will start a local server to preview the production build.

## Development Conventions

*   **Component-based architecture:** The application is built with React and follows a component-based architecture. Components are located in the `src/components` directory.
*   **Styling:** The project uses CSS and `tailwind-merge` for styling. Global styles are in `src/index.css` and `src/styles/globals.css`.
*   **State Management:** The main application state is managed in the `App.tsx` component using the `useState` hook.
*   **Routing:** The application uses a simple state-based routing system within the `App.tsx` component to switch between different views.
*   **UI Components:** The project uses a combination of custom UI components and components from the `shadcn/ui` library, which are located in `src/components/ui`.
*   **Vite Configuration:** The `vite.config.ts` file contains the build and development server configuration, including aliases for commonly used packages and manual chunking for vendor libraries.
