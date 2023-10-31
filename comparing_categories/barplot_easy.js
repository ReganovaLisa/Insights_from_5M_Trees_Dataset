
function run_barplot(divname) {

  const size = 20;
  const key = "common_name";

  const width = window.screen.width * 0.6;
  const height = 480;
  const margin = { t: 10, b: 30, l: 120, r: 10 };

  var sort_order = "tree_count"
  var selectedFile = "../data_raw/Albuquerque_Final_2022-06-18.csv"

  const svg = d3.select(`div#${divname}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('border', 'solid 1px #222');

  const chart = svg.append('g')
    .classed('chart', true)
    .attr('transform', `translate(${margin.l},${margin.t})`);

  const xAxis = svg.append('g')
    .classed('axis', true)
    .attr('transform', `translate(${margin.l},${height - margin.b})`);

  const yAxis = svg.append('g')
    .classed('axis', true)
    .attr('transform', `translate(${margin.l},${margin.t})`);

  document.getElementById("fileSelect").addEventListener("change", function (e) {
    selectedFile = e.target.value;
    if (selectedFile) {
      console.log(selectedFile);
      updateData(selectedFile);
    }
  });

  document.querySelectorAll('input[type="radio"][name="sortorder"]').forEach((radioButton) => {
      radioButton.addEventListener('change', (event) => {
        if (event.target.checked) {
          console.log(`Selected: ${event.target.value}`);
          sort_order = event.target.value;
          updateData(selectedFile)
        }
      });
    });


  function updateData(csvData) {
    d3.csv(csvData).then(function (data) {
      const groupedData = d3.group(data, (d) => d[key]);
      const dataset = Array.from(groupedData.keys())
        .sort((a, b) => groupedData.get(b).length - groupedData.get(a).length)
        .filter((x) => x != 'NA')
        .slice(0, size)
        .map((el, index) => {
          const heights = groupedData.get(el).map((tree) => tree.height_M).filter((height) => height != "NA");
          const properties = {
            "key": el.slice(0,20),
            "value": groupedData.get(el).length,
            "rank": index,
            "height": heights.length > 0 ? Math.round(d3.sum(heights) / heights.length * 10) / 10 : "no data",
          };
          return properties;})
        .sort((a, b) => {
          if (sort_order == "tree_count") {
              return b.value - a.value;
          } else if (sort_order == "tree_name") {
              return a.key.localeCompare(b.key);
          }
        });

      console.log(dataset);

      const d = 500;
      const d_short = 300;
      const tRemove = d3.transition().duration(d);
      const tPosition = d3.transition().duration(d).delay(d);
      const tSize = d3.transition().duration(d).delay(d * 2);

      const xScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, (d) => d.value)])
        .range([0, width - margin.l - margin.r]);

      const yScale = d3.scaleBand()
        .domain(dataset.map((d) => d.key))
        .range([0, height - margin.t - margin.b])
        .padding(0.2);

      d3.axisBottom(xScale)(xAxis.transition(tSize));
      d3.axisLeft(yScale)(yAxis.transition(tPosition));

      let bars = chart.selectAll('rect.bar');

      bars = bars.data(dataset, (d) => d.key);

      bars.exit()
        .classed('obs', true)
        .transition(tRemove)
        .attr('width', 0)
        .remove();

      const tooltip = d3.select("body")
        .append("div")
        .classed("tooltip", true);

      const barsEnter = bars.enter().append('rect')
        .classed('bar new', true)
        .attr('x', xScale(0))
        .on('mouseover', function (e, d) {
          d3.selectAll('rect.bar').classed('unhighlight', true);
          d3.select(this).classed('unhighlight', false);
          d3.select(this).classed('highlight', true);
          tooltip.text(`${dataset[d].key} trees: ${dataset[d].value};\n\tavg height: ${dataset[d].height}`);
          return tooltip.style("z-index", "10")
            .transition().duration(d_short)
            .style("opacity", 1);
        })
        .on("mousemove", function () {
          return tooltip.style("top", (d3.event.pageY - 10) + "px")
            .style("left", (d3.event.pageX + 10) + "px");
        })
        .on('mouseout', function (e, d) {
          d3.selectAll('rect.bar').classed('unhighlight', false);
          d3.select(this).classed('highlight', false);
          return tooltip.transition().duration(d_short)
            .style("opacity", 0)
            .style("z-index", "-10");
        });

        
      bars.classed('new', false)
      .on('mouseover', function (e, d) {
          d3.selectAll('rect.bar').classed('unhighlight', true);
          d3.select(this).classed('unhighlight', false);
          d3.select(this).classed('highlight', true);
          tooltip.text(`${dataset[d].key} trees: ${dataset[d].value};\n\tavg height: ${dataset[d].height}`);
          return tooltip.style("z-index", "10")
            .transition().duration(d_short)
            .style("opacity", 1);
        })
        .on("mousemove", function () {
          return tooltip.style("top", (d3.event.pageY - 10) + "px")
            .style("left", (d3.event.pageX + 10) + "px");
        })
        .on('mouseout', function (e, d) {
          d3.selectAll('rect.bar').classed('unhighlight', false);
          d3.select(this).classed('highlight', false);
          return tooltip.transition().duration(d_short)
            .style("opacity", 0)
            .style("z-index", "-10");
        });

        
      bars.merge(barsEnter)
        .transition(tPosition)
        .attr('y', (d) => yScale(d.key))
        .attr('height', yScale.bandwidth())
        .transition(tSize)
        .attr('width', (d) => xScale(d.value));

        
      setTimeout(() => {
        bars.merge(barsEnter).classed('new', false);
      }, d * 4);
    });
  }

  updateData(selectedFile);
}

run_barplot("barContainer")
