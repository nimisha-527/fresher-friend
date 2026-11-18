# Client App

This folder contains the frontend for the project. It is built with Vue, TypeScript, and Vite, and is responsible for rendering the UI and communicating with the backend API.


## Change log

- Updated: `index.html` - Show the info modal while the Vue app is bootstrapping. <Last Updated: 17/11/2026>
- Updated: `src/components/modals/Info.vue` - Styled the text-only info modal with Tailwind classes. <Last Updated: 17/11/2026>
- Updated: `src/App.vue` - Start initial content loading before the app's first render. <Last Updated: 17/11/2026>
- Updated: `src/__tests__/App.spec.ts` - Test the loading modal message and absence of a close button. <Last Updated: 17/11/2026>
- Added: `src/components/Tabs.vue` - Add responsive navigation tabs, the fresherFriend link, and a Saved Roles button with the saved count. <Last Updated: 17/11/2026>
- Updated: `src/components/Portal.vue` - Render the tabs as the portal navigation. <Last Updated: 17/11/2026>
- Added: `src/__tests__/Tabs.spec.ts` - Test navigation labels, destinations, icon, and initial saved count. <Last Updated: 17/11/2026>
- Updated: `src/components/Tabs.vue` - Highlight Saved Roles with the primary color and contrasting text and count when active. <Last Updated: 17/11/2026>
- Updated: `src/__tests__/Tabs.spec.ts` - Verify the Saved Roles active-state colors. <Last Updated: 17/11/2026>
- Added: `src/components/Home.vue` - Add the All Roles home heading, description, search, and sort controls. <Last Updated: 17/11/2026>
- Added: `src/components/SearchInput.vue` - Add a reusable search input with a Lucide search icon. <Last Updated: 17/11/2026>
- Added: `src/components/SortSelector.vue` - Add a reusable selector with the configured sort options. <Last Updated: 17/11/2026>
- Updated: `src/components/Portal.vue` - Render the Home page under the navigation tabs. <Last Updated: 17/11/2026>
- Updated: `src/components/Tabs.vue` - Highlight All Roles while the Home route is active. <Last Updated: 17/11/2026>
- Added: `src/__tests__/Home.spec.ts` - Test home content and search/sort controls. <Last Updated: 17/11/2026>
- Added: `src/router/paths.ts` - Centralize the home and navigation route paths. <Last Updated: 18/11/2026>
- Updated: `src/router/index.ts` - Register the home and existing navigation destinations. <Last Updated: 18/11/2026>
- Updated: `src/App.vue` - Render the active route through RouterView. <Last Updated: 18/11/2026>
- Updated: `src/components/Portal.vue` - Show Home only for the All Roles route. <Last Updated: 18/11/2026>
- Updated: `src/components/Tabs.vue` - Use the shared route paths for navigation links. <Last Updated: 18/11/2026>
- Added: `src/__tests__/Router.spec.ts` - Verify home and navigation routes are registered. <Last Updated: 18/11/2026>
- Updated: `src/__tests__/App.spec.ts` - Normalize modal whitespace when checking the loading message. <Last Updated: 18/11/2026>
- Updated: `src/views/Home.vue` - Keep the Home page in the views directory; `Portal.vue` imports it from there. <Last Updated: 18/11/2026>
- Updated: `src/__tests__/Home.spec.ts` - Import Home from its views directory location. <Last Updated: 18/11/2026>
