# Spai [![Build Status](https://secure.travis-ci.org/rhapsodyn/spai.png?branch=master)](http://travis-ci.org/rhapsodyn/spai)

Spai = simplest [promises aplus](http://promisesaplus.com) implementation

## Hello World

```javascript
var promise = Spai.promise(function(resolve, reject){
  // succeed
  resolve(some_value);
  // or reject
  reject(some_reason);
});

promise.then(function(value) {
  // success
}, function(value) {
  // failure
});
```

## Features

As all required by the [specification](http://promisesaplus.com/#requirements)

## Addtional Features

How do you spell 'simplest' ?
