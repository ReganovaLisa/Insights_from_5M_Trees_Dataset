function stackedGroupedBarPlot() {
  const margin = { top: 10, right: 170, bottom: 20, left: 100 };
  const width = window.screen.width * 0.6 - margin.left - margin.right;
  const height = 250 - margin.top - margin.bottom;

  const svg = d3.select("#my_dataviz_percent")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .classed('chart', true)
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("../comparing_categories/data/california_top_five_trees.csv").then(function (data) {
    const subgroups = data.columns.slice(1);
    const groups = data.map(d => (d.City));

    const sums = data.map(d => subgroups.map(colName => +d[colName]).reduce((el, r) => r + el, 0));

    data.forEach((row, row_id) =>
      subgroups.forEach(colName =>
        row[colName] = row[colName] * 100 / sums[row_id]
      )
    );

    const x = d3.scaleLinear()
      .domain([0, 100])
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

    const stackedData = d3.stack()
      .keys(subgroups)
      (data);

    stackedData.forEach((element, id) => {
      element.forEach(subElement => {
        subElement.id = id;
      });
    });

    const tooltip = d3.select("body")
      .append("div")
      .classed("tooltip", true);

    svg.append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .classed("bar", true)
      .attr("y", d => y(d.data.City))
      .attr("x", d => x(d[0]) + 1)
      .attr("width", d => x(d[1]) - x(d[0]))
      .attr("height", y.bandwidth())
      .on('mouseover', function (e, d) {
        d3.select(this).style('border', 'solid 5px #222');
        tooltip.text(`${subgroups[e.id]} : ${e.data[subgroups[e.id]]}`);
        return tooltip.style("z-index", "10")
          .style("opacity", 1);
      })
      .on("mousemove", function () {
        return tooltip.style("top", (d3.event.pageY - 10) + "px")
          .style("left", (d3.event.pageX + 10) + "px");
      })
      .on('mouseout', function (e, d) {
        return tooltip.style("opacity", 0)
          .style("z-index", "-10");
      });

    const size = 10;

    svg.selectAll("mydots")
      .data(subgroups)
      .enter()
      .append("rect")
      .attr("x", width + 10)
      .attr("y", (d, i) => margin.top + i * (size + 5))
      .attr("width", size)
      .attr("height", size)
      .style("fill", d => color(d));

    svg.selectAll("mylabels")
      .data(subgroups)
      .enter()
      .append("text")
      .attr("x", width + 10 + size * 2)
      .attr("y", (d, i) => margin.top + i * (size + 5) + (size / 2))
      .style("fill", "#fff")
      //.style("fill", d => color(d))
      .text(d => d)
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");
  });
}

stackedGroupedBarPlot();
