/*
* timechart - simple plugin to create time charts.
*
*
*
* authors: Zunzun AB - http://zunzun.se/
*
* Dannier Trinchet Almaguer, 2015
* Alcides Viamontes Esquivel, 2015
* Neyvis Remón González, 2015
*/

window.zunzun = window.zunzun || {};
zunzun.timechart = function (data) {

    var
        img_dicc = { "image/jpg":"/static/images/icon1.png" ,
            "image/png": "/static/images/icon1.png" ,
            "image/jpeg": "/static/images/icon1.png",
            "image/x-icon": "/static/images/icon1.png",
            "image/ief": "/static/images/icon1.png",
            "image/pjpeg": "/static/images/icon1.png",
            "image/x-jps": "/static/images/icon1.png",
            "image/jutvision": "/static/images/icon1.png" ,
            "image/vasa": "/static/images/icon1.png",
            "image/naplps": "/static/images/icon1.png",
            "image/x-niff": "/static/images/icon1.png",
            "image/x-portable-bitmap": "/static/images/icon1.png",
            "image/x-pcx": "/static/images/icon1.png",
            "image/x-portable-graymap": "/static/images/icon1.png",
            "image/x-xpixmap": "/static/images/icon1.png",
            "image/x-pict": "/static/images/icon1.png",
            "image/x-portable-anymap": "/static/images/icon1.png" ,
            "image/x-portable-pixmap": "/static/images/icon1.png",
            "image/x-quicktime": "/static/images/icon1.png",
            "image/cmu-raster": "/static/images/icon1.png" ,
            "image/x-cmu-raster": "/static/images/icon1.png",
            "image/vnd.rn-realflash": "/static/images/icon1.png",
            "image/x-rgb": "/static/images/icon1.png",
            "image/vnd.rn-realpix": "/static/images/icon1.png" ,
            "image/vnd.dwg": "/static/images/icon1.png",
            "image/x-dwg": "/static/images/icon1.png",
            "image/tiff": "/static/images/icon1.png",
            "image/x-tiff": "/static/images/icon1.png",
            "image/florian": "/static/images/icon1.png" ,
            "image/vnd.wap.wbmp": "/static/images/icon1.png",
            "image/x-xbitmap": "/static/images/icon1.png",
            "image/x-xbm": "/static/images/icon1.png",
            "image/vnd.xiff": "/static/images/icon1.png",
            "image/xpm": "/static/images/icon1.png" ,
            "image/x-xwd": "/static/images/icon1.png",
            "image/x-xwindowdump": "/static/images/icon1.png",
            "image/x-jg": "/static/images/icon1.png",
            "image/bmp": "/static/images/icon1.png",
            "image/fif": "/static/images/icon1.png" ,
            "image/vnd.fpx": "/static/images/icon1.png",
            "image/vnd.net-fpx": "/static/images/icon1.png",
            "image/g3fax": "/static/images/icon1.png",
            "image/gif": "/static/images/icon1.png",

            "application/x-shockwave-flash": "/static/images/icon2.png",

            "application/x-javascript": "/static/images/icon3.png",
            "application/javascript": "/static/images/icon3.png",
            "application/ecmascript": "/static/images/icon3.png",
            "text/javascript": "/static/images/icon3.png",
            "text/ecmascript": "/static/images/icon3.png",

            "text/html": "/static/images/icon4.png",
            "text/webviewhtml": "/static/images/icon4.png",
            "message/rfc822": "/static/images/icon4.png",
            "text/x-server-parsed-html": "/static/images/icon4.png",

            "application/font-woff": "/static/images/icon5.png",
            "application/font-sfnt": "/static/images/icon5.png",
            "image/svg+xml": "/static/images/icon5.png",
            "application/vnd.ms-fontobject": "/static/images/icon5.png",
            "image/x-font-opentype": "/static/images/icon5.png",
            "application/octet-stream": "/static/images/icon5.png",

            "application/x-pointplus": "/static/images/icon6.png",
            "text/css": "/static/images/icon6.png" },

        bar_height = 90, /* Height of each line */
        serie_bar_factor = 0.2,
        series_height = bar_height * serie_bar_factor, /* Height of each time series */
        major_series = ["http1", "http2"],
        distribute_space = (1.0-2*serie_bar_factor)/5. * bar_height,
        major_serie_y = {"http1": distribute_space, "http2": 4*distribute_space+series_height},
        timing_variables = ["blocked", "dns", "connect", "ssl", "send", "wait", "receive"],
        MAJOR_GRID_LINE_COLOR = "#c0c0c0",
        MINOR_GRID_LINE_COLOR = "#dfdfdf",
        x_scale = null, /* Populated later */
        /* How much the grid extends ... */
        max_time_tentative = [100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000],
        /* Which size are then the major separations between grid elements */
        grid_separation_majors =    [5,    25,   50,   50,  100,  125,  150, 150,   200, 200,  250],
        minor_grid_spacing = 5,
        /*Which one was finally sellected*/
        grid_size_idx = null,
        /*Arrays with actual grid sizes*/
        major_grid = null,
        minor_grid = null
    ;

    function resizing_timechart(max_time)
    {
        var i = 0;
        for (var idx = 0; idx < max_time_tentative.length; idx++) {
            if (max_time_tentative[idx] <= max_time) {
                i++;
            }
        }
        var last_index = max_time_tentative.length - 1;
        if ( i > last_index)
            i = last_index;
        return i;
    }

    function create_grid_arrays()
    {
        var top_time = max_time_tentative[grid_size_idx];
        var major_separation = grid_separation_majors[grid_size_idx];
        major_grid = new Array();
        minor_grid = new Array();

        var c = 0;
        while ( c <= top_time )
        {
            major_grid.push( c );
            var cc = c;
            for ( var i=0; i < minor_grid_spacing; i++)
            {
                if ( i != 0 )
                {
                    minor_grid.push(cc);
                }
                cc += major_separation / minor_grid_spacing;
            }
            c += major_separation;
        }
        major_grid.pop();
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
            .data(major_grid)
            .enter()
                .append("div")
                .classed("time-point", true)
                .text(function(d,i){
                    if ( i % 4 == 0)
                        return String(d)+ " ms";
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

        // Let's draw the ruler for the major grid first...
        var cv = document.querySelector("canvas.grid-canvas");
        var ctx = cv.getContext("2d");
        // Translate one pixel right
        ctx.translate(1,0);
        ctx.lineWidth = 0.5;

        var used_width_milliseconds = max_time_tentative[grid_size_idx];

        ctx.strokeStyle = MINOR_GRID_LINE_COLOR;
        minor_grid.forEach(function(value, index, arr){
            var x = Math.round( value * parent_width / used_width_milliseconds );
            ctx.beginPath();
            ctx.moveTo(x-0.5, 0);
            ctx.lineTo(x-0.5, 5);
            ctx.stroke();
            ctx.closePath();
        });

        ctx.lineWidth = 0.5;
        ctx.strokeStyle = MAJOR_GRID_LINE_COLOR;
        major_grid.forEach(function(value, index, arr){
            var x = Math.round( value * parent_width / used_width_milliseconds );
            ctx.beginPath();
            ctx.moveTo(x-0.5, 0);
            ctx.lineTo(x-0.5, 5);
            ctx.stroke();
            ctx.closePath();
        });


        var png_image = cv.toDataURL();
        vertical_grid_inner
            .style("background-image", "url(\'" + png_image + "\')")
            .style("background-repeat", "repeat-y")
        ;
    }

    // The two functions coming below are redundant
    function extract_true_length_from_datum(d, major, variable) {
        var v = d[major][variable];
        if (v < 0)
            return 0;
        else
            return v;
    }

    function extract_visual_length_from_datum(d, major, variable) {
        var v = d[major][variable];
        if (v < 0)
            return 0;
        else
            return v;
    }

    function draw_single_serie(container_g, visual_base_array, true_base_array, name, x_scale, use_y,
        ordinal_of_timing_variable)
    {
        if (visual_base_array == null)
        {
            var lng = data.times.length;

            visual_base_array = new Array(lng);
            true_base_array = new Array(lng);
            for (var i=0; i < lng; i++) {
                visual_base_array[i] = data.times[i][name[0]]["start_time"];
                true_base_array[i] = data.times[i][name[0]]["start_time"];
            }
        }

        var major = name[0];
        var variable_name = name[1];

        var classes =
            "serie-" + major + " " + "variable-" + variable_name ;

        container_g.append("rect")
            .classed(classes, true)
            .attr("x", function(datum, i) {
                var result = x_scale( visual_base_array[i] );
                var visual_length = extract_visual_length_from_datum(datum, major, variable_name);
                visual_base_array[i] += visual_length;
                true_base_array[i] += extract_true_length_from_datum(datum, major, variable_name);
                return result;
            })
            .attr("y", use_y)
            .attr("width", function(datum) {
                var visual_length = extract_visual_length_from_datum(datum, major, variable_name);
                return x_scale( visual_length );
            })
            .attr("height", series_height)
        ;

        return [visual_base_array,true_base_array];
    }

    function draw_handles_if_needed(container_g, major, visual_base_array, x_scale, use_y)
    {
        var variable_name = name[1];

        var classes =
            "handle" + " handle-serie-" + major + " " + "handle-variable-" + variable_name ;

        var d = series_height / 3.;
        var visual_width = x_scale(30.0);

        container_g.insert("rect", ":first-child")
            .classed(classes, true)
            .attr("x", function(datum, i) {
                var t_start = datum[major]["start_time"];
                var t_end = datum[major]["end_time"];
                var middle_point =
                    (t_start + t_end)/2. ;
                var span =
                    t_end - t_start;
                var result = x_scale(middle_point ) - visual_width/2.;
                return result;
            })
            .attr("y", use_y+(series_height - d)/2. )
            .attr("width", visual_width )
            .attr("height", function(datum, i) {
                var t_start = datum[major]["start_time"];
                var t_end = datum[major]["end_time"];
                var span =
                    t_end - t_start;
                if (span < 35)
                    return d;
                else
                    return 0;
            })
            ;
    }

    function draw_series(selection, x){
        for (var j=0; j < major_series.length; j++)
        {
            var visual_base_array = null;
            var true_base_array = null;
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
                var arrs = draw_single_serie(
                    major_container_selection,
                    visual_base_array, true_base_array,
                    name,
                    x,
                    major_serie_y[major],
                    i
                );
                visual_base_array = arrs[0];
                true_base_array = arrs[1];
            }
            data.times.forEach(function(majors, i, arr){
                majors[major]["end_time"] = true_base_array[i];
                majors[major]["visual_end_time"] = visual_base_array[i];
            });
            draw_handles_if_needed(major_container_selection, major, visual_base_array, x_scale,
                major_serie_y[major]
                );
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
            var inner_div = top_row_div
                .append("div")
                ;
            inner_div
                .append("span")
                .classed("bt-bullet timing-"+varname, true)
                .text("• ")
                ;
            inner_div
                .append("span")
                .classed("bt-caption", true)
                .text(function(d){
                    var v = d[major][varname];
                    if (v>=0)
                        return sprintf("%s: ", varname);
                    else
                        return sprintf("%s: ", varname);
                })
                ;
            inner_div
                .append("span")
                .classed("bt-data", true)
                .text(function(d){
                    var v = d[major][varname];
                    if (v>=0)
                        return sprintf("%0.1f", v);
                    else
                        return sprintf("none");
                })
                ;
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
        var hz_blocks = d3.selectAll(".horiz-block");
        hz_blocks
            .data(data.times)
            .insert("div", ":first-child")
            .classed("left-text-block label-zone-width", true);
        var ltb = d3.selectAll(".left-text-block");
        var img_container = ltb.insert("div", ":first-child");
        img_container
            .classed("hb-img-container", true)
            .insert("img", ":first-child")
            .attr("src", function(d){
                var mime_type = d["content_type"] || "application/octet-stream";
                return img_dicc[mime_type];
            });
        var text_column = ltb.append("div");
        text_column.classed("hb-text-column", true);
        text_column.append("div")
            .classed("text-domain", true)
            .text(function(d){
               return d.end;
            });
        text_column.append("div")
            .classed("text-other", true)
            .text(function(d){
               return d.begin;
            });
        var prot_column = ltb.append("div");
        prot_column.classed("hb-prot-column", true);
        prot_column
            .append("div")
            .text("HTTP/1")
            ;
        prot_column
            .append("div")
            .text("HTTP/2")
            ;
    }

    function draw(selection) {
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        grid_size_idx = resizing_timechart(data.max_time);
        var domain = max_time_tentative[grid_size_idx];

        var x = d3.scale.linear()
            .domain([0, domain])
            .range([0, 100]);

        /* Save it for later */
        x_scale = x;

        /* Let's define now what the size of the grid element will be*/
        create_grid_arrays();

        /*And now we can draw stuff...*/
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

        d3.selectAll(".handle-serie-http1")
            .on("mouseover", function(datum,i){
                smoothly_expand_element(datum,i, "http1", this);
            });


        d3.selectAll(".http2-g rect")
            .on("mouseover", function(datum,i){
                smoothly_expand_element(datum,i, "http2", this);
            });
        d3.selectAll(".handle-serie-http2")
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

    var anims_out_there = {};

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
        if ( t1 == t0)
        {
            t1 = t0 + 1.0;
        }
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
            var scaling_params = scaling_for_major(datum, major);
            var scale_a = scaling_params[0];
            var scale_b = scaling_params[1];
            var target = d3.select( scaling_target(el) );
            var cotarget = scaling_cotarget_d3(el, major);
            var backdrop = datapoint_backdrop_target(el, major);
            var backdrop_to_focus = backdrop.select(".data-backdrop-"+major);

            var total_time = 1000;

            var initial_length_array = [];
            var final_length_array = [];
            for (var ii=0; ii < timing_variables.length; ii++)
            {
                var variable_name = timing_variables[ii];
                initial_length_array.push(
                    extract_visual_length_from_datum(datum, major, variable_name)
                );
                final_length_array.push(
                    extract_true_length_from_datum(datum, major, variable_name)
                );
            }

            var anim = new Anim(total_time, function(t){
                var f = t / total_time;
                var uf = 1.0 - f;
                var op_threshold = 0.05;
                if (t > op_threshold )
                {
                    target.select(".handle")
                        .style("opacity", 0.0 );
                } else
                {
                    target.select(".handle")
                        .style("opacity", 1.0 - (t/op_threshold) );
                }

                var matrix_repr = "matrix(" + (1.0+f*(scale_a-1)) + ", 0, 0, 1, " + (f*scale_b) + ", 0)";
                target.attr("transform", matrix_repr);
                cotarget.attr("opacity", String(1.0-f));
                backdrop.style("background-color",
                    "rgba(250,250,255," + f +")"
                );
                backdrop_to_focus.style("opacity",
                    f
                );

                // We also need to change the size of the bars from their fictitius, always
                // visible size to their true size.
                var true_start = datum[major]["start_time"];
                var visible_start = datum[major]["start_time"];

                // Change the sizes of the elements faster than the rest of
                // the stuff
                var ff = Math.pow(f, 0.1);
                var uff = 1.0 - ff;

                for (var ii=0; ii < timing_variables.length; ii++)
                {
                    var variable_name = timing_variables[ii];
                    var width_0 = initial_length_array[ii];

                    var width_1 = final_length_array[ii];

                    var width = width_0 * uff + width_1 * ff;
                    var apparent_width = x_scale(width);

                    var x = true_start * ff + visible_start*uff;
                    var apparent_x = x_scale(x);

                    var xxl = target
                        .select("rect.serie-" + major +".variable-" + variable_name)
                        ;
                    xxl
                        .attr("x", apparent_x)
                        .attr("width", apparent_width);

                    visible_start += width_0;
                    true_start += width_1;
                }
            });

            var time_to_hide = 30000;

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

            // If you happen to activate another object,
            // hide others out there
            for (var p in anims_out_there) {
                if (anims_out_there.hasOwnProperty(p) && p != i) {
                    var another_anim = anims_out_there[p];
                    another_anim.revert().catch(function(){});
                    delete anims_out_there[p];
                }
            }
            anims_out_there[i] = anim;
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