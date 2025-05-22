# Massachusetts Education Equity Visualization

## Overview

This project visualizes educational inequity across Massachusetts using official data from the Department of Elementary and Secondary Education (DESE). The interactive visualizations explore the relationship between geographic location, demographics, income levels, and educational resources/outcomes.

The primary goal is to demonstrate how a student's ZIP code significantly influences their educational opportunities and outcomes in Massachusetts public schools, highlighting the systemic disparities that exist between districts.

## Deployment

https://xiw-1202.github.io/Massachusetts-Education-Equity-Visualization/

## Features

- **Interactive Map Visualization**: Explore demographic changes across Massachusetts school districts from 2019-2024
- **Educational Opportunity Visualization**: Analyze the relationship between median household income, teacher certification rates, and academic outcomes
- **Data-Driven Analysis**: Built on official Massachusetts DESE datasets for authentic, accurate insights
- **Responsive Design**: Works on desktop and mobile devices

## Data Sources

This project uses official data from:

- Massachusetts Department of Elementary and Secondary Education (2023-2024):
  - Advanced Placement Participation Reports
  - Teacher Salaries Reports
  - MCAS Achievement Results
  - Enrollment by Race/Gender Reports
  - Graduates Attending Higher Education Reports
- U.S. Census Bureau (2023):
  - American Community Survey 5-Year Estimates for median household income data

Full citations are available in the "About" section of the application.

## Installation and Setup

1. **Clone the repository**

   ```
   git clone https://github.com/xiw-1202/CS541_Team_Project.git
   cd CS541_Team_Project
   ```

2. **Set up a local server**
   Due to browser security restrictions, you'll need to serve the files from a local web server. Options include:

   - Using Python's built-in server:

     ```
     # Python 3
     python -m http.server 8000
     ```

   - Using Node.js with a package like `http-server`:
     ```
     npm install -g http-server
     http-server
     ```

3. **Open in browser**
   Navigate to `http://localhost:8000` (or the port your server is using)

## Project Structure

```
massachusetts-education-equity/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # CSS styles
├── js/
│   └── mass-viz.js         # Main visualization JavaScript
├── data/
│   ├── SCHOOLDISTRICTS_POLY.json        # GeoJSON for Massachusetts districts
│   ├── Cleaned_Enrollment_Data.csv      # Enrollment data 2019-2024
│   ├── massachusetts_education_equity.csv  # Combined DESE datasets
└── README.md               # Project documentation
```

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for loading D3.js library)

## Technologies Used

- **D3.js** - Data visualization library
- **HTML5/CSS3** - Structure and styling
- **JavaScript** - Interactive functionality
- **Python** - Data processing scripts

## Data Visualizations

The project includes two main visualizations:

1. **Massachusetts K-12 Demographics**: An interactive map showing demographic changes across Massachusetts school districts from 2019-2024, with the ability to filter by district and demographic group.

2. **Educational Opportunity by District**: A scatter plot visualization showing the relationship between median household income, teacher certification rates, and educational outcomes. The visualization uses:
   - X-axis: Median household income
   - Y-axis: Teacher certification rate
   - Circle size: Number of AP courses offered
   - Circle color: Percentage of white students
   - Trend line: Correlation between income and teacher quality

Each data point is interactive(will fix bugs in the next milestone), showing detailed statistics on hover.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Massachusetts Department of Elementary and Secondary Education for providing the data
- U.S. Census Bureau for demographic and income data
- D3.js community for visualization libraries and examples

---

_This project was created to highlight educational inequity in Massachusetts and advocate for more equitable distribution of resources across school districts._
