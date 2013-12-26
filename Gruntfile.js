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

	};
	config.mochaTest = {
		files: ["tests/promise-aplus-test-suite.js"],
		options: {
			reporter: "dot"
		}
	};

	grunt.initConfig(config);

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-mocha-test");

	grunt.registerTask("default", ["jshint", "mochaTest"]);
	grunt.registerTask("test", ["mochaTest"]);
};