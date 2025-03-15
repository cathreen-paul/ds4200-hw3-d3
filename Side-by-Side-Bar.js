// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.Likes = +d.Likes;
  });

  // Define the dimensions and margins for the SVG
  let width = 600,
    height = 400;

  let margin = {
    top: 60,
    bottom: 60,
    right: 60,
    left: 60,
  };

  // Create the SVG container

  let svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "lightyellow");

  // Set up scales for x and y axes
  // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
  // d3.min(data, d => d.Likes) to achieve the min value and
  // d3.max(data, d => d.Likes) to achieve the max value
  // For the domain of the xscale, you can list all four platforms or use
  // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform

  d3.min(data, (d) => d.Likes);
  d3.max(data, (d) => d.Likes);

  // Add scales

  let yscale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.Likes), d3.max(data, (d) => d.Likes)])
    .range([height - margin.bottom, margin.top]);

  let xscale = d3
    .scaleBand()
    .domain([...new Set(data.map((d) => d.Platform))])
    .range([margin.left, width - margin.right])
    .padding(0.5);

  let yaxis = svg
    .append("g")
    .call(d3.axisLeft().scale(yscale))
    .attr("transform", `translate(${margin.left},0)`);

  let xaxis = svg
    .append("g")
    .call(d3.axisBottom().scale(xscale))
    .attr("transform", `translate(0, ${height - margin.bottom})`);

  // Add x-axis label

  svg
    .append("text")
    .attr("x", (width - margin.right - margin.left) / 2)
    .attr("y", height - 15)
    .text("Social Media Platform");

  // Add y-axis label

  svg
    .append("text")
    .attr("x", 0 - height / 2)
    .attr("y", 25)
    .text("Likes")
    .attr("transform", "rotate(-90)");

  const rollupFunction = function (groupData) {
    const values = groupData.map((d) => d.Likes).sort(d3.ascending);
    const q1 = d3.quantile(values, 0.25);
    const q3 = d3.quantile(values, 0.75);
    const median = d3.median(values);
    return {
      min: d3.min(values),
      q1: q1,
      q3: q3,
      max: d3.max(values),
      median: median,
    };
  };

  // gets the quartiles for each specific species data
  /* const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.species); */

  // loops through the quartiles calculated for each species and finds where they are on the x-axis of the container + calculates box width
  /* quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth();*/

  const quantilesByGroups = d3.rollup(data, rollupFunction, (d) => d.Platform);

  quantilesByGroups.forEach((quantiles, Platform) => {
    const x = xscale(Platform) + xscale.bandwidth() / 2;
    const boxWidth = xscale.bandwidth();

    const yMin = yscale(quantiles.min);
    const yMax = yscale(quantiles.max);
    const yQ1 = yscale(quantiles.q1);
    const yQ3 = yscale(quantiles.q3);
    const yMedian = yscale(quantiles.median);

    // Draw vertical lines
    svg
      .append("line")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", yMin)
      .attr("y2", yQ1) // Whisker to Q1
      .attr("stroke", "black");

    svg
      .append("line")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", yMax)
      .attr("y2", yQ3) // Whisker to Q3
      .attr("stroke", "black");

    // Draw box
    svg
      .append("rect")
      .attr("x", x - boxWidth / 2)
      .attr("y", yQ3)
      .attr("width", boxWidth)
      .attr("height", yQ1 - yQ3) // Q1 - Q3 defines box height
      .attr("stroke", "black")
      .attr("fill", "lightblue");

    // Draw median line
    svg
      .append("line")
      .attr("x1", x - boxWidth / 2)
      .attr("x2", x + boxWidth / 2)
      .attr("y1", yMedian)
      .attr("y2", yMedian)
      .attr("stroke", "black");
  });
});