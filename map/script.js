const width = 800;
const height = 600;

const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa()
    .scale(500)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Load GeoJSON data and display the map
d3.json("usaRegs.json").then(function (world) {
    svg.selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .attr("fill", function (d) {
            return d.properties.name ? "white" : "#ccc";
        });
        
    world.features
        .forEach(function (feature) {
            feature.properties.area = path.area(feature);
            feature.properties.bounds = path.bounds(feature);
        });
    console.log(world)

    
    let x = world.features[1].properties.bounds[0][0]
    let y = world.features[1].properties.bounds[0][1]
    let w = world.features[1].properties.bounds[0][0] - x
    let h = world.features[1].properties.bounds[0][0] - y

    var pointsDeposit = createPoints(w, h, 0.1);
    console.log(pointsDeposit)


    svg.selectAll("circle")
    .data(pointsDeposit)
    .enter()
    .append("circle")
    .attr("cx", d => x + d[0])
    .attr("cy", d => y + d[1])
    .attr("r", 1)
    .attr("fill","orange")
  .transition()
    .attr("r", 2);
});

// Creates a bound set of points with a specific density
function createPoints(width, height, radius) {
    // width and height are the dimensions of the bounding rectangle
    // p is the percentage of this rectangle's area covered by polygon
    // n is the desired number of points within the polygon

    // var area = width * height * p; // area of the polygon

    // // radius needed to get roughly the correct dot density in the polygon
    // var radius = Math.sqrt(area / (1.62 * n));
    // // (took some playing around to get this ratio, probably could work out 
    // //  the math to get a closer approximation but it wouldn't be noticable
    // //  visually)

    // repeatedly sample until you fill the bounding box
    var sample = poissonDiscSampler(width, height, radius);
    for (var data = [], d; d = sample();) {
        data.push(d);
    }

    return data;
}

// From https://bl.ocks.org/mbostock/19168c663618b7f07158
// Based on https://www.jasondavies.com/poisson-disc/
function poissonDiscSampler(width, height, radius) {
    var k = 30, // maximum number of samples before rejection
        radius2 = radius * radius,
        R = 3 * radius2,
        cellSize = radius * Math.SQRT1_2,
        gridWidth = Math.ceil(width / cellSize),
        gridHeight = Math.ceil(height / cellSize),
        grid = new Array(gridWidth * gridHeight),
        queue = [],
        queueSize = 0,
        sampleSize = 0;

    return function () {
        if (!sampleSize) return sample(Math.random() * width, Math.random() * height);

        // Pick a random existing sample and remove it from the queue.
        while (queueSize) {
            var i = Math.random() * queueSize | 0,
                s = queue[i];

            // Make a new candidate between [radius, 2 * radius] from the existing sample.
            for (var j = 0; j < k; ++j) {
                var a = 2 * Math.PI * Math.random(),
                    r = Math.sqrt(Math.random() * R + radius2),
                    x = s[0] + r * Math.cos(a),
                    y = s[1] + r * Math.sin(a);

                // Reject candidates that are outside the allowed extent,
                // or closer than 2 * radius to any existing sample.
                if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) return sample(x, y);
            }

            queue[i] = queue[--queueSize];
            queue.length = queueSize;
        }
    };

    function far(x, y) {
        var i = x / cellSize | 0,
            j = y / cellSize | 0,
            i0 = Math.max(i - 2, 0),
            j0 = Math.max(j - 2, 0),
            i1 = Math.min(i + 3, gridWidth),
            j1 = Math.min(j + 3, gridHeight);

        for (j = j0; j < j1; ++j) {
            var o = j * gridWidth;
            for (i = i0; i < i1; ++i) {
                if (s = grid[o + i]) {
                    var s,
                        dx = s[0] - x,
                        dy = s[1] - y;
                    if (dx * dx + dy * dy < radius2) return false;
                }
            }
        }

        return true;
    }

    function sample(x, y) {
        var s = [x, y];
        queue.push(s);
        grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = s;
        ++sampleSize;
        ++queueSize;
        return s;
    }
}
