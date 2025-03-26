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
    d3.select("#demographicSelect").on("change", updateMap);
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
});