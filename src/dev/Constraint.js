/**
 * @project {{=it.name}}
 * @author Larry Battle
 * @license {{=it.license.overview}}
 * @date 07/08/2012
 */

/**
 * Create an Constraint Object.
 * Goals for the Constraint Object:
 * - Convert String to Object such that the terms, constants and sign and be easily accessed.
 * - Allow for terms to be moved from one side to the other.
 * - The standard will be (variables, ...) (comparison) (constants)
 *
 * @constructor
 * @returns {Constraint}
 */
var Constraint = function () {
	this.comparison = "";
	this.leftSide = {};
	this.rightSide = {};
	this.slackValue = 0;
	this.terms = {};
	return this;
};
/**
 * Used to convert strict inequalities to non-strict.
 */
Constraint.EPSILON = 1e-6;
/**
 * Checks to see if an object equals the current instance of Constraint.
 */
Constraint.equals = function (obj) {
	return mixin.areObjectsSame(this, obj);
};
/**
 * Checks to see if a string has more than one of these symbols; ">", "<", ">=", "<=", "=".
 *
 * @param {String} str
 * @returns {Boolean}
 * @example Constraint.hasManyCompares( "a < b < c" ) == true;
 */
Constraint.hasManyCompares = function (str) {
	var RE_compares = /[<>]=?|=/g;
	var matches = ("" + str).replace(/\s/g, "").match(RE_compares) || [];
	return 1 < matches.length;
};
/**
 * Checks to see if a string doesn't have a left and right terms with each addition and subtraction operation.
 *
 * @param {String} str
 * @returns {Boolean}
 * @example Constraint.hasIncompleteBinaryOperator( "a + b +" ) == true;
 */
Constraint.hasIncompleteBinaryOperator = function (str) {
	var noSpaceStr = ("" + str).replace(/\s/g, ""),
	hasNoOperatorBetweenValues = /[^+\-><=]\s+[^+\-><=]/.test(("" + str)),
	RE_noLeftAndRightTerms = /[+\-][><=+\-]|[><=+\-]$/;
	
	return RE_noLeftAndRightTerms.test(noSpaceStr) || hasNoOperatorBetweenValues;
};
/**
 * Checks to see if string comply with standards.
 *
 * @param {String} str
 * @returns {String} Error message
 * @example Constraint.getErrorMessage( "a + b" ) == null;
 */
Constraint.getErrorMessage = function (str) {
	var errMsg;
	if (Constraint.hasManyCompares(str)) {
		errMsg = "Only 1 comparision (<,>,=, >=, <=) is allow in a Constraint.";
	}
	if (!errMsg && Constraint.hasIncompleteBinaryOperator(str)) {
		errMsg = "Math operators must be in between terms. Good:(a+b=c). Bad:(a b+=c)";
	}
	return errMsg;
};
/**
 * Checks to see if string doesn't comply with standards.
 *
 * @param {String} str
 * @throws Error
 * @example Constraint.checkInput( "a / b" ); // throws Error();
 */
Constraint.checkInput = function (str) {
	var errMsg = Constraint.getErrorMessage(str);
	if (errMsg) {
		throw new Error(errMsg);
	}
};
/**
* For all the term types in sideA, move them over to sideB using the provided function.
*/
Constraint.switchSides = function (sideA, sideB, forEachTermFunc) {
	forEachTermFunc.call(sideA, function (name, value) {
		sideB.addTerm(name, -value);
		sideA.removeTerm(name);
	});
};
/**
 * Returns an array of variables without the coefficients.
 *
 * @param {Object} obj
 * @returns {Array}
 * @example Constraint.parse("a = cats + 30").getTermNames(); // returns ["a", "cats", "30" ]
 */
Constraint.prototype.getTermNames = function () {
	var arr = [].concat(this.leftSide.getTermNames(), this.rightSide.getTermNames());
	return mixin.getUniqueArray(arr);
};
/**
 *
 *
 * @param {String}
 * @returns {Object}
 * @example
 */
Constraint.parseToObject = function (str) {
	Constraint.checkInput(str);
	var RE_comparison = /[><]=?|=/;
	var arr = ("" + str).split(RE_comparison);
	var obj = {
		rhs : Expression.parse("0"),
		comparison : "="
	};
	obj.lhs = Expression.parse(arr[0]);
	if (1 < arr.length) {
		obj.rhs = Expression.parse(arr[1]);
		obj.comparison = "" + RE_comparison.exec(str);
	}
	return obj;
};
/**
 * Converts a string to an Constraint Object.
 *
 * @param {String}
 * @returns {Constraint}
 * @example
 */
