// Prepare you data and load the data again.
// Load the data
//const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, clean data
socialMedia.then(function (data) {
  // group data and calculate averages
  const groupedData = d3.rollup(
    data,
    (posts) => {
      const totalLikes = d3.sum(posts, (d) => parseFloat(d.Likes));
      const count = posts.length;
      return totalLikes / count;
    },
    (d) => d.Platform,
    (d) => d.PostType
  );

  // format
  const transformedData = [];
  groupedData.forEach((platformGroup, platform) => {
    platformGroup.forEach((avgLikes, postType) => {
      transformedData.push({
        Platform: platform,
        PostType: postType,
        AvgLikes: avgLikes.toFixed(2), // Format the average to 2 decimal places
      });
    });
  });

  const socialMediaAvg = d3.csvFormat(transformedData);
  /*console.log(socialMediaAvg);
  const blob = new Blob([socialMediaAvg], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "socialMediaAvg.csv";
  a.click();*/
});

// This data should contains three columns, platform, post type and average number of likes.
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.AvgLikes = +d.AvgLikes;
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
    .style("background", "lightblue");

  // Define four scales
  // Scale x0 is for the platform, which divide the whole scale into 4 parts
  // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
  // Recommend to add more spaces for the y scale for the legend
  // Also need a color scale for the post type

  const x0 = d3
    .scaleBand()
    .domain([...new Set(data.map((d) => d.Platform))])
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const x1 = d3
    .scaleBand()
    .domain([...new Set(data.map((d) => d.PostType))])
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.AvgLikes) + 10])
    .range([height - margin.bottom, margin.top]);

  const color = d3
    .scaleOrdinal()
    .domain([...new Set(data.map((d) => d.PostType))])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

  // Add scales x0 and y
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x0));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Platform");

  // Add y-axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("Average Likes");

  // Group container for bars
  const barGroups = svg
    .selectAll("bar")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${x0(d.Platform)},0)`);

  // Draw bars
  barGroups
    .append("rect")
    .attr("x", (d) => x1(d.PostType))
    .attr("y", (d) => y(d.AvgLikes))
    .attr("width", x1.bandwidth())
    .attr("height", (d) => height - margin.bottom - y(d.AvgLikes))
    .attr("fill", (d) => color(d.PostType));

  // Add the legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${width - 80}, ${margin.top - 40})`);

  const types = [...new Set(data.map((d) => d.PostType))];

  types.forEach((type, i) => {
    // Alread have the text information for the legend.
    // Now add a small square/rect bar next to the text with different color.
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(type));

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", i * 20 + 12)
      .text(type)
      .attr("alignment-baseline", "middle");
  });
});