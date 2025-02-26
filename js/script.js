// Load CSV data
d3.csv("data/amz_data.csv").then((data) => {
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

  const genderCounts = Array.from(
    d3.rollup(
      data,
      (v) => v.length,
      (d) => d.Gender
    ),
    ([gender, count]) => ({
      gender,
      count,
    })
  );

  const maxAge = d3.max(data, (d) => d.age);
  const minAge = d3.min(data, (d) => d.age);

  const ageMap = new Map(ageCounts.map((d) => [d.age, d.count]));

  const completeAgeCounts = d3.range(minAge, maxAge + 1).map((age) => ({
    age,
    count: ageMap.get(age) || 0,
  }));

  console.log(ageCounts);
  console.log(genderCounts);
  console.log(typeof genderCounts);
  barChart(completeAgeCounts);
});

function barChart(ageCounts) {
  var margin = {
      top: 30,
      right: 30,
      bottom: 70,
      left: 60,
    },
    width = window.innerWidth - margin.left - margin.right,
    height = 720 - margin.top - margin.bottom;

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