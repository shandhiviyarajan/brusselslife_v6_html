'use strict';

var destination = "_site";
var cwd = "production";
var assets = 'assets/';
var production = false;
var url = "";


module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        site: grunt.file.readYAML('site.yaml'),
        clean: [destination],
        /**
         * Generate static HTMLs
         */
        assemble: {
            options: {
                prettify: {indent: 2},
                marked: {sanitize: false},
                production: true,
                data: '_data/*.{json,yml}',
                assets: '_site/assets/',
                assets_trailing_slash: true,
                layoutdir: '_layouts',
                partials: ['_includes/*.html'],
                flatten: true
            },
            views: {
                files: [
                    {
                        expand: true,
                        cwd: cwd,
                        src: ['**/*.*', '!*.appcache'],
                        dest: destination
                    }
                ]
            }

        },

        /**
         * SASS configurations
         */
        sass: {
            dist: {
                options: {
                    trace: true,
                    style: 'expanded', //nested, compressed, expanded.compact,
                    update: true,
                    sourcemap: 'none'
                },
                files: [
                    {
                        expand: true,
                        cwd: assets + '/sass',
                        src: ['**.scss'],
                        dest: assets + '/css',
                        ext: ".css"
                    },
                ],
            }
        },
        /**
         * Generate plugin.js file
         */
        concat: {
            options: {
                separator: ';',
            },
            dist: {
                // src: ['assets/frameworks/easing/easing.min.js', 'assets/frameworks/fastclick/fastclick.js', 'assets/frameworks/pacejs/pace.min.js', 'assets/frameworks/wow/wow.js','assets/frameworks/scrollTo/smoothscroll.js','assets/frameworks/slider/owl.carousel.min.js','assets/frameworks/parallax/parallax.js'],
                // dest: 'assets/frameworks/plugins/plugins.js',
            },
        },

        /**
         * Copy assets to _site folder
         */
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['assets/**', '!assets/sass/**'],
                        dest: destination
                    },
                ],
            }
        },
        /**
         * Inlinecss for email projects
         */
        inlinecss: {
            main: {
                options: {
                    applyLinkTags: true,
                    applyStyleTags: true,
                    removeStyleTags: false
                },
                files: {
                    'email-project/inline.html': 'email-project/email.html'//inputfile//
                }
            }
        },
        /**
         * Grunt watch
         */

        watch: {
            assemble: {
                files: ['**/**', '!node_modules/**', '!' + destination + '/**'],
                tasks: ['newer:copy', 'assemble']
            },
            options: {
                livereload: true
            },

            //inlinecss:{
            // files:'email-project/index.html',
            //  tasks:['inlinecss']
            //}
        },
        /**
         * Create express server
         */
        express: {
            all: {
                options: {
                    port: 9000,
                    hostname: "localhost",
                    bases: "_site",
                    livereload: true
                    //serverreload: true
                }
            }

        },
        /**
         * Create ftp deployer
         */
        'ftp-diff-deployer': {
            options: {
                retry: 3
            },
            www: {
                options: {
                    host: '',
                    port: 21,
                    auth: {
                        username: 'username',
                        password: 'password'
                    },
                    src: '_site/',
                    dest: '/www/'
                }
            },
        },

        /**
         * SFTP deployment
         */

        'sftp-deploy': {
            build: {
                auth: {
                    host: '188.226.218.12',
                    port: 22,
                    authKey: 'key1'
                },
                cache: 'sftpCache.json',
                src: '/path/to/source/folder',
                dest: '/path/to/destination/folder',
                exclusions: ['/path/to/source/folder/**/.DS_Store', '/path/to/source/folder/**/Thumbs.db', 'dist/tmp'],
                serverSep: '/',
                concurrency: 4,
                progress: true
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'assets/',
                    src: ['/css/main.css', '!*.min.css'],
                    dest: 'assets/css/',
                    ext: '.min.css'
                }]
            }
        }

    });

    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-inline-css');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-ftp-diff-deployer');
    grunt.loadNpmTasks('grunt-sftp-deploy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['clean', 'sass', 'assemble', 'copy', 'concat']);
    grunt.registerTask('ftp', ['clean', 'sass', 'assemble', 'copy', 'ftp-diff-deployer']);
    grunt.registerTask('email', ['inlinecss', 'watch:inlinecss', 'newer:copy']);
    grunt.registerTask('server', ['express', 'watch']);
    grunt.registerTask('plugins', ['concat']);
    grunt.registerTask('cssmin', ['cssmin']);

};