function run_heatmap(div_name) {
    var margin = {top: 20, right: 20, bottom: 30, left: 100},
    width = window.screen.width * 0.4 - margin.left - margin.right,
    height = width;
    const d_short = 50;

    var svg = d3.select(`#${div_name}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("data/california_top_five_trees.csv").then(function(data) {

        console.log(data);

        var myGroups = data.map(el => el.City);

        var myVars = Object.keys(data[0]).filter(el => el != "City" && el != "Other")
        

        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(myGroups)
            .padding(0.01);
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))

        var y = d3.scaleBand()
            .range([ height, 0 ])
            .domain(myVars)
            .padding(0.01);
        svg.append("g")
            .call(d3.axisLeft(y));


        let line_data = data.flatMap(row => myVars.map(el => {return {"key": row.City, "var": el, "val": +row[el]}}));

        console.log(line_data);
        console.log(line_data.reduce((prev, curr) => prev.val > curr.val ? prev : curr))

        var myColor = d3.scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([0, line_data.reduce((prev, curr) => prev.val > curr.val ? prev : curr).val])

        const tooltip = d3.select("body")
            .append("div")
            .classed("tooltip", true);

        svg.selectAll()
            .data(line_data, d => d)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.key)})
            .attr("y", function(d) { return y(d.var) })
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) { return myColor(d.val)} )
            .on('mouseover', function (e, d) {
                d3.select(this).classed('highlight', true);
                tooltip.text(`${line_data[d].var} trees in ${line_data[d].key}: ${line_data[d].val}`);
                return tooltip.style("z-index", "10")
                  .transition().duration(d_short)
                  .style("opacity", 1);
              })
              .on("mousemove", function () {
                return tooltip.style("top", (d3.event.pageY - 10) + "px")
                  .style("left", (d3.event.pageX + 10) + "px");
              })
              .on('mouseout', function (e, d) {
                d3.select(this).classed('highlight', false);
                return tooltip.transition().duration(d_short)
                  .style("opacity", 0)
                  .style("z-index", "-10");
              });
    })
}

run_heatmap("heatmapContainer")