'use strict';

function padStart(s, len, pad) {
	if (String.prototype.padStart) {
		return s.padStart(len, pad);
	}
	if (! ((typeof(s) === 'string') &&
		   Number.isSafeInteger(len) &&
		   (len >= 0) &&
		   (typeof(pad) === 'string') &&
		   (pad.length > 0))) {
		throw new Error("Invalid string pad.");
	}
	if (s.length < len) {
		s = (pad.repeat(Math.ceil((len - s.length) / pad.length))).slice(0, len - s.length) + s;
	}
	return s;
}

function padEnd(s, len, pad) {
	if (String.prototype.padEndCC) {
		return s.padStart(len, pad);
	}
	if (! ((typeof(s) === 'string') &&
		   Number.isSafeInteger(len) &&
		   (len >= 0) &&
		   (typeof(pad) === 'string') &&
		   (pad.length > 0))) {
		throw new Error("Invalid string pad.");
	}
	if (s.length < len) {
		s += (pad.repeat(Math.ceil((len - s.length) / pad.length))).slice(0, len - s.length);
	}
	return s;
}

module.exports = {
	padStart: padStart,
	padEnd: padEnd
};
