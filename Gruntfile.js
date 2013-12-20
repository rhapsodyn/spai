module.exports = function(grunt) {
	var config = {};
	config.pkg = grunt.file.readJSON("package.json");
	config.jshint = {
		src: ["Gruntfile.js", "src/**/*.js", "tests/**/*.js"]
	};	
	config.uglify = {

	};
	config.mochaTest = {
		src: ["tests/mocha-test-suite.js"],
		options: {
			reporter: "spec"
		}
	};

	grunt.initConfig(config);

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-mocha-test");

	grunt.registerTask("default", ["jshint", "mochaTest"]);
};