function make_small_multiple(colName, first) {


var margin = {top: 30, right: 10, bottom: 30, left: 30};
let width = 170 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
if (first) {
    margin.left = 100
    margin.right = 0
}

//Read the data
d3.csv("data/california_top_five_trees.csv").then(function(data) {

    var subgroups = data.columns.slice(1)

    const sums = data.map(d => subgroups.map(colName => +d[colName]).reduce((el,r) => r + el, 0))

    data.forEach( (row, row_id) =>
      row["Total"] = sums[row_id]
    )

    subgroups.push("Total")


    const groups = data.map(d => (d.City))

    var sumstat = subgroups.map(treeType => { 
        return {"key": treeType, "value": Array.from(data.map( row => row[treeType]))}
    })



  // group the data: I want to draw one line per group
//   var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
//     .key(function(d) { return d.name;})
//     .entries(data);

  // What is the list of groups?
  //allKeys = sumstat.map(function(d){return d.key})

  // Add an svg element for each group. The will be one beside each other and will go on the next row when no more room available
  var svg = d3.select("#my_dataviz_small")
    // .selectAll("uniqueChart")
    // .data(sumstat)
    // .enter()
    .append("svg")
      .style("border","none")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      //.attr()
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain( [0, d3.max(data, function(d) { return +d["Total"]; })])
    .range([ 0, width ]);

  //Add Y axis
  var y = d3.scaleBand()
    .domain(groups)
    .range([ height, 0 ]);

  
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(2));

    if(first){
  svg.append("g")
    .call(d3.axisLeft(y).ticks(2));
    } else {
        svg.append("g")
            .call(d3.axisLeft(y).tickValues([]))
    }
  // color palette
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#93a9d0','#37443b','#6e8055','#616369','#9ea889','#d9dfe9','#e41a1c'])

  // Draw the line
//   svg
//     
// svg = d3.select("#my_dataviz_small")
//     .selectAll("uniqueChart")

  // Add titles
    svg
    .append("text")
    .attr("text-anchor", "start")
    .attr("y", -5)
    .attr("x", 0)
    .text(colName)
    .style("fill", color(colName))

    
    let new_data = data.map(row => {return{"key":row.City,"val":row[colName]};})

    console.log(new_data)
    console.log(data)
    
    svg.selectAll("g")
        .data(new_data, d => d)
        .enter().append("rect")
        .style("fill", color(colName))
        .attr("y", d => {console.log(d); return y(d.key)})
        .attr("x", x(0) + 1)
        .attr("width", d => x(d.val))
        .attr("height", y.bandwidth() - 2)
    

})

}

d3.csv("data/california_top_five_trees.csv").then(function(data) {
    var subgroups = data.columns.slice(1)
    subgroups.push("Total")
    subgroups.forEach((gr,id) => make_small_multiple(gr, id == 0))
})
