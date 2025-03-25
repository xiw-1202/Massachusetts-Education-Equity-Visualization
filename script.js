document.addEventListener('DOMContentLoaded', function () {
  // Navigation highlight
  const navLinks = document.querySelectorAll('.nav-links a');
    
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
    
  // Tab system for data visualizations
  const tabs = document.querySelectorAll('.tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
    
  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
            
      // Show corresponding content
      const tabId = this.getAttribute('data-tab');
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
      });
      document.getElementById(`${tabId}-content`).classList.add('active');
            
      // Initialize specific visualizations based on the active tab
      if (tabId === 'demographics') {
        initDemographicsChart();
      } else if (tabId === 'resources') {
        initResourcesMap();
      } else if (tabId === 'retention') {
        initRetentionChart();
      }
    });
  });
    
  // Initialize the default tab visualization
  initDemographicsChart();
    
  // Mock data for Boston neighborhoods
  const zipCodeData = [
    {
      name: "South End",
      code: "02118",
      resources: 85,
      demographics: { white: 45, black: 15, latino: 25, asian: 10, multiracial: 5 }
    },
    {
      name: "Roxbury",
      code: "02119",
      resources: 45,
      demographics: { white: 10, black: 55, latino: 30, asian: 2, multiracial: 3 }
    },
    {
      name: "Dorchester",
      code: "02125",
      resources: 55,
      demographics: { white: 20, black: 45, latino: 25, asian: 5, multiracial: 5 }
    },
    {
      name: "East Boston",
      code: "02128",
      resources: 60,
      demographics: { white: 30, black: 5, latino: 60, asian: 3, multiracial: 2 }
    },
    {
      name: "Beacon Hill",
      code: "02108",
      resources: 95,
      demographics: { white: 75, black: 5, latino: 10, asian: 8, multiracial: 2 }
    }
  ];
    
  // Demographic data for charts
  const demographicData = [
    {
      year: "2019-20",
      white: 8.9,
      black: 51.3,
      latino: 34.7,
      asian: 2.2,
      multiracial: 2.5,
      totalEnrollment: 54934
    },
    {
      year: "2020-21",
      white: 8.6,
      black: 51.0,
      latino: 35.4,
      asian: 2.0,
      multiracial: 2.5,
      totalEnrollment: 52614
    },
    {
      year: "2021-22",
      white: 8.6,
      black: 50.0,
      latino: 36.1,
      asian: 2.3,
      multiracial: 2.5,
      totalEnrollment: 50593
    },
    {
      year: "2022-23",
      white: 8.4,
      black: 49.3,
      latino: 36.6,
      asian: 2.3,
      multiracial: 2.8,
      totalEnrollment: 50237
    },
    {
      year: "2023-24",
      white: 8.5,
      black: 48.8,
      latino: 37.1,
      asian: 2.0,
      multiracial: 3.1,
      totalEnrollment: 49905
    }
  ];
    
  // Demographics chart initialization function
  function initDemographicsChart() {
    const demographicsChart = document.getElementById('demographics-chart');
    if (!demographicsChart) return;
        
    // In a real implementation, we would use D3.js or Chart.js
    // For this demo, we'll create a static SVG representation
        
    const width = 800;
    const height = 400;
    const padding = 50;
    const years = demographicData.map(d => d.year);
        
    // Calculate positions
    const xScale = (width - padding * 2) / (years.length - 1);
    const yMax = 60; // Max percentage
    const yScale = (height - padding * 2) / yMax;
        
    // Generate SVG
    let svg = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
                <!-- X and Y axes -->
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="black" stroke-width="2" />
                <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="black" stroke-width="2" />
                
                <!-- Y axis labels (percentages) -->
                ${[0, 10, 20, 30, 40, 50, 60].map(tick =>
      `<text x="${padding - 10}" y="${height - padding - (tick * yScale)}" text-anchor="end" font-size="12">${tick}%</text>`
    ).join('')}
                
                <!-- X axis labels (years) -->
                ${years.map((year, i) =>
      `<text x="${padding + (i * xScale)}" y="${height - padding + 20}" text-anchor="middle" font-size="12">${year}</text>`
    ).join('')}
                
                <!-- Title -->
                <text x="${width / 2}" y="${padding / 2}" text-anchor="middle" font-size="16" font-weight="bold">Demographic Trends in Boston Schools (2019-2024)</text>
        `;
        
    // Colors for each demographic group
    const colors = {
      white: "#8884d8",
      black: "#82ca9d",
      latino: "#ffc658",
      asian: "#ff8042",
      multiracial: "#0088FE"
    };
        
    // Create lines for each demographic trend
    Object.entries(colors).forEach(([demo, color]) => {
      // Create points for the line
      const points = demographicData.map((d, i) =>
        `${padding + (i * xScale)},${height - padding - (d[demo] * yScale)}`
      ).join(' ');
            
      // Add the line
      svg += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" />`;
            
      // Add dots at each data point
      demographicData.forEach((d, i) => {
        svg += `<circle cx="${padding + (i * xScale)}" cy="${height - padding - (d[demo] * yScale)}" r="5" fill="${color}" />`;
      });
            
      // Add legend item
      const legendY = 80 + Object.keys(colors).indexOf(demo) * 25;
      svg += `
                <circle cx="${width - padding - 100}" cy="${legendY}" r="6" fill="${color}" />
                <text x="${width - padding - 80}" y="${legendY + 5}" font-size="14">${demo.charAt(0).toUpperCase() + demo.slice(1)}</text>
            `;
    });
        
    svg += '</svg>';
    demographicsChart.innerHTML = svg;
  }
    
  // Resources map initialization function
  function initResourcesMap() {
    const mapElement = document.getElementById('resources-map');
    const zipDetailsElement = document.getElementById('zip-details');
    if (!mapElement || !zipDetailsElement) return;
    
    // Create simple interactive SVG map visualization
    // Create circles for each neighborhood on the map
    let svgContent = `
            <svg viewBox="0 0 500 400" width="100%" height="100%">
                <path d="M50,150 C100,120 200,100 300,150 C350,180 380,220 350,250 C300,280 200,270 100,250 C50,240 30,200 50,150 Z" 
                      fill="#e5e7eb" stroke="#333" stroke-width="2"/>
        `;
        
    // Add circles for each zip code
    zipCodeData.forEach((zip, index) => {
      const xPos = 100 + (index * 70);
      const yPos = 150 + (index % 3 * 40);
            
      svgContent += `
                <circle 
                    cx="${xPos}" 
                    cy="${yPos}" 
                    r="25" 
                    fill="#93c5fd"
                    stroke="#1e40af"
                    stroke-width="2"
                    data-zip="${zip.code}"
                    class="zip-circle"
                />
                <text 
                    x="${xPos}" 
                    y="${yPos + 5}" 
                    text-anchor="middle" 
                    fill="black" 
                    font-size="12px" 
                    font-weight="bold"
                >
                    ${zip.name}
                </text>
            `;
    });
        
    svgContent += '</svg>';
    mapElement.innerHTML = svgContent;
        
    // Add click events to the circles after the SVG is in the DOM
    const circles = mapElement.querySelectorAll('.zip-circle');
    circles.forEach(circle => {
      circle.addEventListener('click', function () {
        const zipCode = this.getAttribute('data-zip');
        const zipData = zipCodeData.find(z => z.code === zipCode);
                
        // Update circle appearance
        circles.forEach(c => c.setAttribute('fill', '#93c5fd'));
        this.setAttribute('fill', '#3b82f6');
                
        // Update details section
        if (zipData) {
          zipDetailsElement.innerHTML = `
                        <h4>${zipData.name} (${zipData.code})</h4>
                        <p><strong>Resource Level:</strong> ${zipData.resources}%</p>
                        <p><strong>Demographics:</strong></p>
                        <ul>
                            <li>White: ${zipData.demographics.white}%</li>
                            <li>Black: ${zipData.demographics.black}%</li>
                            <li>Latino: ${zipData.demographics.latino}%</li>
                            <li>Asian: ${zipData.demographics.asian}%</li>
                            <li>Multiracial: ${zipData.demographics.multiracial}%</li>
                        </ul>
                        <p class="mt-2">
                            ${zipData.resources > 80
              ? 'High resource allocation with well-funded programs and infrastructure.'
              : zipData.resources > 60
                ? 'Moderate resource allocation with some funding gaps.'
                : 'Low resource allocation with significant funding and infrastructure gaps.'}
                        </p>
                    `;
        }
      });
    });
        
    // Trigger click on first circle by default if circles exist
    if (circles.length > 0) {
      circles[0].dispatchEvent(new Event('click'));
    }
  }
    
  // Retention chart initialization function
  function initRetentionChart() {
    const retentionChart = document.getElementById('retention-chart');
    if (!retentionChart) return;
        
    // Mock retention data
    const retentionData = [
      { group: "White Students", from9to10: 98, from10to11: 96, from11to12: 95, completion: 92 },
      { group: "Black Students", from9to10: 87, from10to11: 85, from11to12: 82, completion: 79 },
      { group: "Latino Students", from9to10: 88, from10to11: 84, from11to12: 80, completion: 77 },
      { group: "Asian Students", from9to10: 97, from10to11: 96, from11to12: 95, completion: 94 },
      { group: "Overall", from9to10: 92, from10to11: 90, from11to12: 88, completion: 85 }
    ];
        
    const width = 800;
    const height = 400;
    const padding = 60;
    const barWidth = (width - padding * 2) / (retentionData.length * 4 + (retentionData.length - 1)) * 0.8;
    const barSpacing = barWidth * 0.25;
    const groupSpacing = barWidth * 2;
        
    // Colors for each stage
    const stageColors = {
      from9to10: "#8884d8",
      from10to11: "#82ca9d",
      from11to12: "#ffc658",
      completion: "#ff8042"
    };
        
    // Labels for each stage
    const stageLabels = {
      from9to10: "9th→10th",
      from10to11: "10th→11th",
      from11to12: "11th→12th",
      completion: "Completion"
    };
        
    // Generate SVG
    let svg = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
                <!-- X and Y axes -->
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="black" stroke-width="2" />
                <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="black" stroke-width="2" />
                
                <!-- Y axis labels (percentages) -->
                ${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(tick =>
      `<text x="${padding - 10}" y="${height - padding - (tick * (height - padding * 2) / 100)}" text-anchor="end" font-size="12">${tick}%</text>`
    ).join('')}
                
                <!-- Title -->
                <text x="${width / 2}" y="${padding / 2}" text-anchor="middle" font-size="16" font-weight="bold">High School Retention Rates by Demographic Group</text>
        `;
        
    // Create bars for each group and stage
    retentionData.forEach((group, groupIndex) => {
      // Group label
      const groupX = padding + groupIndex * (4 * barWidth + groupSpacing + 3 * barSpacing) + 2 * barWidth;
      svg += `<text x="${groupX}" y="${height - padding + 30}" text-anchor="middle" font-size="12">${group.group}</text>`;
            
      // Bars for each stage in this group
      Object.entries(stageColors).forEach(([stage, color], stageIndex) => {
        const value = group[stage];
        const barHeight = value * (height - padding * 2) / 100;
        const barX = padding + groupIndex * (4 * barWidth + groupSpacing + 3 * barSpacing) + stageIndex * (barWidth + barSpacing);
        const barY = height - padding - barHeight;
                
        // Add bar
        svg += `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" fill="${color}" />`;
                
        // Add value label on top of bar
        svg += `<text x="${barX + barWidth / 2}" y="${barY - 5}" text-anchor="middle" font-size="12">${value}%</text>`;
      });
    });
        
    // Add legend
    Object.entries(stageColors).forEach(([stage, color], i) => {
      const legendY = 80 + i * 25;
      svg += `
                <rect x="${width - padding - 100}" y="${legendY - 10}" width="15" height="15" fill="${color}" />
                <text x="${width - padding - 80}" y="${legendY}" font-size="14">${stageLabels[stage]}</text>
            `;
    });
        
    svg += '</svg>';
    retentionChart.innerHTML = svg;
  }
    
  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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
    
  // Add year selector functionality if it exists
  const yearSelector = document.getElementById('year-selector');
  if (yearSelector) {
    yearSelector.addEventListener('change', function () {
      const selectedYear = this.value;
      // Update visualizations based on selected year
      console.log(`Year selected: ${selectedYear}`);
            
      // Actually update the visualizations based on the selected year
      // This is just a placeholder implementation - in a real app you would filter data
      // based on the selected year before reinitializing charts
            
      // Re-initialize charts with filtered data
      if (document.querySelector('.tab[data-tab="demographics"].active')) {
        initDemographicsChart();
      } else if (document.querySelector('.tab[data-tab="resources"].active')) {
        initResourcesMap();
      } else if (document.querySelector('.tab[data-tab="retention"].active')) {
        initRetentionChart();
      }
    });
  }

});