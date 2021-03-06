let OP_toString = Object.prototype.toString,
    OP_hasOwnProperty = Object.prototype.hasOwnProperty;

// Returns the internal class of an object
function getClass(o) {

	if (o === null || o === undefined) return "Object";
	return OP_toString.call(o).slice("[object ".length, -1);
}

// Returns true if the argument is a Date object
function isDate(obj) {

    return getClass(obj) === "Date";
}

// Returns true if the argument is an object
function isObject(obj) {

    return obj && typeof obj === "object";
}

// ES6 Object.is
function sameValue(left, right) {

    if (left === right)
        return left !== 0 || 1 / left === 1 / right;

    return left !== left && right !== right;
}

// Returns true if the arguments are "equal"
function equal(a, b) {

    if (sameValue(a, b))
        return true;

	// Dates must have equal time values
	if (isDate(a) && isDate(b))
		return a.getTime() === b.getTime();

	// Non-objects must be strictly equal (types must be equal)
	if (!isObject(a) || !isObject(b))
		return a === b;

	// Prototypes must be identical.  getPrototypeOf may throw on
	// ES3 engines that don't provide access to the prototype.
	try {

	    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
		    return false;

	} catch (err) {}

	let aKeys = Object.keys(a),
		bKeys = Object.keys(b);

	// Number of own properties must be identical
	if (aKeys.length !== bKeys.length)
		return false;

	for (let i = 0; i < aKeys.length; ++i) {

		// Names of own properties must be identical
		if (!OP_hasOwnProperty.call(b, aKeys[i]))
			return false;

		// Values of own properties must be equal
		if (!equal(a[aKeys[i]], b[aKeys[i]]))
			return false;
	}

	return true;
}

export class Test {

	constructor(logger) {

		this._name = "";
		this._not = false;
		this._logger = logger;
	}

	_(name) {

	    this._name = name;
	    return this;
	}

	name(name) {

		this._name = name;
		return this;
	}

	not() {

		this._not = !this._not;
		return this;
	}

	assert(val) {

		return this._assert(val, {
			method: "assert",
            actual: val,
            expected: true,
		});
	}

	equals(actual, expected) {

		return this._assert(equal(actual, expected), {
			actual,
			expected,
			method: "equal"
		});
	}

	throws(fn, error) {

		let threw = false,
            actual;

		try { fn() }
		catch (x) {
            actual = x;
            threw = (error === undefined || x === error || x instanceof error);
        }

		return this._assert(threw, {
			method: "throws",
            actual,
            expected: error,
		});
	}

	comment(msg) {

	    this._logger.comment(msg);
	}

	_assert(pred, data) {

		let pass = !!pred,
			method = data.method || "";

		if (this._not) {
			pass = !pass;
			method = "not " + method;
		}

		let obj = { name: this._name, pass: pass, method: method };
		Object.keys(data).forEach(k => obj[k] || (obj[k] = data[k]));

		this._logger.log(obj);
		this._not = false;

		return this;
	}

}
