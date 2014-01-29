var ar = require('./funcHelpers/argHelpers');

module.exports = makeFilter = function(type, freq, options) {
  if (!type || typeof type !== "string") {
    throw new Error("enter a string for filter type");
  }
  console.log('THIS',this);
  var filter = this.context.createBiquadFilter();
  filter.type = filter[type];
  if (ar.isD(freq)) { filter.frequency.value = freq; }
  if (ar.isU(options)) { return filter; }
  if (ar.isD(options.gain)) { filter.gain.value = options.gain; }
  if (ar.isD(options.q)) { filter.Q.value = options.q; }
  return filter;
};
