//todo: merge _rejectedReason and _resolvedValue into _detail
(function(window) {
	//latter overwrite former
	var Spai = window.Spai || {};

	var isFunction = function(x) {
		return typeof x === "function";
	};
	var isObject = function(x) {
		return typeof x === "object" && x !== null
	};
	var allStates = {
		pending: 0,
		fulfilled: 1,
		rejected: 2,
		sealed: 3 //once resolve or reject
	};
	//easy to debug
	var cid = 0;
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
			//todo: this impl is not RIGHT
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
			child._resolvedValue = value;
		},
			rejectChild = function(reason) {
				child._state = allStates.rejected;
				child._rejectedReason = reason;
			},
			handleReturn = function(value) {
				if (value === child) {
					rejectChild(new TypeError("thenable can not return the same promise"));
				} else if (isFunction(value) || isObject(value)) {
					//this line is SOMETHING!
					var then = value.then;
					if (isFunction(then)) {
						then.call(value, function(y) {
							resolve(child, y);
						}, function(r) {
							reject(child, r);
						});
					} else {
						resolveChild(value);
					}
				} else {
					resolveChild(value);
				}
			};

		if (thenable._state === allStates.fulfilled) {
			if (isFunction(onFulfilled)) {
				try {
					var returnVal = onFulfilled(thenable._resolvedValue);
					handleReturn(returnVal);
				} catch (e) {
					rejectChild(e);
				}
			} else {
				resolveChild(thenable._resolvedValue);
			}
		} else if (thenable._state === allStates.rejected) {
			if (isFunction(onRejected)) {
				try {
					var returnVal = onRejected(thenable._rejectedReason);
					handleReturn(returnVal);
				} catch (e) {
					rejectChild(e);
				}
			} else {
				rejectChild(thenable._rejectedReason);
			}
		}
	};
	var progressAll = function(thenable, state) {
		if (state) {
			thenable._state = state;
		}
		for (var i = 0, queue = thenable._thenQueue; i < queue.length; i++) {
			var tuple = queue[i];
			var onFulfilled = tuple[allStates.fulfilled],
				onRejected = tuple[allStates.rejected],
				child = tuple[3];

			progress(thenable, onFulfilled, onRejected, child);
			progressAll(child);
		}
	}
	var resolve = function(thenable, value) {
		if (thenable._state !== allStates.pending) {
			return;
		}
		thenable._state = allStates.sealed;
		thenable._resolvedValue = value;

		asyncInvoke(function() {
			progressAll(thenable, allStates.fulfilled);
		});
	};
	var reject = function(thenable, reason) {
		if (thenable._state !== allStates.pending) {
			return;
		}
		thenable._state = allStates.sealed;
		thenable._rejectedReason = reason;

		asyncInvoke(function() {
			progressAll(thenable, allStates.rejected);
		});
	};
	var makeThenable = function() {
		var thenable = {
			_thenQueue: [],
			_state: allStates.pending,
			_id: ++cid
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