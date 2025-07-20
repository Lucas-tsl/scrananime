# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
This is a Node.js web application for scraping and displaying anime scans. The project uses:

- **Backend**: Express.js server
- **Scraping**: Cheerio for HTML parsing and Puppeteer for dynamic content
- **Frontend**: Vanilla HTML/CSS/JavaScript with modern design
- **Security**: Helmet for security headers, CORS for cross-origin requests

## Coding Guidelines
- Use modern JavaScript (ES6+) features
- Follow RESTful API conventions for endpoints
- Implement proper error handling and logging
- Add rate limiting for scraping operations
- Use async/await for asynchronous operations
- Comment complex scraping logic clearly
- Ensure responsive design for the frontend

## Key Features
- Scrape anime scan websites for latest chapters
- Display scans in a user-friendly gallery format
- Search and filter functionality
- Responsive web design
- Error handling for failed scraping attempts

## Security Considerations
- Never expose API keys or sensitive data
- Implement rate limiting to avoid overwhelming target sites
- Validate and sanitize all user inputs
- Use HTTPS in production
- Respect robots.txt and website terms of service
