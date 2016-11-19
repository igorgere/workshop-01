$(function () {

  var DEFAULTS = {
    tick_count: 10,
    x_tick_count: 16,

    top_circle_radius: 6,

    brush_height: 200,

    graph_width: 800,
    graph_height: 500
  };

  var symbol = d3.symbol();
  var DOT_SHAPE = symbol.type(function(d){
    if (d.case_gender === 'MALE') {
      return d3.symbolSquare;
    }

    return d3.symbolCircle;
  });

  var STAGES = [
    'I or II NOS',
    'Not available',
    'Stage 0',
    'Stage I',
    'Stage IA',
    'Stage IB',
    'Stage II',
    'Stage IIA',
    'Stage IIB',
    'Stage IIC',
    'Stage III',
    'Stage IIIA',
    'Stage IIIB',
    'Stage IIIC',
    'Stage IS',
    'Stage IV',
    'Stage IVA',
    'Stage IVB',
    'Stage IVC',
    'Stage Tis',
    'Stage X'
  ];

  var margin = {top: 20, right: 20, bottom: 50, left: 60},
  width = DEFAULTS.graph_width - margin.left - margin.right,
  height = DEFAULTS.graph_height - margin.top - margin.bottom,
  brush_height = DEFAULTS.graph_height - margin.top - margin.bottom + DEFAULTS.brush_height;

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select(".scatter-plot").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom + DEFAULTS.brush_height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var color =  d3.scaleOrdinal(d3.schemeCategory20);
  color.domain(STAGES);

  var xBrush = d3.scaleLinear().range([0, width]);
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var xBrushAxis = d3.brushX(xBrush);
  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  // GO GO GO :)
  d3.tsv("../tcga-cases.tsv", function(error, data) {
    if (error) throw error;

    xBrush.domain([0, d3.max(data, function (d) {
      return +d.case_days_to_death;
    })]);
    x.domain([0, d3.max(data, function (d) {
      return +d.case_days_to_death;
    })]);
    y.domain([0, d3.max(data, function (d) {
      return +d.case_age_at_diagnosis;
    })]);

    // Brush
    var brushed = function() {
      if (!d3.event.sourceEvent) return; // Only transition after input.
      if (!d3.event.selection) return; // Ignore empty selections.

      var selection = d3.event.selection;
      var d0 = d3.event.selection.map(x.invert),
      d1 = d0.map(d3.timeDay.round);
      // If empty when rounded, use floor & ceil instead.
      if (d1[0] >= d1[1]) {
        d1[0] = d3.timeDay.floor(d0[0]);
        d1[1] = d3.timeDay.offset(d1[0]);
      }

      x.domain(selection.map(xBrush.invert, xBrush));

      svg.selectAll(".dot")
      .attr("transform", function(d) {
        var x1 = x(d.case_days_to_death),
        y1 = y(d.case_age_at_diagnosis);

        return "translate(" + x1 + "," + y1 + ")";
      })
      .classed("hide", function(d) {
        var x1 = x(d.case_days_to_death);

        return x1 < 0;
      });

    };

    svg.append("g")
    .attr("class", "x axis brush")
    .attr("transform", "translate(0," + brush_height + ")")
    .call(xBrushAxis
      .extent([[0, 0], [width, height]])
      .on("end", brushed))
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Select range");

      // X
      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Case days to death");

      // Y
      svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Case age at diagnosis")

      // Data
      svg.selectAll(".dot")
      .data(data)
      .enter().append("path")
      .attr("d", DOT_SHAPE)
      .attr("transform", function(d) { return "translate(" + x(d.case_days_to_death) + "," + y(d.case_age_at_diagnosis) + ")"; })
      .attr("class", "dot")
      .style("fill", "none")
      .style("stroke", function(d) {
        return color(d.case_pathologic_stage);
      });
    });
  })
