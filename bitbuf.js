'use strict';

const pad = require('./pad.js');

function BitBuf(bitLength, fill) {
    if (! bitLength) {
		bitLength = 0;
    } else if (! (Number.isSafeInteger(bitLength) &&
				  (bitLength >= 0) &&
				  (bitLength <= BitBuf.MAX_SIZE))) {
		throw new Error('Illegal length for BitBuf');
    }
    this.length = bitLength;
    this.buf = Buffer.alloc((bitLength >> 3) + ((bitLength & 7) ? 1 : 0), fill ? 1 : 0);
}

BitBuf.MAX_SIZE = 16 * 1024 * 1024 * 8;

BitBuf.bitOffset = function(pos) {
    return [ pos >> 3, (7 - (pos & 7)) ];
}

function lu(buf, idx) {
    return ((idx >= 0) && (idx < buf.length)) ? buf[idx] : 0;
}

BitBuf.prototype.buffer = function() {
    this.trim();
    return this.buf;
};

BitBuf.prototype.trim = function() {
    var bl = ((this.length >> 3) + ((this.length & 7) ? 1 : 0)), o = BitBuf.bitOffset(this.length - 1);
    if (this.buf.length > bl) {
		this.buf = this.buf.slice(0, bl);
    }
    if (o[1] != 0) {
		this.buf[o[0]] &= (255 ^ ((1 << o[1]) - 1));
    }
	return this;
};

BitBuf.isBitBuf = function(obj) {
    return (obj &&
			(typeof(obj) === 'object') &&
			(obj instanceof BitBuf) &&
			Buffer.isBuffer(obj.buf) &&
			Number.isSafeInteger(obj.length) &&
			(obj.length >= 0) &&
			(obj.buf.length >= ((obj.length >> 3) + ((obj.length & 7) ? 1 : 0))));
};

BitBuf.from = function(src, hint) {
    var r, i, c;
    if (Number.isSafeInteger(src) && (src >= 0)) {
		src = src.toString(2);
		if (Number.isSafeInteger(hint) &&
			(hint > src.length) && 
			(hint <= BitBuf.MAX_SIZE)) {
			src = pad.padStart(src, hint, '0');
		}
    }
    if (BitBuf.isBitBuf(src)) {
		r = new BitBuf(0);
		r.length = src.length;
		r.buf = Buffer.from(src.buf);
    } else if (typeof(src) === 'string') {
		r = new BitBuf(src.length);
		for (i = 0; i < src.length; i++) {
			c = src.charAt(i);
			if (c === '1') {
				r.set(i, 1);
			} else if (c !== '0') {
				throw new Error('Illegal BitBuf input string');
			}
		}
    } else if (Buffer.isBuffer(src)) {
		if (src.length > 0) {
			r = new BitBuf(0);
			if (Number.isSafeInteger(hint) &&
				(hint < (src.length * 8)) &&
				(hint >= 0) &&
				(hint <= BitBuf.MAX_SIZE)) {
				if (hint > 0) {
					r.buf = Buffer.from(src.slice(0, (hint >> 3) + ((hint & 7) ? 1 : 0) + 1));
					r.length = hint;
				}
			} else {
				r.buf = Buffer.from(src);
				r.length = src.length * 8;
			}
		} else {
			r = new BitBuf(0);
		}
    } else if (Array.isArray(src)) {
		r = new BitBuf(src.length);
		for (i = 0; i < src.length; i++) {
			if (src[i]) {
				r.set(i, 1);
			}
		}
    } else {
		throw new Error('Illegal BitBuf input');
    }
    return r;
};

BitBuf.prototype.checkOffset = function(pos, doNotThrowError) {
    if (! (Number.isSafeInteger(pos) && (pos >= 0) && (pos < this.length))) {
		if (doNotThrowError) {
			return false;
		}
		throw new Error('Illegal BitBuf offset');
    }
    return true;
};

BitBuf.prototype.get = function(pos) {
    this.checkOffset(pos);
    var o = BitBuf.bitOffset(pos);
    return (this.buf[o[0]] >> o[1]) & 1;
};

BitBuf.prototype.set = function(pos, val) {
    this.checkOffset(pos);
    var o = BitBuf.bitOffset(pos);
    if (val) {
		this.buf[o[0]] |= 1 << o[1];
    } else {
		this.buf[o[0]] &= 255 ^ (1 << o[1]);
    }
};

BitBuf.prototype.toggle = function(pos) {
    this.checkOffset(pos);
    var o = BitBuf.bitOffset(pos);
	this.buf[o[0]] ^= 1 << o[1];
};


BitBuf.prototype.copy = function() {
    var r = new BitBuf(0);
    this.trim();
    r.buf = Buffer.from(this.buf);
    r.length = this.length;
    return r;
};

