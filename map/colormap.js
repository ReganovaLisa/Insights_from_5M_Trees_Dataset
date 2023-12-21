// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3v7/choropleth

function Choropleth(data, {
    id = d => d.id, // given d in data, returns the feature id
    value = () => undefined, // given d in data, returns the quantitative value
    title, // given a feature f and possibly a datum d, returns the hover text
    format, // optional format specifier for the title
    scale = d3v7.scaleSequential, // type of color scale
    domain, // [min, max] values; input of color scale
    range = d3v7.interpolateGreens, // output of color scale
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    projection, // a d3v7 projection; null for pre-projected geometry
    features, // a GeoJSON feature collection
    featureId = d => d.id, // given a feature, returns its id
    borders, // a GeoJSON object for stroking borders
    outline = projection && projection.rotate ? {type: "Sphere"} : null, // a GeoJSON object for the background
    unknown = "grey", // fill color for missing data
    fill = "white", // fill color for outline
    stroke = "white", // stroke color for borders
    strokeLinecap = "round", // stroke line cap for borders
    strokeLinejoin = "round", // stroke line join for borders
    strokeWidth, // stroke width for borders
    strokeOpacity, // stroke opacity for borders
  } = {}) {
    // Compute values.
    const N = d3v7.map(data, id);
    const V = d3v7.map(data, value).map(d => d == null ? NaN : +d);
    const Im = new d3v7.InternMap(N.map((id, i) => [id, i]));
    const If = d3v7.map(features.features, featureId);
  
    // Compute default domains.
    if (domain === undefined) domain = d3v7.extent(V);
  
    // Construct scales.
    const color = scale(domain, range);
    if (color.unknown && unknown !== undefined) color.unknown(unknown);
  
    // Compute titles.
    if (title === undefined) {
      format = color.tickFormat(100, format);
      title = (f, i) => `${f.properties.name}\n${format(V[i])}`;
    } else if (title !== null) {
      const T = title;
      const O = d3v7.map(data, d => d);
      title = (f, i) => T(f, O[i]);
    }
  
    // Compute the default height. If an outline object is specified, scale the projection to fit
    // the width, and then compute the corresponding height.
    if (height === undefined) {
      if (outline === undefined) {
        height = 400;
      } else {
        const [[x0, y0], [x1, y1]] = d3v7.geoPath(projection.fitWidth(width, outline)).bounds(outline);
        const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
        projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
        height = dy;
      }
    }
  
    // Construct a path generator.
    const path = d3v7.geoPath(projection);
  
    const svg = d3v7.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "width: 100%; height: auto; height: intrinsic;");
  
    if (outline != null) svg.append("path")
        .attr("fill", fill)
        .attr("stroke", "currentColor")
        .attr("d", path(outline));
  
    svg.append("g")
      .selectAll("path")
      .data(features.features)
      .join("path")
        .attr("fill", (d, i) => color(V[Im.get(If[i])]))
        .attr("d", path)
      .append("title")
        .text((d, i) => title(d, Im.get(If[i])));
  
    if (borders != null) svg.append("path")
        .attr("pointer-events", "none")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", path(borders));

    
  
        const legendWidth = 0.2*width;
        const legendHeight = 20;
        const legendScale = d3v7.scaleLinear().domain(domain).range([0, legendWidth]);
    
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - legendWidth - 0.1*width}, ${0})`);
    
        const legendGradient = legend.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");
    
        legendGradient.selectAll("stop")
            .data(range.map((color, i) => ({ offset: i / (range.length - 1), color })))
            .enter().append("stop")
            .attr("offset", d => `${d.offset * 100}%`)
            .attr("stop-color", d => d.color);
    
        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");
    
        const legendAxis = d3v7.axisBottom(legendScale)
            .ticks(5)
            .tickSize(legendHeight)
            .tickFormat(d3v7.format("~s"));
    
        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);
    
        
    
        return Object.assign(svg.node(), { scales: { color } });
    }

 

  Promise.all([
    d3v7.csv("../map/data/result_states.csv").then(data => data.map(d => ({...d, rate: +d.rate}))),
    d3v7.json("../map/data/counties-albers-10m.json"),
  ]).then(([unemployment, us]) => {
    const counties = topojson.feature(us, us.objects.counties);
    const states = topojson.feature(us, us.objects.states);
    const statemap = new Map(states.features.map(d => [d.id, d]));
    const statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
  
    const chart_map = Choropleth(unemployment, {
      id: d => d.id,
      value: d => d.rate,
      scale: d3v7.scaleQuantize,
      domain: [1, 284739],
      range: d3v7.schemeGreens[9],
      title: (f, d) => ` ${statemap.get(f.id.slice(0, 2)).properties.name}\n${d?.rate}`,
      features: states,
      borders: statemesh,
      width: 975,
      height: 610,
    });
  
    const chartMapContainer = document.getElementById('chart_map');
    chartMapContainer.appendChild(chart_map);
  });