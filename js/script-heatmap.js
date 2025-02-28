//https://d3-graph-gallery.com/graph/heatmap_tooltip.html
// Set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 150, left: 180 },
  width = 450 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
const svg = d3
  .select("#heat-map")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
d3.csv("../data/heatmap_data.csv").then((data) => {
  // Extract unique categories for axes
  const xLabels = Array.from(new Set(data.map((d) => d.Browse_Frequency)));
  const yLabels = Array.from(new Set(data.map((d) => d.Purchase_Frequency)));

  // Create scales
  const x = d3.scaleBand().range([0, width]).domain(xLabels).padding(0.05);
  const y = d3.scaleBand().range([height, 0]).domain(yLabels).padding(0.05);
  const colorScale = d3
    .scaleSequential(d3.interpolateBlues)
    .range(["white", "#69b3a2"])
    .domain([0, d3.max(data, (d) => +d.Value)]);


  // Add X axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 50)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Browsing Frequency");

  // Add Y axis
  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 50)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Purchase Frequency");

  // Create a tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "lightgray")
    .style("padding", "5px")
    .style("border-radius", "5px");

  svg
    .selectAll()
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.Browse_Frequency))
    .attr("y", (d) => y(d.Purchase_Frequency))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", (d) => colorScale(+d.Value))
    .style("stroke", "white")
    .on("mouseover", function (event, d) {
      tooltip
        .style("visibility", "visible")
        .html(
          `Purchase: ${d.Purchase_Frequency}<br>Browse: ${d.Browse_Frequency}<br>Value: ${d.Value}`
        );
      d3.select(this).style("stroke", "black");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseleave", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this).style("stroke", "white");
    });
});
