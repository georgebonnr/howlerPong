var ar = require('./funcHelpers/argHelpers');

module.exports = makeAnalyser = function(options) {
  var analyser = this.context.createAnalyser();
  analyser.context = this.context;
  if (ar.isU(options)) {return analyser;}
  ar.paste(options, analyser);
  return analyser;
};
