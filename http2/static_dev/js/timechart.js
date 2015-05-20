/*
* timechart - simple plugin to create time charts.
*
*  Usage:
*
*   d3.select("#chart")
*     .call(d3.timechart(data)));
*
*  where data should look like:
*
* var data = {
*     times:[
*         {
*             domain:'https :// www.zunzun.se',
*             path:'/main.css',
*             http1: [0,1,6,7,14],  // [moment the request starts, sending, waiting, receiving, Total elapsed time of the request]
*             http2: [0,1,3,5,9]
*         },
*         {
*             domain:'https :// www.zunzun.se',
*             path:'/styles.css',
*             http1: [3,4,8,9,21],
*             http2: [5,4,5,6,15]
*         },
*         {
*             domain:'https :// www.zunzun.se',
*             path:'/scripts',
*             http1: [2,3,6,7,16],
*             http2: [1,3,5,9,17]
*         },
*         {
*             domain:'https :// www.zunzun.se',
*             path:'/routings.js',
*             http1: [6,1,1,2,4],
*             http2: [7,2,1,1,4]
*         }
*     ]
* };
*
* author: Zunzun AB - http://zunzun.se/
*/

d3.timechart = function (data) {
    function width_value(id){
        return document.getElementById(id).offsetWidth
    }
    function height_value(id){
        return document.getElementById(id).offsetHeight
    }
    var width =  0.618 * width_value('analyzer-http'), /*With of the series part */
        bar_height = 80, /* Height of each line */
        series_height = bar_height * 0.12, /* Height of each time series */
        major_serie_y = {"http1": bar_height * 0.33, "http2": bar_height*0.55},
        left_align = 40, /* Position (in percent) of vertical separator */
        vertical_separator = left_align * width / 100, /* Position of vertical separator */
        legend_height = 130, /* Height of the */
        total_width = width + vertical_separator, /* Total width of the chart */
        five_seconds = (function (){
            var result = []; for (var i=0; i < 25; i++) { result.push(i*200);}
            return result;
        })(),
        timing_variables = ["blocked", "dns", "connect", "ssl", "send", "wait", "receive"],
        legend_data = {
            labels: [
                {label: 'Sending', x:total_width * 0.810},
                {label: 'Waiting', x:total_width * 0.872 },
                {label: 'Receiving', x:total_width * 0.948}],
            series: [
            {x: total_width * 0.378, y:20, size: 50, text: "http1", class: ['http1_sending','http1_waiting', 'http1_receiving']},
            {x: total_width * 0.378, y:35, size: 50, text: "http2", class: ['http2_sending','http2_waiting', 'http2_receiving']}
        ]
        },
        GRID_LINE_COLOR = "#dfdfdf"
    ;

    function format_tooltip_text(amount){ return amount.toFixed(2) + 'ms';}

    function put_legend_in_diagram() {
        this.append("svg").attr("class", "legend");
        var legend = d3.select(".legend")
            .attr("width", vertical_separator + width)
            .attr("height", legend_height);
        var legend_series = legend.selectAll("g")
            .data(legend_data.series)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + d.x + ",0)";
            }
        );
        legend_series.append("rect")
            .attr("class", function (d) {
                return d.class[0]
            })
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y;
            })
            .attr("width", function (d) {
                return d.size;
            })
            .attr("height", series_height);
        legend_series.append("rect")
            .attr("class", function (d) {
                return d.class[1]
            })
            .attr("x", function (d) {
                return d.x + d.size;
            })
            .attr("y", function (d) {
                return d.y;
            })
            .attr("width", function (d) {
                return d.size;
            })
            .attr("height", series_height);
        legend_series.append("rect")
            .attr("class", function (d) {
                return d.class[2]
            })
            .attr("x", function (d) {
                return d.x + d.size + d.size;
            })
            .attr("y", function (d) {
                return d.y;
            })
            .attr("width", function (d) {
                return d.size;
            })
            .attr("height", series_height);

        legend_series.append("text")
            .attr("x", function (d) {
                return d.x + d.size + d.size + d.size + 40;
            })
            .attr("y", function (d) {
                return d.y + 8;
            })
            .text(function (d) {
                return d.text;
            });

        legend.selectAll("ag").data(legend_data.labels)
            .enter().append("text")
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", 10)
            .text(function (d) {
                return d.label;
            });

        legend.append("text")
            .attr("x", vertical_separator)
            .attr("y", 25)
            .text("Effectiveness: " + data.effectiveness);

        legend.append("text")
            .attr("x", total_width)
            .attr("y", 70)
            .text("Effectiveness = 1 - 2 * ( Max(R1,R2) - R1R2 ) / (R1 + R2)");

        legend.append("text")
            .attr("x", total_width)
            .attr("y", 85)
            .text("R1: number of HTTP/1.1 resources");

        legend.append("text")
            .attr("x", total_width)
            .attr("y", 100)
            .text("R2: number of HTTP/2 resources");

        legend.append("text")
            .attr("x", total_width)
            .attr("y", 115)
            .text("R1R2: number of common resources");
    }

    function put_rulers(selection){
        var top_diagram_zone = selection
            .append("div")
            .classed("top-diagram-zone", true)
        ;

        top_diagram_zone
            .append("div")
            .classed("label-zone-width", true)
        ;

        top_diagram_zone
            .append("div")
            .classed("timing-width h-ruler", true)
        ;
        d3
            .select(".h-ruler")
            .selectAll(".time-point")
            .data(five_seconds)
            .enter()
                .append("div")
                .classed("time-point", true)
                .text(function(d){ return String(d);})
        ;
    }

    function draw_vertical_grid(selection){

        var miniruler_div_container = selection
            .append("div")
            .classed("top-diagram-zone ruler-container", true)
        ;

        miniruler_div_container
            .append("div")
            .classed("label-zone-width", true)
        ;

        miniruler_div_container
            .append("div")
            .classed("timing-width vertical-grid", true)
        ;

        var div_vertical_grid = document.querySelector("div.vertical-grid");
        var parent_width = div_vertical_grid.offsetWidth;

        return draw_grid_using_canvas(parent_width);
        // Adopting SVG image generated by Neyvis'code
        //return draw_grid_using_svg(parent_width);
    }

    function draw_grid_using_canvas(parent_width)
    {
        var vertical_grid = d3.select(".vertical-grid");

        vertical_grid
            .append("canvas")
            .classed("grid-canvas", true)
        ;

        var vertical_grid_inner = vertical_grid
            .append("div")
            .classed("grid-container", true)
        ;

        // The canvas way.
        d3.select(".grid-canvas")
            .attr("width", parent_width)
            .style("width", parent_width + "px")
            .style("height", "5px")
            .classed("grid-canvas", true)
            .attr("height", "5")
        ;

        var cv = document.querySelector("canvas.grid-canvas");
        var ctx = cv.getContext("2d");
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = GRID_LINE_COLOR;
        five_seconds.forEach(function(value, index, arr){
            var x = Math.round( value * parent_width / 5000 );
            ctx.moveTo(x+0.5, 0);
            ctx.lineTo(x+0.5, 5);
            ctx.stroke();
        });
        var png_image = cv.toDataURL();
        vertical_grid_inner
            .style("background-image", "url(\'" + png_image + "\')")
            .style("background-repeat", "repeat-y")
        ;
    }

    function draw_grid_using_svg(parent_width)
    {

        d3.select(".vertical-grid")
            .append("svg")
            .classed("grid-svg", true)
        ;

        // The svg way.
        var grid_svg = d3.select(".grid-svg")
            .attr("width", parent_width)
            .attr("height", "5")
            .style("width", parent_width + "px")
            .style("height", "5px")
            .classed("grid-svg", true)
        ;

        grid_svg
            .selectAll("line")
            .data(five_seconds)
            .enter()
            .append("line")
            .style("stroke", GRID_LINE_COLOR)
            .style("stroke-width", 1.0)
            .attr("x1", function(d){
                    return Math.round(d * parent_width / 5000);
                })
            .attr("x2", function(d){
                    return Math.round( d * parent_width / 5000 );
                })
            .attr("y1", 0)
            .attr("y2", 5)

        var svg_image = "data:image/svg+xml;utf8," + encodeURIComponent(grid_svg[0][0].outerHTML);
        return svg_image;
    }

    function draw_single_serie(serie, base_array, name, x_scale, use_y)
    {
        if (base_array == null)
        {
            var lng = data.times.length;

            base_array = new Array(lng);
            for (var i=0; i < lng; i++) {
                base_array[i] = data.times[i][name[0]]["start_time"]
            }
        }
        var classes =
            "serie-" + name[0] + " " + "variable-" + name[1] ;

        var extract_from_d =
            function(d) { return Math.max( d[name[0]][name[1]], 0) ;};

        serie.append("rect")
            .classed(classes, true)
            .attr("x", function(d, i) {
                var result = x_scale( base_array[i] );
                var visual_length = extract_from_d(d);
                base_array[i] += visual_length;
                return result;
            })
            .attr("y", use_y)
            .attr("width", function(d) {
                var visual_length = extract_from_d(d);
                return x_scale( visual_length );
            })
            .attr("height", series_height)
        ;

        return base_array;
    }

    function draw_series(serie, x){
        var major_series = ["http1", "http2"];
        for (var j=0; j < major_series.length; j++)
        {
            var base_array = null;
            var major = major_series[j];
            for (var i=0; i < timing_variables.length; i++)
            {
                var minor = timing_variables[i];
                var name = [major, minor];
                base_array = draw_single_serie(serie, base_array, name, x, major_serie_y[major]);
            }
        }
    }

    function draw_text()
    {
        d3.selectAll(".horiz-block")
            .data(data.times)
            .insert("div", ":first-child")
            .classed("left-text-block label-zone-width", true);
        var ltb = d3.selectAll(".left-text-block");
        ltb.append("div")
            .classed("text-domain", true)
            .text(function(d){
               return d.domain;
            });
        ltb.append("div")
            .classed("text-other", true)
            .text(function(d){
               return d.path;
            });

    }

    function draw(selection) {
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var x = d3.scale.linear()
            .domain([0, 5000])
            .range([0, 100]);

        /* Draw the legend */
        //put_legend_in_diagram.call(this);

        /* Add the SVG objects */
        //selection.append("svg").attr("class","chart");

        put_rulers(selection);

        draw_vertical_grid(selection);

        selection.selectAll(".chart-timing-div")
            .data(data.times)
            .enter().append("div")
                .classed("horiz-block", true)
            ;

        d3.selectAll(".horiz-block")
            .append("div")
                .attr("class", "chart-timing-div timing-width")
        ;


        d3.selectAll(".chart-timing-div")
            .append("svg")
            .classed("chart-timing-graphy", true)
            .attr("width", "100%")
            .attr("height", bar_height + "px")
            .attr("viewBox", "0 0 100 " + bar_height )
            .attr("preserveAspectRatio", "none")
            ;

        /* Create the series lines */
        var serie = d3.selectAll(".chart-timing-graphy")
            .data(data.times)
            ;

        draw_series(serie, x);

        draw_text();

    }

    // getter / setter for all settings
    draw.width = function (x) {
        if (!arguments.length) return width;
        width = x;
        return draw;
    };
    draw.bar_height = function (x) {
        if (!arguments.length) return bar_height;
        bar_height = x;
        return draw;
    };
    draw.series_height = function (x) {
        if (!arguments.length) return series_height;
        series_height = x;
        return draw;
    };
    draw.http1_y = function (x) {
        if (!arguments.length) return http1_y;
        http1_y = x;
        return draw;
    };
    draw.http2_y = function (x) {
        if (!arguments.length) return http2_y;
        http2_y = x
        return draw;
    };
    draw.left_align = function (x) {
        if (!arguments.length) return left_align;
        left_align = x;
        return draw;
    };
    draw.vertical_separator = function (x) {
        if (!arguments.length) return vertical_separator;
        vertical_separator = x;
        return draw;
    };
    draw.total_width = function (x) {
        if (!arguments.length) return total_width;
        total_width = x;
        return draw;
    };
    return draw;
}