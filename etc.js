const Decimal128=require('mongodb').Decimal128

exports.dec2num=function(dec) {
	if (dec==null) return null;
	if (dec._bsontype && dec._bsontype=='Decimal128') return Number(dec.toString());
	return dec;
}

const dedecimal=exports.dedecimal=(obj) =>{
	if (obj==null) return obj;
	if (typeof obj!='object') return obj;
	if (obj._bsontype && obj._bsontype=='Decimal128') return Number(obj.toString());
	for (var k in obj) {
		if (!obj[k] || typeof obj[k]!='object') continue;
		if (obj[k]._bsontype && obj[k]._bsontype=='Decimal128') obj[k]=Number(obj[k].toString());
		else dedecimal(obj[k]);
	}
	return obj;
}

const decimalfy=exports.decimalfy=(o) => {
	for (var k in o) {
		if (typeof o[k]=='number') o[k]=Decimal128.fromString(''+o[k]);
		if (typeof o[k]=='object') {
			if (o[k]._bsontype) continue;
			decimalfy(o[k]);
		}
	}
	return o;
}

exports.ID = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};