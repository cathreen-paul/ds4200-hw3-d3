// Prepare you data and load the data again.
socialMedia.then(function (data) {
    // group data and calculate averages
    const groupedData = d3.rollup(
      data,
      (posts) => {
        const totalLikes = d3.sum(posts, (d) => parseFloat(d.Likes));
        const count = posts.length;
        return totalLikes / count;
      },
      (d) => d.Date
    );
  
    console.log(groupedData);
  
    // format
    const transformedData = Array.from(groupedData, ([date, avgLikes]) => ({
      Date: date,
      AvgLikes: avgLikes,
    }));
  
    transformedData.sort((a, b) => a.Date - b.Date);
  
    const socialMediaTime = d3.csvFormat(transformedData);
    console.log(socialMediaTime);
  
    /*const blob = new Blob([socialMediaTime], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "socialMediaTime.csv";
    a.click();*/
  });
  
  // This data should contains two columns, date (3/1-3/7) and average number of likes.
  const socialMediaTime = d3.csv("socialMediaTime.csv");
  
  socialMediaTime.then(function (data) {
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
      .style("background", "lightgreen");
  
    // Set up scales for x and y axes
    let yscale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.AvgLikes)])
      .range([height - margin.bottom, margin.top]);
  
    let xscale = d3
      .scaleBand()
      .domain(data.map((d) => d.Date))
      .range([margin.left, width - margin.right])
      .padding(0.5);
  
    // Draw the axis, you can rotate the text in the x-axis here
    let yaxis = svg
      .append("g")
      .call(d3.axisLeft().scale(yscale))
      .attr("transform", `translate(${margin.left},0)`);
  
    let xaxis = svg
      .append("g")
      .call(d3.axisBottom().scale(xscale))
      .attr("transform", `translate(0,${height - margin.bottom})`);
  
    // Add x-axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Date");
  
    // Add y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("Average Likes");
  
    // Draw the line and path. Remember to use curveNatural.
    let line = d3
      .line()
      .x((d) => xscale(d.Date) + xscale.bandwidth() / 2)
      .y((d) => yscale(d.AvgLikes))
      .curve(d3.curveNatural);
  
    let path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("d", line);
  });