---
applyTo: "**/*.{vue,css,scss}"
---

# Color & Styling Guidelines

- Update the code with following color scheme:
- **Primary Background**:	Off-White / Snow	| #FAFAFA	| Main page canvas (softer on eyes than pure #FFFFFF)
- **Card Surface**:	Pure White	| #FFFFFF	Job cards, search bar, filter sidebar (with a 1px solid #E5E7EB border)
- **Primary Text & Headers**:	Rich Charcoal Black	| #111111	| Job titles, company names, navbar, primary typography
- **Secondary Text**:	Slate Gray	| #52525B	| Metadata (posted date, stipend/CTC, brief descriptions)
- **Primary Brand Accent**:	Electric Amber / Gold	| #FACC15	| Primary CTA buttons ("Apply Now"), active filter highlights, logo accent
- **Button Hover State**:	Deeper Marigold	| #EAB308	| Hover state for yellow buttons
- **Subtle Accent Tint**:	Soft Cream Yellow	| #FEF9C3	| Light badge backgrounds (e.g., "Internship" or "Remote" tags with #854D0E text)

# Component Structure and Data Handling
- Portal.vue will be the main component, all the other components will be imported in Portal.vue. The main page will be rendered in Portal.vue.
- Take all the static content from src/mocks/getStaticContent.json. Before updating any data in the code, check if the data is present in the getStaticContent.json file. If yes, then use that data instead of hardcoding it in the code. If data is not present in the getStaticContent.json file, give me the option to choose to hardcode the data or add it to the JSON file.
- Update the code with the above color scheme in all the files under /client.
- Update using tailwind classes for the above color scheme in all the files under /client.
- Use lucide icons for all the icons in the code under /client.
- Front-end should be responsive and mobile-friendly. Use tailwind classes for responsiveness in all the files under /client.
- Front-end tech stack should be Vue 3, TypeScript, Tailwind CSS, and Pinia for state management. Use the latest versions of these libraries.
- To render job details fetch data from src/mocks/allRolesData.json. Use this mock data to fetch the job details and update the code accordingly. Do not hardcode any roles data in the code. Before updating any data in the code, check if the data is present in the allRolesData.json file. If yes, then use that data instead of hardcoding it in the code. If data is not present in the allRolesData.json file, give me the option to choose to hardcode the data or add it to the JSON file.