module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['_dev/js/*.js']
    },
    uglify: {
      build: {
        files: [{
          expand: true,
          src: ['js/*.js', '!js/*.min.js'],
          dest: '',
          ext: '.min.js'
        }]
      }
    },
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: '_dev/inc/',
            src: ['**'],
            dest: 'inc/'
          },
          {
            expand: true,
            cwd: '_dev/templates/',
            src: ['**'],
            dest: 'templates/'
          },
          {
            expand: true,
            cwd: '_dev/',
            src: ['*.php'],
            dest: ''
          }
        ]
      }
    },
    concat: {
      dist: {
        src: [
          '_dev/js/models.js',
          '_dev/js/collection.js',
          '_dev/js/view-utilities.js',
          '_dev/js/item-views.js',
          '_dev/js/collection-view.js',
          '_dev/js/init.js'
        ],
        dest: 'js/snowfall-editor.js',
        options: {
          banner: ";(function(window, document, $, Backbone, _, undefined){\n  'use strict';",
          footer: "\n}(this, document, jQuery, Backbone, _));"
        }
      }
    },
    compass: {
      build: {
        options: {
          sassDir: '_dev/css/sass/',
          cssDir: 'css/',
          environment: 'development'
        }
      }
    },
    cssmin: {
      build: {
        files: [{
          expand: true,
          src: ['css/*.css'],
          dest: '',
          ext: '.min.css'
        }]
      }
    },
    watch: {
      scripts: {
        files: ['_dev/**/*'],
        tasks: ['jshint', 'concat', 'uglify', 'compass', 'cssmin', 'copy'],
        options: {
          spawn: false
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'compass', 'cssmin', 'copy', 'watch']);
};
