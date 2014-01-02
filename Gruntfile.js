module.exports = function(grunt) {
	var config = {};
	config.pkg = grunt.file.readJSON("package.json");
	config.jshint = {
		files: ["Gruntfile.js", "src/**/*.js", "tests/**/*.js"],
		options: {
			jshintrc: true
		}
	};
	config.uglify = {
		options: {
			banner: '/*! <%= pkg.name %> - by:<%= pkg.author%> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %> */ \n'
		},
		files: {
			src: "src/Spai.js",
			dest: "dest/Spai.min.js"
		}
	};
	config.mochaTest = {
		files: ["tests/promise-aplus-test-suite.js"],
		options: {
			reporter: "dot",
			bail: true
		}
	};

	grunt.initConfig(config);

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-mocha-test");

	grunt.registerTask("default", ["jshint", "mochaTest", "uglify"]);
};