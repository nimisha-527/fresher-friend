---
name: readme-rules
description: Updates client, server, or database README.md files with a new dated changelog entry matching existing formatting.
disable-model-invocation: true
---

# Task
Update the appropriate README file (`client/README.md`, `server/README.md`, or `database/README.md`) based on the user's message or recent workspace changes.

# Rules

- Follow the existing format for all entries. For any update in /client, add a new entry in the README.md file under /client with the following format:
  - Added: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>
  - Updated: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>
  - Removed: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>

- For any update in /server, add a new entry in the README.md file under /server with the following format:
  - Added: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>
  - Updated: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>
  - Removed: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>

- For any update under /database, add a new entry in the README.md file under /database with the following format:
  - Added: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>
  - Updated: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>
  - Removed: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>

- Update the date on which the change has been done.
- If there is old date, do not replace it with new date. Instead, add the new date in the next line with the info on the content changes.