In a Nutshell
=============

BitBuf is a class library implementing an arbitrary bit-length (not
necessarily byte aligned) buffers and bit level manipulation methods
of such buffers.


Reference
=========

BitBuf(bitLength)
-----------------

A constructor for a BitBuf object of given length in bits.

BitBuf.MAX_SIZE
---------------

A maximum size of a BitBuf in bits. This is enforced in constructor.

BitBuf.from = function(src, hint)
---------------------------------

Creates a BitBuf from a string (of '1' and '0' characters) or Buffer
or an integer. The parameter hint can be used in defining a bit length
for the created BitBuf in case it is different from what could be
derived directly from the source material. In particular, it can be
used for allocating a BitBuf from integer with larger bit length that
would be required for storing the said integer, and similarly for
allocatong BigBuf from Buffer, it can be used for including only part
of the bits in the Buffer for the resulting BitBuf. The illegal hint
parameter is simply ignored.

BitBuf.isBitBuf = function(obj)
-------------------------------

Returns true, if parameter is a BitBuf object, otherwise false.

BitBuf.prototype.copy()
-----------------------

Returns a copy of a BitBuf.

BitBuf.prototype.get = function(pos)
------------------------------------

Returns a value (0 or 1) of a bit in a given position within the
BitBuf. The bits are indexed from 0 to BitBuf.length-1. The overflow
causes an exception.

BitBuf.prototype.set = function(pos, val)
-----------------------------------------

Set a value (0 or 1) to the bit in a given position within the
BitBuf. If given value is not 0 or 1, the truth value is used
automatically instead (val ? 1 : 0).

BitBuf.prototype.toggle = function(pos)
---------------------------------------

Toggle a value of the bit in a given position within the BitBuf
(i.e. turn 0 to 1 and 1 to 0).  This should be preferred to
bb.set(pos, bb.get(pos) ? 0 : 1) because it's much faster, but the
result is identical.

BitBuf.concat(arr)
------------------

Concatenate the array of BitBuf objects to a new BitBuf.

BitBuf.prototype.toString
-------------------------

Returns a string representation of a BitBuf i.e. a string consisting
of '0' and '1' characters.

BitBuf.prototype.toInteger = function()
---------------------------------------

Returns an integer representation of a BitBuf. The maximum length of
the BitBuf using this method, is 52 bits. Overflow causes an
exception.


BitBuf.prototype.and = function(bb)
-----------------------------------

Performs an inplace logical AND operation for a BitBuf against the
given BitBuf of the same length. Length mismatch causes an exception.

BitBuf.prototype.or = function(bb)
-----------------------------------

Performs an inplace logical OR operation for a BitBuf against the
given BitBuf of the same length. Length mismatch causes an exception.

BitBuf.prototype.not = function()
-----------------------------------

Performs an inplace inversion of all bits within a bitbuf. Returns the
object itself.

BitBuf.prototype.xor = function(bb)
-----------------------------------

Performs an inplace logical XOR (i.e. exclusive or) operation for a
BitBuf against the given BitBuf of the same length. Length mismatch
causes an exception.

BitBuf.prototype.slice = function(start, end)
---------------------------------------------

Returns a new BitBuf representing a slice of the source BitBuf. If
start offset is zero or omitted, it's the beginning of the BitBuf. If
end offset is zero or omitted, it refers to the end of the
BitBuf. Positive offsets are interpreted in relation to the beginning
of the buffer and negative offsets are interpreted in relation the end
of the buffer. Offset overflows cause exception.

BitBuf.prototype.cmp = function(bb)
-----------------------------------

Compares a BitBuf with a given other BitBuf of the same length and
return -1, 0, 1 respectively if the BitBuf itself is smaller,
identical, or bigger than the one given as parameter. The term bigger
in this context is a BitBuf having a first 1 bit in a position where
the other BitBuf has 0.

BitBuf.prototype.shift = function(n)
------------------------------------

Performs an inplace bitwise shift operation in the BitBuf. The length
of the BitBuf remains the same. Positive parameter shifts right and
the negative one left.

BitBuf.prototype.rot = function(n)
----------------------------------

Performs an inplace bitwise rotate operation in the BitBuf. The length
of the BitBuf remains the same. Positive parameter rotates right and
the negative one left.

BitBuf.prototype.buffer = function()
------------------------------------

Returns an internal Buffer object of the BitBuf object including the
stored data. The length is guaranteed to be number of bytes fitting
all the bits in the BitBuf but not having any extra bytes. Also bits
in the last byte that do not represent a bit in the offset scope of
the BitBuf, are guaranteed to be zero. (e.g. BitBuf.from('1').buffer()
returns <Buffer 80>).


Author
======

Timo J. Rinne <tri@iki.fi>


License
=======

GPL-2.0
