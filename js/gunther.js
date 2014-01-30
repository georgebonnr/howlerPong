;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var gunther= require('./gunther/gunther');

if(typeof window !=='undefined') {    
    window.gunther = gunther;    
  }

},{"./gunther/gunther":3}],2:[function(require,module,exports){
module.exports = {
  isD: function(arg) {
    return (typeof arg !== 'undefined');
  },
  isF: function(arg) {
    return (typeof arg === 'function');
  },
  isU: function(arg) {
    return (typeof arg === 'undefined');
  },
  paste: function(opts,obj) {
    for (var key in opts) {
      obj[key] = opts[key];
    }
  },
  translate: function(obj, nickname, name) {
    if (obj[nickname] !== "undefined") {
      obj[name] = obj[nickname];
      delete obj[nickname];
    }
  }
};

},{}],3:[function(require,module,exports){
var makeFilter = require('./makeFilter');
var makeNodeChain = require('./makeNodeChain');
var makeAnalyser = require('./makeAnalyser');
var makePitchAnalyser = require('./makePitchAnalyser');

module.exports = {
  makeFilter: makeFilter,
  makeNodeChain: makeNodeChain,
  makeAnalyser: makeAnalyser,
  makePitchAnalyser: makePitchAnalyser
};

},{"./makeAnalyser":4,"./makeFilter":5,"./makeNodeChain":6,"./makePitchAnalyser":7}],4:[function(require,module,exports){
var ar = require('./funcHelpers/argHelpers');

module.exports = makeAnalyser = function(options) {
  var analyser = this.context.createAnalyser();
  analyser.context = this.context;
  if (ar.isU(options)) {return analyser;}
  ar.paste(options, analyser);
  return analyser;
};

},{"./funcHelpers/argHelpers":2}],5:[function(require,module,exports){
var ar = require('./funcHelpers/argHelpers');

module.exports = makeFilter = function(type, freq, options) {
  if (!type || typeof type !== "string") {
    throw new Error("enter a string for filter type");
  }
  var filter = this.context.createBiquadFilter();
  filter.type = filter[type];
  if (ar.isD(freq)) { filter.frequency.value = freq; }
  if (ar.isU(options)) { return filter; }
  if (ar.isD(options.gain)) { filter.gain.value = options.gain; }
  if (ar.isD(options.q)) { filter.Q.value = options.q; }
  return filter;
};

},{"./funcHelpers/argHelpers":2}],6:[function(require,module,exports){
module.exports = makeNodeChain = function(first,output){
  var chain = {
    first: first || null,
    last: null,
    output: output || null
  };
  chain.connect = function(node){
    this.output = node;
    if (this.last) {this.last.connect(this.output);}
  };
  chain.disconnect = function(node){
    this.output = null;
    if (this.last) {this.last.disconnect(node);}
  };
  chain.add = function(filter){
    if (arguments.length > 1) {
      for (var i=0; i<arguments.length; i++) {
        this.add(arguments[i]);
      }
      return this;
    }
    if (!this.first) {
      this.first = filter;
      this.last = filter;
      if (this.output) {this.last.connect(this.output);}
    } else {
      if (this.output) {
        this.last.disconnect(this.output);
        filter.connect(this.output);
      }
      this.last.connect(filter);
      this.last = filter;
    }
    return this;
  };
  return chain;
};

},{}],7:[function(require,module,exports){
var makeFilter = require('./makeFilter');
var makeNodeChain = require('./makeNodeChain');
var pitchHelpers = require('./pitchhelpers');

module.exports = function(source) {

  var _gunther = this;

  var _noiseCancel = function(freq,diff) {
    notchStrength = 0.7;
    var amt = diff*notchStrength;
    console.log("adding noise cancelling filter at "+freq+
                "hz with gain "+amt);
    source.disconnect(analyser);
    var filter = _gunther.makeFilter("PEAKING", freq, {
      gain: amt
    });
    var chain = analyser.ncFilters;
    if (chain) {
      chain.add(filter);
    } else {
      chain = analyser.ncFilters = makeNodeChain();
      chain.add(filter);
      source.connect(chain.first);
      chain.connect(analyser);
    }
  };

  var _convertToHz = function(buckets) {
    var targetFreq = buckets[1][0];
    var lowD = ((buckets[1][1])-(buckets[0][1]));
    var highD = ((buckets[1][1])-(buckets[2][1]));
    var shift = (lowD < highD ? -(highD - lowD) : (lowD - highD));
    var aShift = (shift*0.5)*0.1;
    var f = targetFreq+aShift;
    return f/analyser.frequencyBinCount*(analyser.context.sampleRate*0.5);
  };

  var _setThresh = function(avg,tStr) {
    if (avg > analyser.minDecibels * 0.27) {
      tStr = 0;
    } else if (avg > analyser.minDecibels * 0.4) {
      tStr *= 0.5;
    }
    analyser.threshold = avg+tStr;
    console.log(analyser.threshold);
  };

  var _analyseEnv = function(time,tStrength,done) {
    var interval = 50;
    var start = new Date().getTime();
    var e = start + time;
    var results = [];
    var tick = function() {
      analyser.getFloatFrequencyData(_FFT);
      var fftIndex = pitchHelpers.findMaxWithI(_FFT);
      var sample = {
        volume: fftIndex[1][1],
        hz: _convertToHz(fftIndex)
      };
      results.push(sample);
      var cur = new Date().getTime();
      if (cur < e) {
        setTimeout(tick,interval);
      } else {
        var data = pitchHelpers.getPeaks(results);
        for (var f in data.freqs) {
          var freq = data.freqs[f];
          var freqAvg = freq.vol/freq.hits;
          if (freq.hits > results.length*0.3) {
            var diff = data.avg - freqAvg;
            _noiseCancel(f,diff);
          }
        }
        _setThresh(data.avg,tStrength);
        done && done();
      }
    };
    tick();
  };

  var analyser = this.makeAnalyser({
    fftSize: 2048,
    maxDecibels: -30,
    minDecibels: -144
  });
  analyser.threshold = -30;
  source.connect(analyser);
  var _FFT = new Float32Array(analyser.frequencyBinCount);

  analyser.calibrate = function(time,tStrength,callback) {
    if (typeof(time) === "function") {
      callback = time;
      time = undefined;
    }
    if (typeof(tStrength) === "function") {
      callback = tStrength;
      tStrength = undefined;
    }
    time = time || 4000;
    tStrength = tStrength || 20;
    if (tStrength < 0 || tStrength > 50) {
      throw new Error("threshold strength must be between 0 and 50");
    }
    _analyseEnv(time,tStrength,callback);
  };

  analyser.process = function() {
    this.getFloatFrequencyData(_FFT);
    var targetRange = pitchHelpers.findMaxWithI(_FFT);
    var volume = targetRange[1][1];
    var hz = _convertToHz(targetRange);
    var data = {
      hz: hz,
      volume: volume
    };
    return data;
  };

  analyser.start = function(interval,smooth,callback){
    var startInterval = function(){
      return setInterval(function(){
        analyser.process(callback);
      }, interval);
    };
    if (typeof(interval) === 'function') {
      callback = interval;
      interval = undefined;
    } else if (typeof(smooth) === 'function') {
      callback = smooth;
      smooth = undefined;
    }
    interval = interval || 60;
    this.smoothingTimeConstant = smooth || 0;
    var processor = startInterval();
    this.end = function() {
      clearInterval(processor);
    };
  };

  analyser.end = function(){
    return "End called but analyser not processing yet.";
  };

  return analyser;
};

},{"./makeFilter":5,"./makeNodeChain":6,"./pitchhelpers":8}],8:[function(require,module,exports){
module.exports = {
  findMaxWithI: function(array) {
    var max = Math.max.apply(Math, array);
    var index = Array.prototype.indexOf.call(array,max);
    return [[index-1,array[index-1]],[index,max],[index+1,array[index+1]]];
  },
  getPeaks: function(array) {
    var sum = 0;
    var freqs = {};
    var i = array.length;
    while(i--) {
      var vol = array[i].volume;
      var freq = Math.round(array[i].hz / 5) * 5;
      if (freqs[freq]) {
        freqs[freq].hits+=1;
        freqs[freq].vol+=vol;
      } else {
        freqs[freq] = {hits:1,vol:vol};
      }
      sum+=vol;
    }
    return {
      avg: sum/array.length,
      freqs: freqs
    };
  }
};

},{}]},{},[1])
;
