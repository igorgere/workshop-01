$(function () {

    var DEFAULTS = {
        tick_count: 10,
        x_tick_count: 16,

        top_circle_radius: 6,

        brush_height: 200,

        graph_width: 800,
        graph_height: 500
    };

    var margin = {top: 20, right: 20, bottom: 50, left: 60},
        width = DEFAULTS.graph_width - margin.left - margin.right,
        height = DEFAULTS.graph_height - margin.top - margin.bottom;

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
    var svg = d3.select(".scatter-plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + DEFAULTS.brush_height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var color = d3.schemeCategory10;

        var y = d3.scaleLinear().range([height, 0]);
        var x = d3.scaleLinear().range([0, width]);

        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);

    // GO GO GO :)
    d3.tsv("../tcga-cases.tsv", function(error, data) {
      if (error) throw error;

      x.domain([0, d3.max(data, function (d) {
        return +d.case_days_to_death;
      })]);
      y.domain([0, d3.max(data, function (d) {
        return +d.case_age_at_diagnosis;
      })]);

      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Sepal Width (cm)");

      svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Sepal Length (cm)")

      svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", function(d) { return x(+d.case_days_to_death); })
      .attr("cy", function(d) { return y(+d.case_age_at_diagnosis); })
      .style("fill", function(d) { return d3.color(d.species); });

      // var legend = svg.selectAll(".legend-wrapper")
      // .data(d3color.domain())
      // .enter().append("g")
      // .attr("class", "legend")
      // .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
      //
      // legend.append("rect")
      // .attr("x", width - 18)
      // .attr("width", 18)
      // .attr("height", 18)
      // .style("fill", color);
      //
      // legend.append("text")
      // .attr("x", width - 24)
      // .attr("y", 9)
      // .attr("dy", ".35em")
      // .style("text-anchor", "end")
      // .text(function(d) { return d; });
    });
  })
