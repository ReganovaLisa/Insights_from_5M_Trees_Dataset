function stackedGroupBarChart() {
  const margin = { top: 10, right: 150, bottom: 20, left: 120 };
  const width = window.screen.width * 0.6 - margin.left - margin.right;
  const height = 250 - margin.top - margin.bottom;

  const svg = d3.select("#my_dataviz_group")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("data/california_top_five_trees.csv").then(function (data) {
    const subgroups = data.columns.slice(1);
    const groups = data.map(d => (d.City));

    const x = d3.scaleLinear()
      .domain([0, 80000])
      .range([0, width]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    const y = d3.scaleBand()
      .domain(groups)
      .range([0, height])
      .padding([0.2]);

    svg.append("g")
      .call(d3.axisLeft(y).tickSizeOuter(0));

    const ySubgroup = d3.scaleBand()
      .domain(subgroups)
      .range([0, y.bandwidth()])
      .padding([0.05]);

    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#93a9d0', '#37443b', '#6e8055', '#616369', '#9ea889', '#d9dfe9']);

    const tooltip = d3.select("body")
      .append("div")
      .classed("tooltip", true);

    svg.append("g")
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("transform", d => `translate(0, ${y(d.City)})`)
      .selectAll("rect")
      .data(function (d) {
        return subgroups.map(function (key) { return { key: key, value: d[key] }; });
      })
      .join("rect")
      .attr("y", d => ySubgroup(d.key))
      .attr("x", d => 0.9)
      .attr("height", ySubgroup.bandwidth())
      .attr("width", d => x(d.value))
      .attr("fill", d => color(d.key));

    const size = 12;

    svg.selectAll("mydots")
      .data(subgroups)
      .enter()
      .append("rect")
      .attr("x", width)
      .attr("y", (d, i) => margin.top + i * (size + 5))
      .attr("width", size)
      .attr("height", size)
      .style("fill", d => color(d));

    svg.selectAll("mylabels")
      .data(subgroups)
      .enter()
      .append("text")
      .attr("x", width + size * 1.2)
      .attr("y", (d, i) => margin.top + i * (size + 5) + (size / 2))
      //.style("fill", d => color(d))
      .text(d => d)
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");
  });
}

stackedGroupBarChart();
