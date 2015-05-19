module.exports = function(grunt) {
    var base = './http2/';
    var generalJS = prepare(grunt.file.readJSON(base + 'static_dev/js/general.json'));
    var d3JS = prepare(grunt.file.readJSON(base+'static_dev/js/d3.json'));

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            options:{
                style: 'compressed',
                sourcemap: true
            },
            dev: {
                files: {
                    'static_dev/css/style.css': 'static_dev/css/sass/config.scss'
                },
                options:{
                    style: 'nested'
                }
            },
            build: {
                files: {
                    'static_dev/build/css/style.css': 'static_dev/css/sass/config.scss'
                },
                options:{
                    style: 'nested'
                }
            }
        },
        watch: {
            options: {
                livereload: true,
                debounceDelay: 250
            },
            css: {
                files: ['static_dev/css/sass/**/*.sass', 'static_dev/css/lib/**/*.sass',],
                tasks: ['sass:build', 'autoprefixer:dev']
            },
            js:{
                files: ['static_dev/js/general.json', 'static_dev/js/**/*.js', 'static_dev/js/angular/**/test/*.js']
            },
            html:{
                files: ['templates/**/*.html', 'static_dev/partials/**/*.html']
            }
        },
        bgShell: {
            runserver: {
                bg: false,
                stdout: false,
                stderr: false,
                cmd: "python manage.py runserver 0.0.0.0:8000"
            }
        },
        clean: ['static_dev/build', 'templates/docs/frontend'],
        uglify: {
            options:{
                compress:{
                },
                mangle: true,
                beautify: false,
                sourceMap : false
            },
            build_d3: {
                options:{
                    compress:{
                        drop_debugger: false,
                        sequences: false,
                        unused: false,
                        keep_fargs: true,
                        hoist_funs: false, 
                        join_vars: false
                    },
                    mangle: false,
                    beautify: true,
                    sourceMap : false
                },
                files: {
                    'static_dev/build/js/d3.js': d3JS.files
                }
            },
            build_general: {
                options:{
                    banner: generalJS.banner
                },
                files: {
                    'static_dev/build/js/general.js': generalJS.files
                }
            }
        },
        copy: {
            images: {
                files: [
                        {
                            expand: true,
                            flatten: true,
                            src: 'static_dev/img/*',
                            dest: 'static_dev/build/img'
                        }
                    ]
                },
            fonts: {
                files: [
                        {
                            expand: true,
                            cwd: 'static_dev/font/',
                            src: '**',
                            dest: 'static_dev/build/font'
                        }
                    ]
                }
            },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            dev:{
                tasks: ['bgShell:runserver', 'switchwatch:options:css:js:html']
            },
            build: {
                tasks: ['copy', 'sass:build', 'uglify']
            },
            docs: {
                tasks: ['ngdocs']
            }
        },
        ngdocs: {
            all: ['static_dev/js/angular/**/*.js'],
            options: {
                dest: 'templates/docs/frontend',
                title: 'Load Impact http2 docs',
                html5Mode: false
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 3 versions', 'ie 9'],
                map: true,
                cascade: false
            },
            dev: {
                src: 'static_dev/css/style.css'
            },
            build: {
                src: ['static_dev/build/**/*.css']
            }
        }
    });

    // Run with: grunt switchwatch:target1:target2 to only watch those targets
    // credits: http://stackoverflow.com/users/1030802/kyle-robinson-young

    grunt.registerTask('switchwatch', function() {
        var targets = Array.prototype.slice.call(arguments, 0);

        Object.keys(grunt.config('watch')).filter(function(target) {
            return !(grunt.util._.indexOf(targets, target) !== -1);
        })
        .forEach(function(target) {
            grunt.log.writeln('Ignoring ' + target);
            grunt.config(['watch', target], {files: []});
        });
        grunt.task.run('watch');
        grunt.log.writeln('\n');
    });

    // Needs to be set down here so all the tasks have been loaded
    grunt.file.setBase(base);

    grunt.registerTask('default',       ['sass:dev', 'autoprefixer:dev', 'concurrent:dev']);
    grunt.registerTask('build',         ['clean', 'concurrent:build', 'concurrent:docs', 'autoprefixer:build']);
};

var prepare = function(obj){
    var prefix = obj.root;

    // adds the root to all file locations
    obj.files.forEach(function(item, index){
        obj.files[index] = prefix + item;
    });

    obj.banner = prepareBanner(obj.credits);

    return obj;
};

var prepareBanner = function(arr){
    if(arr && arr.length){
        var template = [
            '/*',
            ' * Includes:'
        ];

        arr.forEach(function(item){
            template.push(" * " + item);
        });

        template.push(
            ' * compiled: <%= grunt.template.today("dd/mm/yyyy HH:MM:ss") %>',
            ' */',
            '\n'
        );

        return template.join('\n');
    };

    return undefined;
};
