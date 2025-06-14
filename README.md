# Global Explorely - REST Countries React App

A React-based frontend application that integrates with the REST Countries API to display country information, allowing users to search, filter, and view detailed data.

**Hosted Application**: [Global Explorely](https://global-explorely.onrender.com)

---

## Features
- 🌍 **Browse All Countries**: View a list of all countries with key details (name, population, region, flag).
- 🔍 **Search by Name**: Dynamically search for countries using a search bar.
- 🗺️ **Filter by Region**: Filter countries by region (e.g., Africa, Asia) via a dropdown.
- 📖 **Country Details**: Click on a country to view expanded details (capital, languages, etc.).
- 📱 **Responsive Design**: Optimized for mobile and desktop screens.

## Technologies Used
- **Frontend**: React (Functional Components, React Router)
- **Styling**: Tailwind CSS
- **API**: [REST Countries API](https://restcountries.com)
- **Testing**: Jest, React Testing Library

---

## Setup Instructions

### Prerequisites
- Node.js v16+ and npm install

### Steps
1. **Clone the repository**:
   ```bash
   git clone URL
   cd af-2-anushka9D
   npm start
   ```
**both backend and frontend run concurrently**
**Open [http://localhost:3000](http://localhost:5173/) in your browser.**
   
2.**Run tset cases one by one**:
  ```bash
   npx jest src/__test__/unit_tests/SimpleTypewriter.test.js
   npx jest src/__test__/unit_tests/CountryCard.test.js
   npx jest src/__test__/unit_tests/SearchFilter.test.js

   npx jest src/__test__/integration_tests/Home.test.js
  ```
3.**Run All Unit Tests tset cases**:
  ```bash
   npx jest src/__test__/unit_tests
  ```
3.**Run All Integration Tests tset cases**:
  ```bash
   npx jest src/__test__/integration_tests
  ```
5.**Run All test cases**:
  ```bash
   npm test
  ```

---
## API Integration
### The app uses the following REST Countries API endpoints:
1. GET /all: Fetch all countries for the homepage.
2. GET /name/{name}: Search countries by name (e.g., Canada).
3. GET /region/{region}: Filter countries by region (e.g., Europe).
4. GET /alpha/{code}: Fetch detailed data for a single country (e.g., USA).

---

## Challenges & Solutions
1. Dynamic Search and Filter
   - **Challenge:** Updating the UI in real-time as users type or select filters.
   - **Solution:** Used React’s useState and useEffect hooks to manage state and trigger API calls dynamically.
2. Responsive Design
   - **Challenge:** Ensuring consistent layouts across devices.
   - **Solution:** Leveraged Tailwind CSS’s grid and flex utilities for adaptive styling.
3. Async Data Fetching
   - **Challenge:** Handling API loading and error states.
   - **Solution:** Implemented conditional rendering with loading spinners and error messages.
3. Session Management
   - **Challenge:** Persisting user preferences (e.g., dark mode).
   - **Solution:** Used Cookies to store preferences and React Context for state management.
4. Border Country Links
   - **Challenge:** Fetching border country names from alpha3 codes.
   - **Solution** Batch API request using codes:
     ```
     const borders = await Promise.all(
      country.borders?.map(code => fetch(`/alpha/${code}`)) || []
      );
      ```
5. Finding a Free Hosting Solution
   - **Challenge:** Identifying a reliable free hosting platform that supports React, CI/CD, and environment variables.Ensuring seamless GitHub integration for automated deployments.
   - **Solution:** Researched platforms ([Render](https://render.com/),GitHub Pages) and chose Render for:
   - Zero-config deployment for React apps
   - Free tier with HTTPS and custom domains
   - Built-in GitHub integration for automatic deploys

6. Writing Comprehensive Test Cases
   - **Challenge:** Learning testing frameworks (Jest + React Testing Library) from scratch.
   - **Solution:** Key Test Cases Added,Test Structure
