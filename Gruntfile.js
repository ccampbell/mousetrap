/*jshint node:true */
module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        mocha: {
            options: {
                reporter: 'Nyan',
                run: true
            },
            mousetrap: {
                src: ['tests/mousetrap.html']
            }
        },

        complexity: {
            options: {
                errorsOnly: false,
                cyclomatic: 10,
                halstead: 30,
                maintainability: 85
            },
            generic: {
                src: [
                    'mousetrap.js'
                ]
            },
            plugins: {
                src: [
                    'plugins/**/*.js',
                    '!plugins/**/tests/**',
                    '!plugins/**/*.min.js'
                ]
            }
        },

        shell: {
            'meteor-test': {
                command: 'meteor/runtests.sh'
            },
            'meteor-publish': {
                command: 'meteor/publish.sh'
            }
        }

    });

    grunt.loadNpmTasks('grunt-complexity');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-shell');

    // Meteor tasks
    grunt.registerTask('meteor-test', 'shell:meteor-test');
    grunt.registerTask('meteor-publish', 'shell:meteor-publish');
    // Ideally we'd run tests before publishing, but the chances of tests breaking (given that
    // Meteor is orthogonal to the library) are so small that it's not worth the maintainer's time
    // grunt.regsterTask('meteor', ['shell:meteor-test', 'shell:meteor-publish']);
    grunt.registerTask('meteor', 'shell:meteor-publish');

    grunt.registerTask('default', [
        'complexity',
        'mocha'
    ]);
};
