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
    var width = 560, /* With of the series part */
        bar_height = 80, /* Height of each line */
        series_height = bar_height * 0.12, /* Height of each time series */
        http1_y = bar_height * 0.33, /* Vertical position of http1 series */
        http2_y = bar_height * 0.55, /* Vertical position of http2 series */
        left_align = 40, /* Position (in percent) of vertical separator */
        vertical_separator = left_align * width / 100, /* Position of vertical separator */
        total_width = width + vertical_separator /* Total width of the chart */
    ;
    function draw() {
         var x = d3.scale.linear()
        .domain([0, d3.max(data.times, function (d) {
                return Math.max(
                    d.http1[4] + d.http1[0],
                    d.http2[4] + d.http1[0]);
            }
        )])
        .range([0, width]);
        /* Add the SVG object */
        this.append("svg").attr("class","chart");
        /* Define the canva sizes */
        var chart = d3.select(".chart")
            .attr("width", vertical_separator + width)
            .attr("height", bar_height * data.times.length);
        console.log(chart);
        /* Create the series lines */
        var serie = chart.selectAll("g")
            .data(data.times)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + vertical_separator + "," + i * bar_height + ")";
            }
        );
        <!-- Draw HTTP 1 series -->
        serie.append("rect")
            .attr("class", "http1_sending")
            .attr("x", function (d) {
                return x(d.http1[0]);
            })
            .attr("y", http1_y)
            .attr("width", function (d) {
                return x(d.http1[1]);
            })
            .attr("height", series_height);

        serie.append("rect")
            .attr("class", "http1_waiting")
            .attr("x", function (d) {
                return x(d.http1[0]) + x(d.http1[1]);
            })
            .attr("y", http1_y)
            .attr("width", function (d) {
                return x(d.http1[2]);
            })
            .attr("height", series_height);

        serie.append("rect")
            .attr("class", "http1_receiving")
            .attr("x", function (d) {
                return x(d.http1[0]) + x(d.http1[1]) + x(d.http1[2])
            })
            .attr("y", http1_y)
            .attr("width", function (d) {
                return x(d.http1[3]);
            })
            .attr("height", series_height);

        <!-- Draw HTTP 2 series -->
        serie.append("rect")
            .attr("class", "http2_sending")
            .attr("x", function (d) {
                return x(d.http2[0]);
            })
            .attr("y", http2_y)
            .attr("width", function (d) {
                return x(d.http2[1]);
            })
            .attr("height", series_height);

        serie.append("rect")
            .attr("class", "http2_waiting")
            .attr("x", function (d) {
                return x(d.http2[0]) + x(d.http2[1]);
            })
            .attr("y", http2_y)
            .attr("width", function (d) {
                return x(d.http2[2]);
            })
            .attr("height", series_height);

        serie.append("rect")
            .attr("class", "http2_receiving")
            .attr("x", function (d) {
                return x(d.http2[0]) + x(d.http2[1]) + x(d.http2[2]);
            })
            .attr("y", http2_y)
            .attr("width", function (d) {
                return x(d.http2[3]);
            })
            .attr("height", series_height);

        <!--  URLs - paths -->
        var url = chart.selectAll("div")
            .data(data.times)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * bar_height + ")";
            }
        );
        url.append("rect")
            .attr("class", "url")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vertical_separator)
            .attr("height", bar_height);

        url.append("text")
            .attr("x", vertical_separator - 20)
            .attr("y", http1_y + 4)
            .text(function (d) {
            return d.domain;
        });

        url.append("text")
            .attr("x", vertical_separator - 20)
            .attr("y", http2_y + 4)
            .text(function (d) {
                return d.path;
            });

        <!--  Lines -->
        chart.selectAll("p")
            .data(data.times).enter()
            .append("line")
            .style("stroke", "black")
            .style("stroke-width", 0.2)
            .attr("x1", 0)
            .attr("y1", function (d, i) {
                return (i + 1) * bar_height;
            })
            .attr("x2", total_width)
            .attr("y2", function (d, i) {
                return (i + 1) * bar_height;
            });
        chart.append("line")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("x1", vertical_separator - 1)
            .attr("y1", 0)
            .attr("x2", vertical_separator - 1)
            .attr("y2", bar_height * data.times.length);
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