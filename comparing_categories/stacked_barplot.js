function stacked_bar_plot() 
{
  var margin = {top: 10, right: 150, bottom: 20, left: 120},
    width = window.screen.width * 0.6 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .classed('chart', true)
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("data/california_top_five_trees.csv").then(function(data) {

 // List of subgroups = header of the csv files = soil condition here
 const subgroups = data.columns.slice(1)

 // List of groups = species here = value of the first column called group -> I show them on the X axis
 const groups = data.map(d => (d.City))

 // Add X axis

 const x = d3.scaleLinear()
   .domain([0, 92000])
   .range([0, width ]);
 svg.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x));

 // Add Y axis

 const y = d3.scaleBand()
     .domain(groups)
     .range([0,height])
     .padding([0.2])
 svg.append("g")
   .call(d3.axisLeft(y).tickSizeOuter(0));


 

 // color palette = one color per subgroup
 const color = d3.scaleOrdinal()
   .domain(subgroups)
   .range(['#93a9d0','#37443b','#6e8055','#616369','#9ea889','#d9dfe9'])

 //stack the data? --> stack per subgroup
 const stackedData = d3.stack()
   .keys(subgroups)
   (data)

   stackedData.forEach((element,id) => {
        element.forEach( subElement => {
            subElement.id = id;
        });
   });

   const tooltip = d3.select("body")
   .append("div")
   .classed("tooltip", true);
 
 // Show the bars
 svg.append("g")
   .selectAll("g")
   // Enter in the stack data = loop key per key = group per group
   .data(stackedData)
   .join("g")
     .attr("fill", d => color(d.key))
     .selectAll("rect")
     // enter a second time = loop subgroup per subgroup to add all rectangles
     .data(d => d)
     .join("rect")
       .classed("bar",true)
       .attr("y", d => y(d.data.City))
       .attr("x", d => x(d[0]) + 1)
       .attr("width", d => x(d[1]) - x(d[0]))
       .attr("height",y.bandwidth())
       .on('mouseover', function (e, d) {
            d3.select(this).style('border', 'solid 5px #222');;
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
        })    
        



        // Add one dot in the legend for each name.
        var size = 12
        svg.selectAll("mydots")
    .data(subgroups)
    .enter()
    .append("rect")
        .attr("x", width)
        .attr("y", function(d,i){ return margin.top  + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
    .data(subgroups)
    .enter()
    .append("text")
        .attr("x", width + size*1.2)
        .attr("y", function(d,i){ return margin.top + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")


})
}

stacked_bar_plot();