BitBuf.prototype.slice = function(start, end) {
    if (! start) {
		start = 0;
    } else if (! Number.isSafeInteger(start)) {
		throw new Error('Illegal BitBuf offset');
    } else if (start > this.length) {
		throw new Error('Illegal BitBuf offset');
    } else if (start < 0) {
		start = this.length - start;
    }
    if (start < 0) {
		throw new Error('Illegal BitBuf offset');
    }
    if (! end) {
		end = this.length;
    } else if (! Number.isSafeInteger(end)) {
		throw new Error('Illegal BitBuf offset');
    } else if (end > this.length) {
		throw new Error('Illegal BitBuf offset');
    } else if (end < 0) {
		end = this.length - end;
    }
    if (end < start) {
		throw new Error('Illegal BitBuf offset');
    }
    var o1 = BitBuf.bitOffset(start), o2 = BitBuf.bitOffset(end);
    var b = Buffer.from(this.buf.slice(o1[0], o2[0] + 1));
    var i, m = (1 << (o1[1] + 1)) - 1;
    if (o1[1] != 7) {
		for (i = 0; i < (o2[0] - o1[0]); i++) {
			b[i] = ((b[i] & m) << (7 - o1[1])) | (b[i + 1] >> (o1[1] + 1));
		}
		b[i] = ((b[i] & m) << (7 - o1[1]));
    }
    var r = new BitBuf(0);
    r.buf = b;
    r.length = end - start;
    return r;
};

BitBuf.prototype.toString = function() {
    var i, r = '';
    for (i = 0; i < this.buf.length; i++) {
		r += pad.padStart(this.buf[i].toString(2), 8, '0');
    }
    return r.slice(0, this.length);
};

BitBuf.prototype.toInteger = function() {
    var i, o, r;
    if (this.length == 0) {
		return 0;
    }
    if (this.length > 52) {
 		throw new Error('BitBuf size too long for integer export');
    }
    o = BitBuf.bitOffset(this.length - 1);
    r = 0;
    for (i = 0; i < o[0]; i++) {
		r = (r * 256) + this.buf[i];
    }
    for (i = 7; i >= o[1]; i--) {
		r = (r * 2) + ((this.buf[o[0]] >> i) & 1);
    }
    return r;
};


BitBuf.prototype.xor = function(bb) {
    var i, l;
    if (! BitBuf.isBitBuf(bb)) {
 		throw new Error('Illegal input for BitBuf xor');
    }
    if (this.length != bb.length) {
 		throw new Error('BitBuf size mismatch');
    }
    l = Math.min(this.buf.length, bb.buf.length);
    for (i = 0; i < l; i++) {
		this.buf[i] ^= bb.buf[i];
    }
    return this;
};

BitBuf.prototype.and = function(bb) {
    var i, l;
    if (! BitBuf.isBitBuf(bb)) {
 		throw new Error('Illegal input for BitBuf xor');
    }
    if (this.length != bb.length) {
 		throw new Error('BitBuf size mismatch');
    }
    l = Math.min(this.buf.length, bb.buf.length);
    for (i = 0; i < l; i++) {
		this.buf[i] &= bb.buf[i];
    }
    return this;
};

BitBuf.prototype.or = function(bb) {
    var i, l;
    if (! BitBuf.isBitBuf(bb)) {
 		throw new Error('Illegal input for BitBuf xor');
    }
    if (this.length != bb.length) {
 		throw new Error('BitBuf size mismatch');
    }
    l = Math.min(this.buf.length, bb.buf.length);
    for (i = 0; i < l; i++) {
		this.buf[i] |= bb.buf[i];
    }
    return this;
};

BitBuf.prototype.not = function() {
    var i;
    for (i = 0; i < this.buf.length; i++) {
		this.buf[i] ^= 255;
    }
    return this;
};

BitBuf.prototype.cmp = function(bb) {
    if (! BitBuf.isBitBuf(bb)) {
 		throw new Error('Illegal input for BitBuf xor');
    }
    if (bb.length != this.length) {
 		throw new Error('BitBuf size mismatch');
    }
    return this.buffer().compare(bb.buffer());
};

// This should be optimized, but I'm lazy.
BitBuf.concat = function(arr) {
    var r = '';
    if (! Array.isArray(arr)) {
		throw new Error('Array required for BitBuf concat');
    }
    arr.forEach(function(x) {
	    if (! BitBuf.isBitBuf(x)) {
			throw new Error('Non-BitBuf element in concat array');
	    }
	    r += x.toString();
	});
    return BitBuf.from(r);
};

BitBuf.prototype.shift = function(n) {
	var bb;
	if (! Number.isSafeInteger(n)) {
		throw new Error('Illegal BitBuf offset');
	}
	this.trim();
	if (n > 0) {
		// Positive shifts right
		if (n >= this.length) {
			this.buf.fill(0)
		} else {
			// This should be optimized, but I'm lazy.
			bb = BitBuf.from(pad.padStart(this.toString().slice(0, this.length - n), this.length, '0'));
			this.buf = bb.buf;
			this.length = bb.length;
		}
	} else if (n < 0) {
		// Negative shifts left
		n = -n;
		if (n >= this.length) {
			this.buf.fill(0)
		} else {
			// This should be optimized, but I'm lazy.
			bb = BitBuf.from(pad.padEnd(this.toString().slice(n, this.length), this.length, '0'));
			this.buf = bb.buf;
			this.length = bb.length;
		}
	}
	return this;
};

BitBuf.prototype.rot = function(n) {
	if (! Number.isSafeInteger(n)) {
		throw new Error('Illegal BitBuf offset');
	}
	this.trim();
	n %= this.length;
	if (n < 0) {
		n += this.length;
	}
	if (n != 0) {
		// This should be optimized, but I'm lazy.
		var s = this.toString();
		var bb = BitBuf.from(s.slice(this.length - n, this.length) + s.slice(0, this.length - n));
		this.buf = bb.buf;
		this.length = bb.length;
	}
	return this;
};

module.exports = BitBuf;
