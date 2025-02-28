console.log("here")
d3.csv("../data/amz_data.csv").then((data) => {

  const [rangeAgeData, binAgeData] = getRangeAge(data);
  console.log(rangeAgeData, binAgeData);
  barChart(rangeAgeData);
  barBinChart(binAgeData);

  const binage = getBinnedAgeGenderData(data);

  drawStackedBarChart(binage);
});

const binSize = 10;

function getAgeRange(age) {
  const lowerBound = Math.floor(age / binSize) * binSize;
  const upperBound = lowerBound + binSize;
  return `${lowerBound}-${upperBound}`;
}

function getRangeAge(data) {
  data.forEach((d) => {
    d.age = +d.age;
  });

  const ageCounts = Array.from(
    d3
      .rollup(
        data,
        (v) => v.length,
        (d) => d.age
      )
      .entries(),
    ([age, count]) => ({
      age: age,
      count: count,
    })
  );

  const maxAge = d3.max(data, (d) => d.age);
  const minAge = d3.min(data, (d) => d.age);

  const ageMap = new Map(ageCounts.map((d) => [d.age, d.count]));

  const completeAgeCounts = d3.range(minAge, maxAge + 1).map((age) => ({
    age,
    count: ageMap.get(age) || 0,
  }));

  const binnedAgeCountsMap = d3.rollup(
    completeAgeCounts,
    (group) => d3.sum(group, (d) => d.count), // sum all counts in each bin
    (d) => getAgeRange(d.age) // group key is the bin label
  );

  const binnedAgeCounts = Array.from(binnedAgeCountsMap, ([range, count]) => ({
    range,
    count,
  }));

  return [completeAgeCounts, binnedAgeCounts];
}

function getBinnedAgeGenderData(data) {
  data.forEach((d) => {
    d.age = +d.age;
  });


  const binSize = 10;
  const nestedMap = d3.rollup(
    data,
    (v) => v.length, 
    (d) => getAgeRange(d.age, binSize), 
    (d) => d.Gender 
  );


  const allRanges = Array.from(nestedMap.keys()).sort();
  const allGenders = new Set(data.map((d) => d.Gender));


  const binnedData = allRanges.map((range) => {
    const genderMap = nestedMap.get(range);
    const row = { range };

    allGenders.forEach((g) => {
      row[g] = genderMap.get(g) || 0;
    });
    return row;
  });

  return binnedData;
}

function barChart(ageCounts) {
  var margin = {
      top: 30,
      right: 30,
      bottom: 70,
      left: 60,
    },
    width = 1200 - margin.left - margin.right,
    height = 360 - margin.top - margin.bottom;

  var svg = d3
    .select("#bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3
    .scaleBand()
    .domain(ageCounts.map((d) => d.age)) //
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(ageCounts, (d) => d.count)])
    .range([height, 0])
    .nice(); //

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  svg
    .selectAll(".bar")
    .data(ageCounts)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.age))
    .attr("y", (d) => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.count))
    .attr("fill", "steelblue");
}

function barBinChart(ageBinCounts) {
  var margin = {
      top: 30,
      right: 30,
      bottom: 70,
      left: 60,
    },
    width = 1200 - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;

  var svg = d3
    .select("#bar-bin-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3
    .scaleBand()
    .domain(ageBinCounts.map((d) => d.range)) //
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(ageBinCounts, (d) => d.count)])
    .range([height, 0])
    .nice(); //

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  svg
    .selectAll(".bar")
    .data(ageBinCounts)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.range))
    .attr("y", (d) => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.count))
    .attr("fill", "steelblue");
}

function drawStackedBarChart(binnedData) {
  // Extract the list of genders from the first row (excluding `range`).
  // Alternatively, you could track the genders in a separate array/set.
  const allGenders = Object.keys(binnedData[0]).filter((k) => k !== "range");

  // Dimensions
  const margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 1200 - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;

  // Create SVG
  const svg = d3
    .select("#stacked-bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale -> discrete (age range bins)
  const x = d3
    .scaleBand()
    .domain(binnedData.map((d) => d.range))
    .range([0, width])
    .padding(0.2);

  // Y scale -> 0 to the maximum *stacked* sum
  // We compute the max by summing all genders in each row
  const maxStack = d3.max(binnedData, (row) => {
    let sum = 0;
    allGenders.forEach((g) => {
      sum += row[g];
    });
    return sum;
  });

  const y = d3.scaleLinear().domain([0, maxStack]).range([height, 0]).nice();
  const color = d3.scaleOrdinal().domain(allGenders).range(d3.schemeCategory10);
  const stack = d3.stack().keys(allGenders);
  const series = stack(binnedData);

  svg
    .selectAll("g.layer")
    .data(series)
    .enter()
    .append("g")
    .attr("class", "layer")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.data.range))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth());

  // X-axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Y-axis
  svg.append("g").call(d3.axisLeft(y));

  // Optional: Add a legend
  const legend = svg.append("g").attr("transform", "translate(0,0)");

  legend
    .selectAll("rect")
    .data(allGenders)
    .enter()
    .append("rect")
    .attr("x", 20) // Align all rects in a column
    .attr("y", (d, i) => i * 20) // Space them out vertically
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", (d) => color(d));

  legend
    .selectAll("text")
    .data(allGenders)
    .enter()
    .append("text")
    .attr("x", 40) // Offset text slightly to the right of the rects
    .attr("y", (d, i) => i * 20 + 12) // Align text with rects
    .text((d) => d);
}
