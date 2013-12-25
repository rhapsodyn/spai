(function (window) {
	//latter overwrite former
	var Spai =  window.Spai || {};

	var isFunction = function (value) {
		return typeof value === "function";
	};
	var allStates = {
		pending: 0,
		fulfilled: 1,
		rejected: 2
	};
	var mutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	var callbackQueue = [];
	var invoke = function () {
		for (var i = 0; i < callbackQueue.length; i++) {
			var tuple = callbackQueue[i],
				fn = tuple[0],
				arg = tuple[1];

			try {
				fn(arg);
			}
			catch (e) {

			}
		}
		callbackQueue = [];
	};
	//steal form rsvp.js
	var flush = (function () {
		//node env
		if (typeof process !== 'undefined' && toString.call(process) === '[object process]') {
			return function() {
				process.nextTick(invoke);
			};
		//modern browser
		} else if (mutationObserver) {
			//todo
		//old browser
		} else {
			//todo
		}
	})();
	var asycnInvoke = function (fn, arg) {
		callbackQueue.push([fn, arg]);
		flush();
	};

	Spai.promise = function (fn) {
		var promise = {};
		//private properties
		var _state = allStates.pending,
			_onFulfilledQueue = [],
			_onRejectedQueue = [],
			_resolveValue,
			_rejectedReason;
		promise.then = function (onFulfilled, onRejected) {
			var returnValue;
			if (_state === allStates.fulfilled && isFunction(onFulfilled)) {
				asycnInvoke(onFulfilled, _resolveValue);
			}
			else if (_state === allStates.rejected && isFunction(onRejected)) {
				asycnInvoke(onRejected, _rejectedReason);
			}
			else {
				_onFulfilledQueue.push(onFulfilled);
				_onRejectedQueue.push(onRejected);
			}	

			//THIS LINE is A BUG!
			return promise;
		};

		var resolve = function (value) {
			if (_state === allStates.pending) {
				_state = allStates.fulfilled;
				_resolveValue = value;
			}
			else {
				return;
			}

			for (var i = 0; i < _onFulfilledQueue.length; i++) {
				asycnInvoke(_onFulfilledQueue[i], _resolveValue);
			}
		};
		var reject = function (reason) {
			if (_state === allStates.pending) {
				_state = allStates.rejected;
				_rejectedReason = reason;
			}
			else {
				return;
			}

			for (var i = 0; i < _onRejectedQueue.length; i++) {
				asycnInvoke(_onRejectedQueue[i], _rejectedReason);
			}
		};

		if (isFunction(fn)) {
			fn.call(this, resolve, reject);
		}
		return promise;
	};

	//meets test suite's need
	Spai.defer = function () {
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