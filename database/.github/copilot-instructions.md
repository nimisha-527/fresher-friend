# Prompts to update our repo effectively

## Security Rules
- Never read, open, reference, or output contents from `.env` or `.env.*` files.
- Treat all environment variables as placeholders unless explicitly provided in the prompt.

## Prompt 2:
- Update README.md file under /server after every update. 
- Update the date on which the change has been done.
- If there is old date, do not replace it with new date. Instead, add the new date in the next line with the info on the content changes.
- Update using the following format in the README.md file under /server after every update:
  - Added: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>
  - Updated: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>
  - Removed: <file_name> - <description of the change> <Last Updated: DD/MM/YYYY>