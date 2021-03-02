module.exports = {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

};

Math.round10 = function(value, exp) {
  return mathExtend.decimalAdjust('round', value, exp);
};

Math.floor10 = function(value, exp) {
  return mathExtend.decimalAdjust('floor', value, exp);
};

Math.ceil10 = function(value, exp) {
  return mathExtend.decimalAdjust('ceil', value, exp);
};

/*
  // Round
  round10(55.55, -1);   // 55.6
  round10(55.549, -1);  // 55.5
  round10(55, 1);       // 60
  round10(54.9, 1);     // 50
  round10(-55.55, -1);  // -55.5
  round10(-55.551, -1); // -55.6
  round10(-55, 1);      // -50
  round10(-55.1, 1);    // -60
  // Floor
  floor10(55.59, -1);   // 55.5
  floor10(59, 1);       // 50
  floor10(-55.51, -1);  // -55.6
  floor10(-51, 1);      // -60
  // Ceil
  ceil10(55.51, -1);    // 55.6
  ceil10(51, 1);        // 60
  ceil10(-55.59, -1);   // -55.5
  ceil10(-59, 1);       // -50
*/
