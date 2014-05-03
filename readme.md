# The Treadmill
A zero-allocation change detection library for plain javascript objects.

## Usage
```javascript
"use strict";
var Treadmill = require('treadmill');

Treadmill.start();

var test = {
	foo: 'bar'
}

Treadmill.observe(test);

Treadmill.changes.each(function(change){
	console.log(change.obj, change.field, change.lastValue, change.getter())
});

test.baz = 'new prop'
test.foo = 'changed prop'

Treadmill.unObserve(test);
Treadmill.pause();
```
```
{foo: 'bar'}  size  1 2
{foo: 'bar'}  baz  undefined 'new prop'
{foo: 'bar', baz: 'new prop'} foo 'bar' 'changed prop'
```

## But won't this be slow?
Nope, care has been taken to make sure that the only time this allocates is when it needs to monitor a new property. So it is GC Stable, this is; it does not cause any memory pressure while it runs. On a modern desktop in a modern VM this will use well less than 1% cpu even with hundreds of watched properties. But be aware that because it uses a runloop, change notifications are not instant, but certainly should be within 100ms of the change. 100ms response is about what is needed for a user to feel that something was 'instant'.
