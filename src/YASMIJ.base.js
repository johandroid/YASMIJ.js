/*
* @project YASMIJ.js, "Yet another simplex method implementation in Javascript"
* @author Larry Battle
* @license MIT License <http://www.opensource.org/licenses/mit-license>
* @date 07/02/2012
*/
String.prototype.trim = String.prototype.trim || function(){
	return (this||"").replace(/^\s+|\s+$/g, "");
};
var YASMIJ = {
	// Constraint,
	// Expression,
	// Input,
	// Matrix,
	// Output,
	// Simplex,
	// Tabluea
};

//MIXIN

// Output.prototype.convertToRatio = function(){
	// if(!Ratio){
		// throw new Error( "Ratio.js is required." );
	// }
	// for( var name in this.result ){
		// this.result[name] = Ratio(this.result[name]).reduce().toLocaleString();
	// }
	// return this;
// };

YASMIJ.getUniqueArray = function( arr ){
	var result = [], hash = {};
	if( typeof arr !== "object" || !arr.length ){
		return result;
	}
	for( var i = 0, len = arr.length; i < len; i++ ){
		if(!hash[ arr[i] ]){
			result.push( arr[i] );
			hash[ arr[i] ] = 1;
		}
	}
	return result;
};
YASMIJ.areObjectsSame = function(obj1, obj2){
	var a, b;
	if( obj1 === obj2 ){
		return true;
	}
	if( !(obj1 instanceof obj2.constructor) ){
		return false;
	}
	for(var prop in obj1 ){
		if( !obj1.hasOwnProperty( prop ) ){
			continue;
		}
		a = obj1[ prop ];
		b = obj2[ prop ];
		if( typeof a === "object" ){
			if( typeof a !== typeof b){
				return false;
			}
			if( !YASMIJ.areObjectsSame( a, b )){
				return false;
			}
		}else{
			if( a.toString() !== b.toString() ){
				return false;
			}
		}
	}
	return true;
};