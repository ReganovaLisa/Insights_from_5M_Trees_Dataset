function makeSmallMultiple(colName, first) {
    var margin = {top: 30, right: 10, bottom: 30, left: 30};
    var width = 170 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
  
    if (first) {
      margin.left = 100;
      margin.right = 0;
    }
  
    d3.csv("../comparing_categories/data/california_top_five_trees.csv").then(function(data) {
      var subgroups = data.columns.slice(1);
      
      const sums = data.map(d => subgroups.map(colName => +d[colName]).reduce((el, r) => r + el, 0));
      data.forEach((row, row_id) => row["Total"] = sums[row_id]);
      subgroups.push("Total");
      
      var groups = data.map(d => (d.City));
      var sumstat = subgroups.map(treeType => { 
          return {"key": treeType, "value": Array.from(data.map(row => row[treeType]))};
      });
      
      var svg = d3.select("#my_dataviz_small")
        .append("svg")
        .style("border", "none")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      var x = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d["Total"])])
        .range([0, width]);
      
      var y = d3.scaleBand()
        .domain(groups)
        .range([height, 0]);
      
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(2));
      
      if (first) {
        svg.append("g")
          .call(d3.axisLeft(y).ticks(2));
      } else {
        svg.append("g")
          .call(d3.axisLeft(y).tickValues([]));
      }
      
      var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#93a9d0', '#37443b', '#6e8055', '#616369', '#9ea889', '#d9dfe9', '#e41a1c']);
      
      svg.append("text")
        .attr("text-anchor", "start")
        .attr("y", -5)
        .attr("x", 0)
        .style("fill", "#fff")
        .text(colName)
        //.style("fill", color(colName));
      
      let newData = data.map(row => {return{"key":row.City, "val":row[colName]}});
      
      svg.selectAll("g")
        .data(newData, d => d)
        .enter().append("rect")
        .style("fill", color(colName))
        .attr("y", d => y(d.key))
        .attr("x", x(0) + 1)
        .attr("width", d => x(d.val))
        
        .attr("height", y.bandwidth() - 2);
    });
  }
  
  d3.csv("../comparing_categories/data/california_top_five_trees.csv").then(function(data) {
      var subgroups = data.columns.slice(1);
      subgroups.push("Total");
      subgroups.forEach((gr,id) => makeSmallMultiple(gr, id == 0));
  });
  