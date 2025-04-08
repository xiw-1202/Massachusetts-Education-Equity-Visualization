document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
            
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
            
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Navigation highlight
  const navLinks = document.querySelectorAll('.nav-links a');
    
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Education Opportunity by Zip Code Visualization
  function createOpportunityViz() {
    // Load the data
    d3.csv("data/massachusetts_education_equity.csv").then(function(data) {
      // Convert string values to numbers
      data.forEach(d => {
        d.median_income = +d.median_income;
        d.white_pct = +d.white_pct;
        d.black_pct = +d.black_pct;
        d.latino_pct = +d.latino_pct;
        d.ap_courses = +d.ap_courses;
        d.teacher_certification = +d.teacher_certification;
        d.college_enrollment = +d.college_enrollment;
        d.mcas_proficiency = +d.mcas_proficiency;
      });

      // Set up the container
      const container = d3.select("#opportunity-viz-container");
      container.html(""); // Clear any existing content

      // Add title and description
      container.append("h3")
        .text("Educational Opportunity and Demographics by District");
      
      container.append("p")
        .text("The chart below shows the relationship between median household income, " +
              "teacher certification rates, and educational outcomes across Massachusetts districts. " +
              "Circle size represents the number of AP courses offered, and color represents the " +
              "percentage of white students in the district.");

      // Set up dimensions
      const margin = {top: 40, right: 30, bottom: 60, left: 80};
      const width = 800 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      // Create SVG
      const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Define scales
      const xScale = d3.scaleLinear()
        .domain([30000, 200000])
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([20, 100])
        .range([height, 0]);

      const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.ap_courses)])
        .range([5, 25]);

      const colorScale = d3.scaleSequential()
        .domain([0, 100])
        .interpolator(d3.interpolateBlues);

      // Create axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .tickFormat(d => `$${d/1000}k`)
          .ticks(5))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Median Household Income");

      svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -height / 2)
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Teacher Certification Rate (%)");

      // Add grid lines
      svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat("")
        )
        .attr("opacity", 0.1);

      svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat("")
        )
        .attr("opacity", 0.1);

      // Create a group for circles and labels
      const points = svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${xScale(d.median_income)},${yScale(d.teacher_certification)})`);

      // Add circles
      points.append("circle")
        .attr("r", d => radiusScale(d.ap_courses))
        .attr("fill", d => colorScale(d.white_pct))
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("stroke-width", 2)
            .attr("opacity", 1);
          
          // Show tooltip
          const tooltip = d3.select("#opportunity-tooltip");
          tooltip.style("display", "block")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .html(`
              <strong>${d.district}</strong><br>
              Median Income: $${d.median_income.toLocaleString()}<br>
              AP Courses: ${d.ap_courses}<br>
              Teacher Certification: ${d.teacher_certification}%<br>
              MCAS Proficiency: ${d.mcas_proficiency}%<br>
              College Enrollment: ${d.college_enrollment}%<br>
              Demographics: ${d.white_pct}% White, ${d.black_pct}% Black, ${d.latino_pct}% Latino
            `);
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("stroke-width", 1)
            .attr("opacity", 0.7);
          
          d3.select("#opportunity-tooltip").style("display", "none");
        });

      // Label only some of the points
      const highlightedDistricts = ["Boston", "Roxbury", "Beacon Hill", "Cambridge", "Springfield", "Lexington"];
      points.filter(d => highlightedDistricts.includes(d.district))
        .append("text")
        .attr("dx", d => radiusScale(d.ap_courses) + 5)
        .attr("dy", 4)
        .attr("font-size", "10px")
        .text(d => d.district);

      // Add a legend for the circle size
      const legendSize = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${height - 120})`);
      
      legendSize.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .text("AP Courses Offered");
      
      const legendSizeValues = [5, 15, 25];
      legendSizeValues.forEach((value, i) => {
        const y = i * 25;
        const coursesValue = Math.round(radiusScale.invert(value));
        
        legendSize.append("circle")
          .attr("cx", 10)
          .attr("cy", y)
          .attr("r", value)
          .attr("fill", "none")
          .attr("stroke", "#333");
        
        legendSize.append("text")
          .attr("x", 25)
          .attr("y", y + 4)
          .attr("font-size", "10px")
          .text(coursesValue);
      });

      // Add a legend for the color scale
      const legendColor = svg.append("g")
        .attr("transform", `translate(20, ${height - 120})`);
      
      legendColor.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .text("White Student %");
      
      const colorSteps = [0, 25, 50, 75, 100];
      const colorWidth = 30;
      
      colorSteps.forEach((step, i) => {
        legendColor.append("rect")
          .attr("x", i * colorWidth)
          .attr("y", 0)
          .attr("width", colorWidth)
          .attr("height", 15)
          .attr("fill", colorScale(step));
        
        legendColor.append("text")
          .attr("x", i * colorWidth + colorWidth / 2)
          .attr("y", 30)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .text(step + "%");
      });

      // Add a tooltip div
      if (!d3.select("#opportunity-tooltip").size()) {
        d3.select("body").append("div")
          .attr("id", "opportunity-tooltip")
          .style("position", "absolute")
          .style("display", "none")
          .style("background", "rgba(255, 255, 255, 0.9)")
          .style("border", "1px solid #ddd")
          .style("border-radius", "4px")
          .style("padding", "10px")
          .style("box-shadow", "2px 2px 6px rgba(0, 0, 0, 0.3)")
          .style("z-index", "100");
      }

      // Add a trend line
      const xValues = data.map(d => d.median_income);
      const yValues = data.map(d => d.teacher_certification);
      
      // Simple linear regression
      const n = xValues.length;
      const xMean = d3.mean(xValues);
      const yMean = d3.mean(yValues);
      
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < n; i++) {
        numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
        denominator += (xValues[i] - xMean) * (xValues[i] - xMean);
      }
      
      const slope = numerator / denominator;
      const intercept = yMean - slope * xMean;
      
      // Calculate trend line points
      const x1 = 30000;
      const y1 = slope * x1 + intercept;
      const x2 = 200000;
      const y2 = slope * x2 + intercept;
      
      // Draw the trend line
      svg.append("line")
        .attr("x1", xScale(x1))
        .attr("y1", yScale(y1))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .attr("stroke", "#d02e2e")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.7);

      // Add note about correlation
      const correlation = calculateCorrelation(xValues, yValues);
      
      svg.append("text")
        .attr("x", width - 20)
        .attr("y", 20)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .text(`Correlation: ${correlation.toFixed(2)}`);

      // Add source note
      svg.append("text")
        .attr("x", width)
        .attr("y", height + 50)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("opacity", 0.7)
        .text("Source: Massachusetts Department of Elementary and Secondary Education (DESE), 2023-2024");
        
      // Add methodology note
      svg.append("text")
        .attr("x", width)
        .attr("y", height + 70)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("opacity", 0.7)
        .text("Data compiled from DESE AP, Teacher, MCAS, and Demographic reports with Census income data");
    }).catch(error => {
      console.error("Error loading data:", error);
      const container = d3.select("#opportunity-viz-container");
      container.html("<p>Error loading visualization data. Please check that the data file is available.</p>");
    });
  }

  // Helper function to calculate correlation coefficient
  function calculateCorrelation(x, y) {
    const n = x.length;
    const xMean = d3.mean(x);
    const yMean = d3.mean(y);
    
    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }
    
    return numerator / Math.sqrt(xDenominator * yDenominator);
  }

  // Massachusetts map visualization
  const width = 1000, height = 700;
  const svg = d3.select("#ma-map");

  const demographicLabels = {
    all: "All Students",
    aa_num: "Black or African American",
    as_num: "Asian",
    lat_num: "Hispanic or Latino",
    whi_num: "White",
    na_num: "American Indian or Alaska Native",
    pi_num: "Native Hawaiian or Pacific Islander",
    mult_num: "Two or More Races"
  };

  function drawLineChart(districtName, valuesOverYears, label) {
    const container = d3.select("#line-chart").html("");
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const years = Object.keys(valuesOverYears).map(y => +y).sort();
    const data = years.map(year => ({ year, value: valuesOverYears[year] }));

    const x = d3.scaleLinear().domain(d3.extent(years)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value || 0)]).nice().range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));
    svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .ticks(years.length)
        .tickFormat(d => `${d}–${d + 1}`)
    );

    svg.append("path")
      .datum(data.filter(d => d.value != null))
      .attr("fill", "none")
      .attr("stroke", "#f7943e")
      .attr("stroke-width", 2.5)
      .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.value)));

    svg.selectAll("circle")
      .data(data.filter(d => d.value != null))
      .join("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.value))
      .attr("r", 4)
      .attr("fill", "#f7943e");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`${label} in ${districtName}`);
  }

  // Load the actual data files
  Promise.all([
    d3.json("data/SCHOOLDISTRICTS_POLY.json"),
    d3.csv("data/Cleaned_Enrollment_Data.csv")
  ]).then(([geoData, csvData]) => {
    // Create projection and path generator
    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    // Set up demographic dropdown options
    const demographicFields = ["all", ...Object.keys(demographicLabels).filter(d => d !== "all")];
    const demographicSelect = d3.select("#demographicSelect");
    demographicFields.forEach(field => {
      const label = demographicLabels[field] || field;
      demographicSelect.append("option").attr("value", field).text(label);
    });

    // Process CSV data into a nested structure for easy access
    const dataMap = {};
    csvData.forEach(d => {
      const year = d.schoolyear.slice(0, 4);
      const code = d.districtid;
      if (!dataMap[year]) dataMap[year] = {};
      if (!dataMap[year][code]) dataMap[year][code] = {};
      demographicFields.forEach(field => {
        const actualField = field === "all" ? "enrolled" : field;
        dataMap[year][code][field] = +d[actualField];
      });
    });

    // Populate district dropdown
    const districtSet = new Set();
    geoData.features.forEach(f => {
      if (f.properties.DISTRICT_N) {
        districtSet.add(f.properties.DISTRICT_N);
      }
    });

    const districtSelect = d3.select("#districtSelect");
    Array.from(districtSet).sort().forEach(d => {
      districtSelect.append("option").attr("value", d).text(d);
    });

    // Function to render the color legend
    function renderLegend(scale, min, max) {
      const canvas = d3.select("#legend").html("").append("canvas")
        .attr("width", 400)
        .attr("height", 40)
        .style("border", "1px solid #000");

      const ctx = canvas.node().getContext("2d");
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = scale(min + (i / 399) * (max - min));
        ctx.fillRect(i, 0, 1, 40);
      }
    }

    // Function to update the map based on selections
    function updateMap() {
      const selectedYear = d3.select("#yearRange").property("value");
      const selectedMetric = d3.select("#demographicSelect").property("value");
      const selectedDistrict = d3.select("#districtSelect").property("value");

      // Get data for the selected year
      const yearData = dataMap[selectedYear] || {};
      let currentData = {};
      for (const [code, values] of Object.entries(yearData)) {
        const value = values[selectedMetric];
        currentData[code] = isNaN(value) ? null : value;
      }

      // Calculate color domain based on data distribution
      const values = Object.values(currentData).filter(v => v != null && !isNaN(v));
      if (values.length === 0) return;

      values.sort((a, b) => a - b);
      const p5 = d3.quantile(values, 0.05);
      const p95 = d3.quantile(values, 0.95);

      const colorScale = d3.scaleSequential()
        .domain([p5, p95])
        .interpolator(d3.interpolateRgbBasis(["#c6dbef", "#f7f7f7", "#fcbba1"]))
        .unknown("#f0f0f0");

      renderLegend(colorScale, p5, p95);

      // Update map with new data
      svg.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("stroke", "#555")
        .attr("stroke-width", 0.7)
        .attr("fill", d => {
          const code = d.properties.ORG8CODE;
          const val = currentData[code];
          if (selectedDistrict !== "all") {
            return d.properties.DISTRICT_N === selectedDistrict ? "#f7943e" : "#eee";
          }
          if (val == null || isNaN(val)) return "#f0f0f0";
          return colorScale(val);
        })
        .on("mouseover", function(event, d) {
          const code = d.properties.ORG8CODE;
          const name = d.properties.DISTRICT_N;
          const val = currentData[code] ?? "No data";
          const label = demographicLabels[selectedMetric] || selectedMetric;
          d3.select(this).attr("stroke-width", 2);
          d3.select("body").append("div")
            .attr("class", "tooltip")
            .html(`<strong>${name}</strong><br>${label}: ${val}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseout", function() {
          d3.select(this).attr("stroke-width", 0.7);
          d3.selectAll(".tooltip").remove();
        })
        .on("click", function(event, d) {
          const districtCode = d.properties.ORG8CODE;
          const districtName = d.properties.DISTRICT_N;
          const selectedMetric = d3.select("#demographicSelect").property("value");
          const label = demographicLabels[selectedMetric] || selectedMetric;
          const valuesOverYears = {};
          for (let y = 2019; y <= 2023; y++) {
            const val = dataMap[y]?.[districtCode]?.[selectedMetric];
            valuesOverYears[y] = isNaN(val) ? null : val;
          }
          drawLineChart(districtName, valuesOverYears, label);
          document.querySelector("#chart-section").scrollIntoView({ behavior: "smooth" });
        });
    }

    // Set up event listeners
    d3.select("#yearRange").on("input", updateMap);
    d3.select("#demographicSelect").on("change", function() {
      updateMap();
      d3.select("#districtSelect").dispatch("change");
    });
    d3.select("#districtSelect").on("change", function() {
      const selectedDistrict = d3.select(this).property("value");
      updateMap();
      
      // If a specific district is selected, update the line chart
      if (selectedDistrict !== "all") {
        const districtCode = geoData.features.find(f => 
          f.properties.DISTRICT_N === selectedDistrict)?.properties.ORG8CODE;
        
        if (districtCode) {
          const selectedMetric = d3.select("#demographicSelect").property("value");
          const label = demographicLabels[selectedMetric] || selectedMetric;
          const valuesOverYears = {};
          for (let y = 2019; y <= 2023; y++) {
            const val = dataMap[y]?.[districtCode]?.[selectedMetric];
            valuesOverYears[y] = isNaN(val) ? null : val;
          }
          drawLineChart(selectedDistrict, valuesOverYears, label);
        }
      } else {
        // Draw statewide average when "All" is selected
        const selectedMetric = d3.select("#demographicSelect").property("value");
        const label = demographicLabels[selectedMetric] || selectedMetric;
        const valuesOverYears = {};
        
        for (let y = 2019; y <= 2023; y++) {
          let totalValue = 0;
          let count = 0;
          
          for (const code in dataMap[y]) {
            const val = dataMap[y][code][selectedMetric];
            if (!isNaN(val) && val != null) {
              totalValue += val;
              count++;
            }
          }
          
          valuesOverYears[y] = count > 0 ? Math.round(totalValue / count) : null;
        }
        
        drawLineChart("All Districts (Average)", valuesOverYears, label);
      }
    });
    
    // Initialize map
    updateMap();
    
    // Draw initial line chart with Boston data (or first available district if Boston isn't available)
    const initialDistrict = geoData.features.find(f => 
      f.properties.DISTRICT_N === "Boston") || geoData.features[0];
    
    if (initialDistrict) {
      const districtCode = initialDistrict.properties.ORG8CODE;
      const districtName = initialDistrict.properties.DISTRICT_N;
      const defaultMetric = "all";
      const label = demographicLabels[defaultMetric] || defaultMetric;
      const valuesOverYears = {};
      
      for (let y = 2019; y <= 2023; y++) {
        const val = dataMap[y]?.[districtCode]?.[defaultMetric];
        valuesOverYears[y] = isNaN(val) ? null : val;
      }
      
      drawLineChart(districtName, valuesOverYears, label);
    }
    
  }).catch(error => {
    console.error("Error loading data:", error);
    document.querySelector("#visualizations").innerHTML += 
      `<div class="error-message" style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <p><strong>Error loading data:</strong> ${error.message}</p>
        <p>Please check that the data files are available in the correct location:</p>
        <ul>
          <li>data/SCHOOLDISTRICTS_POLY.json</li>
          <li>data/Cleaned_Enrollment_Data.csv</li>
        </ul>
      </div>`;
  });
  
  // Add the opportunity viz container to the page if it doesn't exist
  const existingContainer = document.getElementById('opportunity-viz-container');
  if (!existingContainer) {
    const article = document.querySelector('.article');
    const h2 = Array.from(article.querySelectorAll('h2')).find(h => h.textContent.includes('Geographic Determinism'));
    
    if (h2) {
      const vizSection = document.createElement('section');
      vizSection.className = 'visualization';
      vizSection.id = 'opportunity-viz-container';
      
      // Insert after the first paragraph following the h2
      const paragraphAfterH2 = h2.nextElementSibling;
      if (paragraphAfterH2) {
        paragraphAfterH2.parentNode.insertBefore(vizSection, paragraphAfterH2.nextSibling);
      } else {
        h2.parentNode.insertBefore(vizSection, h2.nextSibling);
      }
    }
  }
  
  // Create the opportunity visualization
  createOpportunityViz();
});