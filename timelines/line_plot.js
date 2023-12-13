// set the dimensions and margins of the graph
const margin = {top: 100, right: 30, bottom: 40, left: 60},
    width = 660 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;




const svg2 = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

const svg = d3.select("#my_dataviz2")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

const possiblie_years = ['2022', '2017', '2012', '2007', '2002', '1997', '1992', '1987', '1982', '1977']

const curYears = new Set(['2007', '2022',])
var curState = "Alabama"

const months = ["January", "February", "March", "April","May", "June",
"July", "August", "September", "October", "November", "December"]

var select = document.getElementById('checkBoxes');

possiblie_years.forEach( y => {
  var checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.name = y;
  checkbox.checked = curYears.has(y);
  checkbox.id = `checkbox${y}`;

  checkbox.addEventListener("change", function (e) {
    if (this.checked) {
      curYears.add(this.name)
    } else {
      curYears.delete(this.name)
    }
    plot_data_years(curYears)
    plot_data_kde(curYears)
  })
  
  var label = document.createElement('label')
  label.htmlFor = `checkbox${y}`;
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(y));

  select.appendChild(label);
})





function plot_data_years(allYears) {
// append the svg object to the body of the page
allYears = Array.from(allYears).sort()
//Read the data
d3.csv("data/all_in_one_temperatire.csv").then(function (data) {
    console.log(allYears)
    svg.selectAll("*").remove()

    const colorStep = 7
    const legendHight = 340
    const allGroup = new Set(data.map(d => d.state))
    

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // A color scale: one color for each group
    const myColor = d3.scaleOrdinal()
      .domain(allYears)
      .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    const x = d3.scalePoint()
      .domain(months)
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    console.log(Object.entries(data[0]).filter(el => el[0].endsWith("maximal")).map(d => d[0].split('_')[0]))
    console.log(Object.entries(data[0]).filter(el => el[0].endsWith("maximal")).map(d => d[1]))
    console.log(months.map(m =>`${m}_average`))
    console.log(d3.max(months.map(m => +data[1][`${m}_minimal`])))
    console.log(d3.max(months.map(m => +data[1][`${m}_maximal`])))
    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d3.min(months.map(m => +d[`${m}_minimal`])) ), 
      d3.max(data, d => d3.max(months.map(m => +d[`${m}_maximal`])) )])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));


    // Initialize line with first group of the list
    const low_lines = [];
    const high_lines = [];
    const dot_lines = [];

    svg.selectAll("mydots")
      .data(allYears)
      .enter()
      .append("circle")
        .attr("cx", function(d,i){ return 250 + 55*(i%2)}  )
        .attr("cy", function(d,i){ return legendHight -  Math.floor(i/2)*20}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 5)
        .style("fill", function(d){ return  myColor(d)})

// Add one dot in the legend for each name.
    svg.selectAll("mylabels")
      .data(allYears)
      .enter()
      .append("text")
        .attr("x", function(d,i){ return 260 + 55*(i%2)}  )
        .attr("y", function(d,i){ return legendHight + 1 -  Math.floor(i/2)*20}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return  myColor(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    allYears.forEach( year => {

      console.log(year)
      console.log(Object.entries(data.filter( d => d.state==curState && +d.year == year)[0]).filter(el => el[0].endsWith("minimal")))

      low_lines[low_lines.length] = svg
      .append('g')
      .append("path")
        .datum(Object.entries(data.filter(d => d.state==curState && +d.year == year)[0])
              .filter(el => el[0].endsWith("minimal")))
        .attr("d", d3.line()
          .x(function(d) { return x(d[0].split('_')[0]) })
          .y(function(d) { return y(+d[1]) })
        )
        .attr("stroke", function(d){ return tinycolor(myColor(year)).darken(colorStep).toString() })
        .style("stroke-width", 4)
        .style("fill", "none")


        high_lines[high_lines.length] = svg
        .append('g')
        .append("path")
          .datum(Object.entries(data.filter(d => d.state==curState && +d.year == year)[0])
                .filter(el => el[0].endsWith("maximal")))
          .attr("d", d3.line()
            .x(function(d) { return x(d[0].split('_')[0]) })
            .y(function(d) { return y(+d[1]) })
          )
          .attr("stroke", function(d){ return tinycolor(myColor(year)).lighten(colorStep).toString() })
          .style("stroke-width", 4)
          .style("fill", "none")

        dot_lines[dot_lines.length] = svg.append('g')
          .selectAll("dot")
          .data(Object.entries(data.filter(d => d.state==curState && +d.year == year)[0])
              .filter(el => el[0].endsWith("average")))
          .enter()
          .append("circle")
              .attr("cx", function (d) { return x(d[0].split('_')[0]); } )
              .attr("cy", function (d) { return y(+d[1]); } )
              .attr("r", 3)
              .style("fill", tinycolor(myColor(year)).toString())
            
            }

    )
    
    // A function that update the chart
    function update(selectedGroup) {
      curState = selectedGroup
      idx = 0
      allYears.forEach( year => {
        // Create new data with the selection?
        const dataFilter = data.filter(d => d.state==selectedGroup && +d.year == year)[0]
        console.log(Object.entries(dataFilter).filter(el => el[0].endsWith("minimal")))
        console.log(low_lines[idx])
        console.log(idx)
        console.log(year)
        // Give these new data to update line
        low_lines[idx]
            .datum(Object.entries(dataFilter).filter(el => el[0].endsWith("minimal")))
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(function(d) { return x(d[0].split('_')[0]) })
                .y(function(d) { return y(+d[1]) })
            )
            .attr("stroke", function(d){ return tinycolor(myColor(year)).darken(10).toString() })

        high_lines[idx]
            .datum(Object.entries(dataFilter).filter(el => el[0].endsWith("maximal")))
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .x(function(d) { return x(d[0].split('_')[0]) })
              .y(function(d) { return y(+d[1]) })
            )
            .attr("stroke", function(d){ return tinycolor(myColor(year)).lighten(10).toString() })


        dot_lines[idx]
          .data(Object.entries(dataFilter).filter(el => el[0].endsWith("average")))
          .transition()
          .duration(1000)
            .attr("cx", function(d) { return x(d[0].split('_')[0]) })
            .attr("cy", function(d) { return y(+d[1]) })
            .style("fill", tinycolor(myColor(year)).toString())
        
        idx = idx + 1;
      })
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(event, d) {
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
        plot_data_kde(allYears)
    })


}) 
}