Constraint.parse = function (str) {
	var obj = Constraint.parseToObject(str),
	e;
	if (obj) {
		e = new Constraint();
		e.comparison = obj.comparison;
		e.leftSide = obj.lhs;
		e.rightSide = obj.rhs;
	}
	return e;
};
/**
 * Returns a string representation of the Constraint Object.r
 */
Constraint.prototype.toString = function () {
	return [this.leftSide, this.comparison, this.rightSide].join(" ");
};
/**
 * Return an object that represents the sides left to right or vice versa.
 *
 * @param {String} side - `left` or `right`
 * @returns {Object} sides
 * @see Constraint.prototype.switchSides
 * @example
 */
Constraint.prototype.getSwappedSides = function (doSwap) {
	return {
		a : (!doSwap ? this.leftSide : this.rightSide),
		b : (doSwap ? this.leftSide : this.rightSide)
	};
};
/**
 *
 *
 * @param {String}
 * @returns {Object}
 * @example
 */
// Constraint.prototype.switchSides = function (sides, forEachTermFunc) {
	// if (!sides || typeof sides !== "object" || typeof func !== "function") {
		// return this;
	// }
	// forEachTermFunc(function (name, value, terms) {
		// sides.b.addTerm(name, -value);
		// sides.a.removeTerm(name);
	// });
	// return this;
// };

/**
 *
 *
 * @param {String}
 * @returns {Object}
 * @example
 */
Constraint.prototype.moveTypeToOneSide = function (varSide, numSide) {
	var varSides,
		numSides;
		
	if (/left|right/.test(varSide)) {
		varSides = this.getSwappedSides( /left/.test(varSide) );
		Constraint.switchSides(varSides.a, varSides.b, varSides.a.forEachVariable);
	}
	if (/left|right/.test(numSide)) {
		numSides = this.getSwappedSides(/left/.test(numSide));
		Constraint.switchSides(numSides.a, numSides.b, numSides.a.forEachConstant);
	}
	return this;
};
/**
 *
 *
 * @param {String}
 * @returns {Object}
 * @example
 */
Constraint.prototype.inverse = function () {
	this.leftSide.inverse();
	this.rightSide.inverse();
	return this;
};
/**
 *
 *
 * @param {String}
 * @returns {Object}
 * @example
 */
Constraint.prototype.negateComparison = function () {
	var oppositeCompare = {
		">=" : "<",
		">" : "<=",
		"<=" : ">",
		"<" : ">="
	};
	if (oppositeCompare[this.comparison]) {
		this.comparison = oppositeCompare[this.comparison];
		this.inverse();
	}
	return this;
};
/**
 *
 *
 * @param {String}
 * @returns {Object}
 * @example
 */
Constraint.prototype.removeStrictInEquality = function () {
	var eps;
	if (this.comparison == "<" || this.comparison == ">") {
		this.comparison += "=";
		eps = Constraint.EPSILON * ( />/.test( this.comparison ) ? 1 : -1);
		this.rightSide.addTerm("1", eps);
	}
	return this;
};
/**
 * Places the constants on the right and the variables on the left hand side.
 */
Constraint.prototype.normalize = function () {
	return this.moveTypeToOneSide("left", "right").removeStrictInEquality();
};
/**
 *
 *
 * @param {String}
 * @returns {Object}
 * @example
 */
Constraint.prototype.addSurplus = function(){
	this.slackValue = -1;
	this.leftSide.addTerm( "surplus", -1 );
};
Constraint.prototype.addSlack = function(){
	this.slackValue = 1;
	this.leftSide.addTerm( "slack", 1 );
};
Constraint.prototype.getStandardMaxForm = function () {
	this.normalize();
	if (this.comparison == "<=") {
		this.addSlack();
	}
	else if (this.comparison == ">=") {
		this.addSurplus();
	}
	this.comparison = "=";
	return this;
};
Constraint.prototype.scale = function ( factor ) {
	this.leftSide.scale( factor );
	this.rightSide.scale( factor );
	return this;
};
Constraint.prototype.varSwitchSide = function ( name, moveTo ) {
	if( !/left|right/.test(moveTo) ){
		return this;
	}
	name = ( isNaN( name ) ) ? name : "1";
	var sideA = ( "left" === moveTo ) ? this.rightSide : this.leftSide,
		sideB = ( "left" !== moveTo ) ? this.rightSide : this.leftSide;
		
	if( sideA.hasTerm( name ) ){
		sideB.addTerm( name, -sideA.getTermValue( name ) );
		sideA.removeTerm( name );
	}
	return this;
};





