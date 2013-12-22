var Spai = require("../src/Spai");

//deferred is enough
module.exports = {
	// resolved: Spai.resolve,
	// rejected: Spai.reject,
	deferred: Spai.defer
};