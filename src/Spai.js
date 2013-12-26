(function(window) {
	//latter overwrite former
	var Spai = window.Spai || {};

	var isFunction = function(value) {
		return typeof value === "function";
	};
	var allStates = {
		pending: 0,
		fulfilled: 1,
		rejected: 2,
		sealed: 3 //once resolve or reject
	};
	var mutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	//steal form rsvp.js
	var asyncInvoke = (function() {
		if (typeof process !== 'undefined' && toString.call(process) === '[object process]') {
			//node env
			return function(callback) {
				process.nextTick(callback);
			};
		} else if (mutationObserver) {
			//modern browser
			//todo
			return function(callback) {
				setTimeout(callback, 1);
			};
		} else {
			//old browser
			return function(callback) {
				setTimeout(callback, 1);
			};
		}
	})();
	var progress = function(thenable, onFulfilled, onRejected, child) {
		var resolveChild = function(value) {
			child._state = allStates.fulfilled;
			child._resolveValue = value;
		},
			rejectChild = function(reason) {
				child._state = allStates.rejected;
				child._rejectedReason = reason;
			};

		if (thenable._state === allStates.fulfilled) {
			if (isFunction(onFulfilled)) {
				try {
					var returnVal = onFulfilled(thenable._resolveValue);
					resolveChild(returnVal);
				} catch (e) {
					rejectChild(e);
				}
			} else {
				resolveChild(thenable._resolveValue);
			}
		} else if (thenable._state === allStates.rejected) {
			if (isFunction(onRejected)) {
				try {
					var returnVal = onRejected(thenable._rejectedReason);
					resolveChild(returnVal);
				} catch(e) {
					rejectChild(e);
				}
			} else {
				rejectChild(thenable._rejectedReason);
			}
		}
	};
	var resolveAll = function(thenable, value) {
		thenable._state = allStates.fulfilled;
		for (var i = 0, queue = thenable._thenQueue; i < queue.length; i++) {
			var tuple = queue[i];
			var onFulfilled = tuple[allStates.fulfilled],
				onRejected = tuple[allStates.rejected],
				child = tuple[3];

			progress(thenable, onFulfilled, onRejected, child);
			resolveAll(child, value);
		}
	};
	var resolve = function(thenable, value) {
		if (thenable._state !== allStates.pending) {
			return;
		}
		thenable._state = allStates.sealed;
		thenable._resolveValue = value;

		asyncInvoke(function() {
			resolveAll(thenable, value);
		});
	};
	var rejectAll = function(thenable, reason) {
		thenable._state = allStates.rejected;
		for (var i = 0, queue = thenable._thenQueue; i < queue.length; i++) {
			var tuple = queue[i];
			var onFulfilled = tuple[allStates.fulfilled],
				onRejected = tuple[allStates.rejected],
				child = tuple[3];

			progress(thenable, onFulfilled, onRejected, child);
			rejectAll(child, reason);
		}
	};
	var reject = function(thenable, reason) {
		if (thenable._state !== allStates.pending) {
			return;
		}
		thenable._state = allStates.sealed;
		thenable._rejectedReason = reason;

		asyncInvoke(function() {
			rejectAll(thenable, reason);
		});
	};
	var makeThenable = function() {
		var thenable = {
			_thenQueue: [],
			_state: allStates.pending
		};

		thenable.then = function(onFulfilled, onRejected) {
			var child = makeThenable();
			if (thenable._state === allStates.fulfilled || thenable._state === allStates.rejected) {
				asyncInvoke(function() {
					progress(thenable, onFulfilled, onRejected, child);
				});
			} else {
				//tuple[0] is just for pretty and clean
				thenable._thenQueue.push([0, onFulfilled, onRejected, child]);
			}
			return child;
		};

		return thenable;
	};
	Spai.promise = function(initCallback) {
		var promise = makeThenable();
		var resolveWrapper = function(value) {
			resolve(promise, value);
		};
		var rejectWrapper = function(reason) {
			reject(promise, reason);
		};

		if (isFunction(initCallback)) {
			initCallback.call(this, resolveWrapper, rejectWrapper);
		}

		return promise;
	};

	//meets test suite's need
	Spai.defer = function() {
		var deferred = {};
		deferred.promise = Spai.promise(function(resolve, reject) {
			deferred.resolve = resolve;
			deferred.reject = reject;
		});
		return deferred;
	};

	if (typeof module === "object" && module && typeof module.exports === "object") {
		//node env
		module.exports = Spai;
	} else {
		//browser env
		window.Spai = Spai;
	}
})(this);