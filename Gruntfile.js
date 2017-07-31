module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		
        cssbeautifier: {
            files: ["dev/css/*.css"],
            options: {
                indent: '    ',
                openbrace: 'end-of-line',
                autosemicolon: false
            }
        },
        prettify: {
            options: {
                "indent": 4,
                "condense": true,
                "indent_inner_html": true,
                "unformatted": [
                    "a",
                    "pre",
                    "span",
                    "b",
                    "i"
                ]
            },
            // Prettify a directory of files
            dev: {
                expand: true,
                src: 'dev/*.html',
                overwrite: true
            }
        },
        
		
  css_selectors: {
    options: {
      mutations: [
        {prefix: '.vg-chat-widget-wrapper'}
      ]
    },
    prefix: {
      files: {
        'dist/css/ind/chat.min.css': ['dist/css/ind/chat.min.css'],
        'dist/css/ind/emotions.min.css': ['dist/css/ind/emotions.min.css'],
        'dist/css/livechat.min.css': ['dist/css/livechat.min.css'],
        //'dist/vendor/libraries.min.css': ['dist/vendor/libraries.min.css'],
      },
    },
  },
        compress: {
            main: {
                options: {
                    mode: 'zip',
                    archive: 'dist.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['**']
                    }
                ]
            }
        },
        autoprefixer: {
            options: {
                browsers: ['ie 8', 'ie 7', 'ff 3', 'safari 4']
            },
            multiple_files: {
                expand: true,
                //flatten: true,
                cwd: 'dist/css/ind',
                src: ['*.css'],
                dest: 'dist/css/ind',
                overwrite: true, // overwrite matched source files
            },
        },
		cssmin: {
            target: {
                files: [{
                        expand: true,
                        cwd: 'dev/css/',
                        src: ['*.css'],
                        dest: 'dist/css/ind',
                        ext: '.min.css'
                    }, {
                        expand: true,
                        cwd: 'dist/vendor/ind/css/',
                        src: ['*.css', '!*.min.css'],
                        flatten: true,
                        dest: 'dist/vendor/ind/css/',
                        ext: '.min.css'
                    }
                ]
            }
        },
		concat_css: {
            options: {
                // Task-specific options go here. 
            },
            minified: {
                src: [
                    'dist/css/ind/*.min.css'
                ],
                dest: "dist/css/livechat.min.css"
            },
            vendor: {
                src: [
                    //'dist/vendor/ind/css/bootstrap-theme.min.css',
                    //'dist/vendor/ind/css/bootstrap.min.css',
                    'dist/vendor/ind/css/magnific-popup.min.css',
                ],
                dest: "dist/vendor/libraries.min.css"
            }
        },
		 htmlbuild: {
            dist: {
                src: 'dist/*.html',
                dest: 'dist/',
                overwrite: true,
                options: {
                    relative: true,
                    scripts: {
                        chat: 'dist/js/livechat.min.js',
                        libraries: 'dist/vendor/libraries.min.js'
                    },
                    styles: {
                        bundle: 'dist/css/livechat.min.css',
                        libraries: 'dist/vendor/libraries.min.css'
                    }
                }
            }
        },
		copy: {
			imgs: {
                expand: true,
                cwd: 'dev/imgs',
                src: '**',
                flatten: true,
                filter: 'isFile',
                dest: 'dist/imgs/'
            },
			bootstrap_fonts: {
                expand: true,
                cwd: 'vendor/bootstrap/dist/fonts',
                src: '**',
                flatten: true,
                filter: 'isFile',
                dest: 'dist/fonts/'
            },
			html: {
                expand: true,
                src: [
                    'dev/*.html'
                ],
                flatten: true,
                filter: 'isFile',
                dest: 'dist'
            },
			sound: {
                expand: true,
                cwd: 'dev',
                src: 'sound/**',
                flatten: true,
                filter: 'isFile',
                dest: 'dist/sound/'
            },
			vendorJs: {
                expand: true,
                src: [
                    'vendor/jquery/dist/jquery.min.js', 
                    'vendor/socket.io-client/socket.io.js', 
                    'vendor/mustache.js/mustache.min.js',
                    //'vendor/bootstrap/dist/js/bootstrap.js',
                    'vendor/magnific-popup/dist/jquery.magnific-popup.js',
                    'vendor/jquery-titlealert/jquery.titlealert.js',
                    //'vendor/jquery-mousewheel/jquery.mousewheel.js',
                    //'vendor/jScrollPane/script/jquery.jscrollpane.js'
                ],
                flatten: true,
                filter: 'isFile',
                dest: 'dist/vendor/ind/js',
				rename: function (dest, src) {
                    //   dest = 'dist/'
                    //   src = 'module1/index.html'
                    /*console.log( dest );
                     console.log( src );*/
					 if( 
					 src.indexOf('jquery.magnific-popup') > -1 ||
					 src.indexOf('jquery.titlealert') > -1 ||
					 src.indexOf('jquery.mousewheel') > -1 ||
					 src.indexOf('jquery.jscrollpane') > -1					 
					 ){
						 return dest + '/'+src.replace('.', '-', src);
					 }
                    return dest + '/'+src;
                }
            },
			vendorCss: {
                expand: true,
                src: [
                    //'vendor/bootstrap/dist/css/bootstrap-theme.css',
                    //'vendor/bootstrap/dist/css/bootstrap.css',
                    'vendor/magnific-popup/dist/magnific-popup.css',
                ],
                flatten: true,
                filter: 'isFile',
                dest: 'dist/vendor/ind/css'
            },
		},
		uglify: {
            options: {
                compress: {
                    hoist_funs: false,
                    drop_console: true
                },
                mangle: {
                    except: ['jQuery', 'Backbone', 'vegaStarter', 'vg', '$', 'jquery', 'liveChat']
                }
            },
            js: {
                files: [{
                        expand: true,
                        cwd: 'dev/js',
                        src: '*.js',
                        dest: 'dist/js/ind',
                        ext: '.min.js',
                        flatten: true
                    }]
            },
            vendor: {
                files: [{
                        expand: true,
                        cwd: 'dist/vendor/ind/js',
                        src: '*.js',
                        /*src: [           
							'*.js',
                            '!*.min.js'
                        ],*/
                        dest: 'dist/vendor/ind/js',
                        ext: '.min.js',
                        flatten: true
                    }]
            }
        },
		 concat: {
            minified: {
                src: [
                    'dist/js/ind/emotions.min.js',
                    'dist/js/ind/app.min.js',
                    'dist/js/ind/helpers.min.js',
                    'dist/js/ind/sockets.min.js',
                    'dist/js/ind/api.min.js',
                    'dist/js/ind/api-data.min.js',
                ],
                dest: 'dist/js/livechat.min.js'
            },
            vendor: {
                src: [                    
                    'dist/vendor/ind/js/jquery.min.js', 
                    'dist/vendor/ind/js/socket.min.js', 
                    'dist/vendor/ind/js/mustache.min.js',
                    //'dist/vendor/ind/js/bootstrap.min.js',
                    'dist/vendor/ind/js/jquery-magnific-popup.min.js',
                    'dist/vendor/ind/js/jquery-titlealert.min.js',
                    //'dist/vendor/ind/js/jquery-mousewheel.min.js',
                    //'dist/vendor/ind/js/jquery-jscrollpane.min.js'
                ],
                dest: 'dist/vendor/libraries.min.js'
            }
        },
        imagemin: {
            imgsFolder: {
                options: {
                    optimizationLevel: 7
                },
                files: [{
                        expand: true,
                        cwd: 'dev',
                        src: ['imgs/*.{png,jpg,gif}'],
                        flatten: true,						
                        dest: 'dist/imgs/'
                    }]
            }
        },
        replace: {
            switch_env: {
                src: 'dist/*.html',
                overwrite: true, // overwrite matched source files
                replacements: [
                    {
                        from: "env: 'dev'",
                        to: "env: 'prod'"
                    },{
                        from: "/dev/",
                        to: "/dist/"
                    }]
            },
            update_fonts_path: {
                src: 'dist/css/livechat.min.css',
                overwrite: true, // overwrite matched source files
                replacements: [
                    {
                        from: "../../vendor/bootstrap/fonts/",
                        to: "../fonts/"
                    }]
            },
		}
    });

    require('load-grunt-tasks')(grunt);

    // Default Task is basically a rebuild
    grunt.registerTask('default', ['cssbeautifier', 'prettify']);
    grunt.registerTask('build', ['cssbeautifier', 'prettify', 'copy', 'autoprefixer', 'cssmin', 'concat_css', 'css_selectors', 'uglify', 'concat', 'htmlbuild', 'replace', 'compress'] );
    grunt.registerTask('export', ['compress']);

};
