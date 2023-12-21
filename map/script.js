//const width = 800;
//const height = 600;
//const width = screen.width;
//const height = 0.6*width;
// param to change points dencity 

const myColors = ["gold", "CornflowerBlue", "LightGoldenRodYellow", "yellow",
"CadetBlue", "orange", "darkgreen", "Coral",
"brown", "slateblue", "DarkSlateGrey"]

function dot_plot(is_multiple, canvas_name){
let base_radius = 2
var width = window.innerWidth * 0.9;
 height = 0.6*width;



// Load GeoJSON data and display the map
d3.csv("../map/data/usa_top10.csv").then(function (data) {
d3.json("../map/usaRegs.json").then(function (world) {

    const canvas = d3.select(canvas_name)
        .attr("width", width)
        .attr("height", height);

    
        
    const context = canvas.node().getContext("2d");

    var allYears = Object.keys(data[0]).slice(1)
    if (is_multiple){
    // Draw legend inside the canvas
    const legendWidth = 120;
    const legendHeight = myColors.length * 20;
    const legendX = margin.left  ;
    const legendY = 10;

    context.save();
    context.fillStyle = "rgba(0, 0, 0, 0.002)";
    context.fillRect(legendX, legendY, legendWidth, legendHeight);

    myColors.forEach((color, i) => {
        const dotX = legendX + 10;
        const dotY = legendY + 10 + i * 20;

        context.beginPath();
        context.fillStyle = color;
        context.fillRect(dotX, dotY, 5, 5);

        const labelX = dotX + 10;
        const labelY = dotY + 4;

        context.font = "13px Roboto";
        context.fillStyle = "white";
        context.fillText(allYears[i], labelX, labelY);
        
    })};
    
    context.restore();

    
    const projection = d3.geoAlbersUsa()
     .scale(width)
     .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection).context(context);
    const path_ = d3.geoPath().projection(projection);

    world.features.forEach(function(feature) {
        let state = data.filter(d => d.state == feature.properties.name)

        if (state.length > 0) {
        context.beginPath();
        path(feature);
        context.lineWidth = 0.7;
        context.strokeStyle = "white";
        context.stroke();
        }
    });

    world.features
        .forEach(function (feature) {
            feature.properties.area = path_.area(feature);
            feature.properties.bounds = path_.bounds(feature);
        });

    
    let max_trees = d3.max(data, d => d3.sum(Object.values(d).slice(1).map( el => +el)))
    let max_state_area = d3.max(world.features, d => d.properties.area)

    world.features.forEach(function(feature) {
        context.save()
        context.beginPath();
        path(feature);
        context.clip()

        let x = feature.properties.bounds[0][0]
        let y = feature.properties.bounds[0][1]
        let w = feature.properties.bounds[1][0] - x
        let h = feature.properties.bounds[1][1] - y

        let state = data.filter(d => d.state == feature.properties.name)

        if (state.length > 0) {
            state = state[0]
            //console.log(state)


            
            
            let relative_tree_count = d3.sum(Object.values(state).slice(1).map( el => +el)) / max_trees
            //console.log(relative_tree_count)
            let relative_state_area = feature.properties.area / max_state_area
            //console.log(relative_state_area)
            //console.log(feature.properties.area)
            //console.log(feature.properties.bounds)
            let state_box_area = w * h

            let real_dencity = relative_tree_count / relative_state_area
            //console.log(real_dencity)
            let box_dencity = real_dencity
            //console.log(box_dencity)
            let radius = base_radius / Math.sqrt(box_dencity)
           // console.log(radius)
            let points = createPoints(w, h, radius)
            points.forEach(d => {
                d[0] += x; 
                d[1] += y
            })

           // console.log(Object.values(state).slice(1).map( el => +el))

            points.forEach(function (d) {

                context.beginPath();
                

                // change for fool green 
                if(is_multiple) {
                    context.fillStyle = myColors[getRandomMultinomial(Object.values(state).slice(1).map( el => +el))]
                } else {
                    context.fillStyle = "white";
                }

                context.fillRect(d[0], d[1], 2, 2);
            });
        
        }       
        context.restore() 

    });

    function getRandomMultinomial(odds) {
        const total_odds = d3.sum(odds)
        let probs = odds.map( d => d / total_odds)
        const rand = Math.random();
        let cumulative_prob = 0;
        for (let i = 0; i < probs.length; i++) {
            cumulative_prob += probs[i];
            if (rand <= cumulative_prob) {
                return i;
            }
        }
    }


})
});

function createPoints(width, height, radius) {

    var sample = poissonDiscSampler(width, height, radius);
    for (var data = [], d; d = sample();) {
        data.push(d);
    }

    return data;
}

// https://bl.ocks.org/mbostock/19168c663618b7f07158
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
};


dot_plot(is_multiple = false, canvas_name = "#map_dot");
dot_plot(is_multiple = true, canvas_name = "#map_dot_multiple");