function plot_data_kde(allYears) {
  

  d3.csv("data/all_in_one_temperatire.csv").then(function(data) {
  
  svg2.selectAll("*").remove()

  data = data.filter(d => d.state==curState)
  // Get the different categories and count them
  const categories = Array.from(allYears).sort()
  const n = categories.length

  // Compute the mean of each group
  allMeans_min = []
  for (i in categories) {
    currentGroup = categories[i]
    mean = d3.mean(
      Object.entries(
        data.filter(d => d.year == currentGroup)[0])
        .filter(el => el[0].endsWith("minimal")),
      function(d) { return +d[1] })
    allMeans_min.push(mean)
  }
  
  // Create a color scale using these means.
  const myColor_min = d3.scaleSequential()
    .domain([d3.min(allMeans_min) - 1, d3.max(allMeans_min) + 1])
    .range(["cyan", "blue"]);


    allMeans_max = []
    for (i in categories) {
      currentGroup = categories[i]
      mean = d3.mean(
        Object.entries(
          data.filter(d => d.year == currentGroup)[0])
          .filter(el => el[0].endsWith("maximal")),
        function(d) { return +d[1] })
      allMeans_max.push(mean)
    }
    
    // Create a color scale using these means.
    const myColor_max = d3.scaleSequential()
      .domain([d3.min(allMeans_max) - 1, d3.max(allMeans_max) + 1])
      .range(["yellow", "red"]);

  // Add X axis
  const x = d3.scaleLinear()
    .domain([-40, 50])
    .range([ 0, width ]);
  svg2.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickValues([-30,-20,-10,0,10,20,30,40,50]).tickSize(-height) )
    .select(".domain").remove()

  // Create a Y scale for densities
  const y = d3.scaleLinear()
    .domain([0, 0.3])
    .range([ height, 0]);

  // Create the Y axis for names
  const yName = d3.scaleBand()
    .domain(categories)
    .range([0, height])
    .paddingInner(1)
  svg2.append("g")
    .call(d3.axisLeft(yName).tickSize(0))
    //.select(".domain").remove()

  // Compute kernel density estimation for each column:
  const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)) // increase this 40 for more accurate density.
  const allDensity_min = []
  for (i = 0; i < n; i++) {
      key = categories[i]
      density = kde( Object.entries(
        data.filter(d => d.year == key)[0])
        .filter(el => el[0].endsWith("minimal"))
        .map(function(d){  return +d[1]; }) )
      allDensity_min.push({key: key, density: density})
  }


  const allDensity_max = []
  for (i = 0; i < n; i++) {
      key = categories[i]
      density = kde( Object.entries(
        data.filter(d => d.year == key)[0])
        .filter(el => el[0].endsWith("maximal"))
        .map(function(d){  return +d[1]; }) )
      allDensity_max.push({key: key, density: density})
  }

  // Add areas
  svg2.selectAll("areas")
    .data(allDensity_min)
    .join("path")
      .attr("transform", function(d){return(`translate(0, ${(yName(d.key)-height)})` )})
      .attr("fill", function(d){
        grp = d.key ;
        index = categories.indexOf(grp)
        value = allMeans_min[index]
        return myColor_min( value  )
      })
      .datum(function(d){return(d.density)})
      .attr("opacity", 0.7)
      .attr("stroke", "#000")
      .attr("stroke-width", 0.1)
      .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      )

  svg2.selectAll("areas")
    .data(allDensity_max)
    .join("path")
      .attr("transform", function(d){return(`translate(0, ${(yName(d.key)-height)})` )})
      .attr("fill", function(d){
        grp = d.key ;
        index = categories.indexOf(grp)
        value = allMeans_max[index]
        return myColor_max( value  )
      })
      .datum(function(d){return(d.density)})
      .attr("opacity", 0.7)
      .attr("stroke", "#000")
      .attr("stroke-width", 0.1)
      .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      )

})


}


function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return [x, d3.mean(V, function(v) { return kernel(x - v); })];
    });
  };
}
function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}

plot_data_years(curYears)
plot_data_kde(curYears)