"use strict";

function Record (obj, field, lastValue, next, getter) {
	this.obj = obj;
	this.field = field;
	this.lastValue = lastValue;
	this.next = next;
	this.getter = getter;
	return this
}

Record.concat = function concat (first, second) {
	var secondhead = second.next;
	second.next = first.next;
	first.next = secondhead;
	return first
}

Record.insert = function insert (list, record) {
	record.next = list.next;
	list.next = record;
	return record
}

Record.remove = function remove (record) {
	record.next = record.next.next;
	return record
}

Record.removeMatching = function removeMatching (list, property, value) {
	while (current !== list) {
		var current = list;
		if (current.next[property] === value) {
			current.next = current.next.next
		}
		current = current.next
	}
	return list
}

module.exports = Record;
