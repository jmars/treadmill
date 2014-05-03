"use strict";
// Implements a simplified https://docs.google.com/document/d/10W46qDNO8Dl0Uye3QX0oUDPYAwaPl0qNy73TVLjd1WI/edit?pli=1#

var Record = require('./list');
var _ = require('lazy.js');
var Sequence = _.createWrapper(function(){});

function objectSizeChange (sequence) {
	if (sequence) {
		var o = this.obj;
		var i = 0, prev = this.lastValue, current = this
		for (var key in o) {
			if (o.hasOwnProperty(key)) {
				i++
				if (i > prev) {
					var record = freshRecord(o, key);
					current = Record.insert(current, record);
					sequence.emit(record)
				}
			}
		}
		return i
	} else {
		return this.lastValue;
	}
}

function arraySizeChange (sequence) {
	if (sequence) {
		var a = this.obj;
		var current = this
		for (var i = this.lastValue, length = a.length; i < length; i++) {
			var record = freshRecord(a, i);
			current = Record.insert(current, record);
			sequence.emit(record);
		}
		return length
	} else {
		return this.lastValue;
	}
}

function checkFields () {
	var prev = treadmill, current = treadmill.next
	for (var i = 10000; (current === treadmill ? false : i); i--) {
		var val = current.getter(sequence)
		if (val === undefined) {
			Record.remove(prev)
		}
		if (val !== current.lastValue) {
			sequence.emit(current);
			current.lastValue = val
		}
		prev = current;
		current = current.next
	}
}

function recordsForContainer (x) {
	if (x instanceof Array) {
		return recordsForArray(x)
	} else if (x instanceof Object) {
		return recordsForObject(x)
	}
}

function recordsForArray (arr) {
	var head = new Record(arr, 'length', arr.length, null, arraySizeChange);
	var tail = head
	for (var i = 0, length = arr.length; i < length; i++) {
		var val = arr[i]
		var record = freshRecord(arr, i);
		tail = Record.insert(tail, record)
	}
	tail.next = head;
	return tail
}

function recordsForObject (obj) {
	var head = new Record(obj, 'size', 0, null, objectSizeChange);
	head.next = head;
	var tail = head, i = 0
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			var val = obj[key]
			var record = freshRecord(obj, key);
			tail = Record.insert(tail, record)
			i++
		}
	}
	head.lastValue = i;
	return tail
}

function freshRecord (obj, key) {
	if (typeof key === 'number') {
		return new Record(obj, key, obj[key],
			null, new Function('return this.obj['+key+']'))
	} else {
		return new Record(obj, key, obj[key],
			null, new Function('return this.obj.'+key))
	}
}

function start () {
	loop = setInterval(checkFields, 100)
}

function stop () {
	clearInterval(loop);
	loop = null
}

function removeRecords (obj) {
	var running = (loop !== null);
	if (running) stop();
	Record.removeMatching(treadmill, 'obj', obj);
	if (running) start();
}

function observe (x) {
	Record.concat(treadmill, recordsForContainer(x))
}

function observeProp (obj, key) {
	Record.insert(treadmill, freshRecord(obj, key))
}

var treadmill = freshRecord({}, '_');
treadmill.next = treadmill;
var sequence = Sequence();
var loop = null

module.exports = {
	changes: sequence,
	observe: observe,
	observeProperty: observeProp,
	start: start,
	stop: stop,
	unObserve: removeRecords
}
