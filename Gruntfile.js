module.exports = function(grunt) {
	var config = {};
	config.pkg = grunt.file.readJSON("package.json");

	grunt.initConfig(config);

	grunt.registerTask("default", ["build"]);
};