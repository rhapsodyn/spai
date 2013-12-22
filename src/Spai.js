(function (window) {
	//latter overwrite former
	var Spai =  window.Spai || {};
	var isFunction = function (value) {
		return typeof value === "function";
	};

	Spai.promise = function(fn) {
		var promise = {};
		promise.state = "pending";
		promise.then = function (onFulfilled, onRejected) {
		};

		var resolve = function (value) {
			if (promise.state === "pending") {
				promise.state = "fulfilled";
			}
			else {
				return;
			}

			if (promise.onFulfilled) {
				promise.onFulfilled(value);
			}
		};
		var reject = function  (reason) {
			if (promise.state === "pending") {
				promise.state = "rejected";
			}
			else {
				return;
			}

			if (promise.onRejected) {
				promise.onRejected(reason);
			}
		};

		if (isFunction(fn)) {
			fn.call(promise, resolve, reject);
		}
		return promise;
	};

	Spai.defer = function() {
		var deferred = {};
		deferred.promise = Spai.promise(function (resolve, reject) {
			deferred.resolve = resolve;
			deferred.reject = reject;
		});
		return deferred;
	};

	if (typeof module === "object" && module && typeof module.exports === "object") {
		//node env
		module.exports = Spai;
	}
	else {
		//browser env
		window.Spai = Spai;
	}
})(this);