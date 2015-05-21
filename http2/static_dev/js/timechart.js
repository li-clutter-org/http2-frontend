/*
* timechart - simple plugin to create time charts.
*
*
*
* authors: Zunzun AB - http://zunzun.se/
*
* Dannier Trinchet Almaguer, 2015
* Alcides Viamontes Esquivel, 2015
* Neyvis Remón Martínez, 2015
*/

window.zunzun = window.zunzun || {};
zunzun.timechart = function (data) {

    var
        bar_height = 120, /* Height of each line */
        serie_bar_factor = 0.2,
        series_height = bar_height * serie_bar_factor, /* Height of each time series */
        major_series = ["http1", "http2"],
        distribute_space = (1.0-2*serie_bar_factor)/3. * bar_height,
        major_serie_y = {"http1": distribute_space, "http2": 2*distribute_space+series_height},
        legend_height = 130, /* Height of the */
        five_seconds = (function (){
            var result = []; for (var i=0; i < 25; i++) { result.push(i*200);}
            return result;
        })(),
        timing_variables = ["blocked", "dns", "connect", "ssl", "send", "wait", "receive"],
        GRID_LINE_COLOR = "#dfdfdf",
        minimum_measurement_width=10,
        x_scale = null /* Populated later */
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
                .text(function(d,i){
                    if ( i % 2 == 0)
                        return String(d);
                    else
                        return "";
            })
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

    function draw_single_serie(container_g, base_array, name, x_scale, use_y, ord)
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
            function(d) {
                var v = d[name[0]][name[1]];
                if ( v > 0)
                    return Math.max( v, minimum_measurement_width);
                else if ( v <= 0)
                    return 0;
                else
                    return v;
            };

        container_g.append("rect")
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

    function draw_series(selection, x){
        for (var j=0; j < major_series.length; j++)
        {
            var base_array = null;
            var major = major_series[j];
            var major_class = major + "-g";
            // We put each major serie inside its own g element, so that we can
            // resize things easily.
            var major_container_selection = selection
                .append("g")
                .classed(major_class, true)
                .attr("transform", "scale(1,1)")
                ;

            for (var i=0; i < timing_variables.length; i++)
            {
                var minor = timing_variables[i];
                var name = [major, minor];
                base_array = draw_single_serie(
                    major_container_selection,
                    base_array,
                    name,
                    x,
                    major_serie_y[major],
                    i
                );
            }
            data.times.forEach(function(majors, i, arr){
                majors[major]["end_time"] = base_array[i];
            });

        }
    }

    function put_series_data(selection, major)
    {
        var classes = "data-backdrop-major data-backdrop-" + major;
        var at_divs = selection
            .append("div")
            .classed(classes, true)
            ;
        var top_row_div = at_divs
            .append("div")
            .classed("timings-row backdrop-row", true)
            ;
        for (var i=0; i < timing_variables.length; i++) {
            var varname = timing_variables[i];
            top_row_div
                .append("div")
                .classed("backdrop-timing timing-"+varname, true)
                .text(function(d){
                    var v = d[major][varname];
                    if (v>=0)
                        return sprintf("%s: %0.1f", varname, v);
                    else
                        return sprintf("%s: n/a", varname);
                })
        }
        var anti_row_div = at_divs
            .append("div")
            .classed("others-row backdrop-row", true)
            ;
        anti_row_div
            .append("div")
            .classed("start-time", true)
            .text(function(d){
                var v = d[major]["start_time"];
                return sprintf("starts: %0.1f", v);
            });
        anti_row_div
            .append("div")
            .classed("end-time", true)
            .text(function(d){
                var v = d[major]["end_time"];
                return sprintf("ends: %0.1f", v);
            });
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

        /* Save it for later */
        x_scale = x;

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

        // Create a div that fills entirely the parent div
        var chart_timing_graphy = d3.selectAll(".chart-timing-div")
            .append("svg")
            .classed("chart-timing-graphy", true)
            .attr("width", "100%")
            .attr("height", bar_height + "px")
            .attr("viewBox", "0 0 100 " + bar_height )
            .attr("preserveAspectRatio", "none")
            ;

        var serie = chart_timing_graphy
            .append("g")
            .classed("outer-g", true)
            ;

        /* Create the series lines */
        serie
            .data(data.times)
            ;

        draw_series(serie, x);

        var selection_for_data = d3.selectAll(".chart-timing-div")
            .append("div")
            .classed("data-backdrop", true)
            ;
        put_series_data(selection_for_data, "http1");
        put_series_data(selection_for_data, "http2");

        draw_text();

        install_event_handlers();

    }


    function install_event_handlers()
    {
        d3  .selectAll(".chart-timing-div")
            .on("mouseleave", function(datum, i){
                maybe_smoothly_reset_size(datum, i);
            })
            .on("mousemove", function(datum,i){
                mouse_hovers_at_element(datum,i);
            })
            ;

        d3.selectAll(".http1-g rect")
            .on("mouseover", function(datum,i){
                smoothly_expand_element(datum,i, "http1", this);
            });

        d3.selectAll(".http2-g rect")
            .on("mouseover", function(datum,i){
                smoothly_expand_element(datum,i, "http2", this);
            });
    }

    /* The goal of this function is to act as an indirection
       layer when locating the element to transform
     */
    function scaling_target(el)
    {
        return el.parentElement;
    }

    /* Who do you need to hide */
    function scaling_cotarget_d3(el, major)
    {
        var the_other_major = major == "http1" ? ".http2-g" : ".http1-g";
        return d3.select(el.parentElement.parentElement).select(the_other_major);
    }

    /* Who is the guy up in the clouds*/
    function datapoint_backdrop_target(el, major)
    {
        var chart_timing_div = el.parentElement.parentElement.parentElement.parentElement;
        return d3.select(chart_timing_div).select(".data-backdrop");
    }

    function maybe_smoothly_reset_size(datum, i)
    {
        var anim = datum["anim"];
        if ( anim != null )
        {
            delete datum["expanding"];
            // REMOVE
            anim.revert().then(function(){
                delete datum["anim"];
            }).catch(function(){});
        }
    }

    function mouse_hovers_at_element(datum, i)
    {
        datum["visited"] = true;
    }

    function scaling_for_major(datum, major) {
        var t0 = x_scale(datum[major]["start_time"]);
        var t1 = x_scale(datum[major]["end_time"]);
        var time_span = t1 - t0;
        var percent_span = 80; // <-- So let the scaled-up version
                               //     to use 80 percent of the horizontal space
        var scaling_a = percent_span / time_span;
        var scaling_b = (t1 * 10 - t0 * 90) / time_span;
        return [scaling_a, scaling_b];
    }

    function smoothly_expand_element(datum, i, major, el)
    {
        if ( ! datum["expanding"]) {
            //console.log("smooethly expand");
            var scaling_params = scaling_for_major(datum, major);
            var scale_a = scaling_params[0];
            var scale_b = scaling_params[1];
            console.log(scaling_params);
            var target = d3.select( scaling_target(el) );
            var cotarget = scaling_cotarget_d3(el, major);
            var backdrop = datapoint_backdrop_target(el, major);
            var backdrop_to_focus = backdrop.select(".data-backdrop-"+major);

            var total_time = 1000;

            var anim = new Anim(total_time, function(t){
                var f = t / total_time;
                target.attr("transform", "matrix(" + (1.0+f*(scale_a-1)) + ", 0, 0, 1, " + (f*scale_b) + ", 0)");
                cotarget.attr("opacity", String(1.0-f));
                backdrop.style("background-color",
                    "rgba(240,240,255," + f +")"
                );
                backdrop_to_focus.style("opacity",
                    f
                );
            });

            var time_to_hide = 80000;

            anim.set_cos_transform();
            datum["expanding"] = true;
            datum["anim"] = anim;
            var f = function() {
                if (datum["visited"])
                {
                    delete datum["visited"];
                    anim.wait(time_to_hide).then(f);
                } else {
                    delete datum["expanding"];
                    // REMOVE
                    anim.revert().then(function(){
                        delete datum["anim"];
                    }).catch(function(){});
                }
            };
            anim.start().then(function(){
                anim.wait(time_to_hide).then(f);
            });
        }

    }

    // Guerrilla animation class, since SMIL and all the others are not
    // really good fits for this case.
    function Anim(time_span, what_to_do)
    {
        var start_t = null;
        var stopped = true;
        var reverting = false;
        var finished_resolve;
        var reversion_point = null;
        var last_visited = 0;
        var transform = function(x){ return x; };

        var cb = function(high_res_time)
        {
            if (start_t == null)
            {
                start_t = high_res_time;
            }
            if (! stopped && !reverting) {
                if (high_res_time < start_t + time_span) {
                    var d = high_res_time - start_t;
                    var f = time_span* transform( d / time_span );
                    last_visited = d;
                    what_to_do(f);
                    window.requestAnimationFrame(cb);
                } else {
                    start_t = null;
                    stopped = true;
                    finished_resolve("ended");
                }
            }else if (reverting)
            {
                var d = high_res_time - start_t;
                if ( d > reversion_point )
                {
                    // Finished already
                    start_t = null;
                    reverting = false;
                    finished_resolve("reverted");
                } else
                {
                    d = reversion_point - d;
                    var f = time_span* transform( d / time_span );
                    what_to_do(f);
                    window.requestAnimationFrame(cb);
                }
            }
        };
        this.start = function(){
            var fail;
            var done_promise  = new Promise(function(success, pfail){
                finished_resolve = success;
                fail = pfail;
                if (!stopped)
                {
                    fail("AlreadyMoving");
                    return ;
                }
                stopped = false;
                window.requestAnimationFrame(cb);
                });
            return done_promise;
        };
        this.stop = function(){
            stopped = true;
            start_t = null;
            finished_resolve("stopped")
        };
        this.revert = function(){
            var done_promise  = new Promise(function(success, pfail){
                finished_resolve = success;
                if (reverting)
                {
                    // Don't care
                    pfail("AlreadyReverting");
                    return ;
                }

                reversion_point = last_visited;
                // Recapture it
                start_t = null;
                reverting = true;
                if ( stopped ) {
                    stopped = false;
                    window.requestAnimationFrame(cb);
                }
            });

            return done_promise;
        };
        this.set_cos_transform = function(){
            transform = function(f) {
                var y = f*Math.PI;
                return (1.0/Math.PI)*(y-Math.cos(y)*Math.sin(y));
            }
        };

        this.wait = function(wait_time){
            if (typeof wait_time == "number") {
                var p = new Promise(function (success, failure) {
                    setTimeout(success, wait_time);
                });
                return p;
            } else if (Promise.prototype.isPrototypeOf(wait_time)) {
                // Wait, this doesn't make sense.
            };
        }
    }

    // Here we return the draw object to the d3 framework, so that it can be instanced with
    // whatever data is needed.
    return draw;
}