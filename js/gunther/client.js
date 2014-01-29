// var gunther = require('./audio/gunther.js');

// var contextClass = (window.AudioContext ||
//     window.webkitAudioContext ||
//     window.mozAudioContext ||
//     window.oAudioContext ||
//     window.msAudioContext);

// if (contextClass) {
//   var aContext = new contextClass();
//   gunther.context = aContext;
// } else {
//   console.log("web audio is not enabled");
// }

// var hiPass = gunther.makeFilter("HIGHPASS",80);
// var loPass = gunther.makeFilter("LOWPASS",1200);
// console.log('AFTER PASS FILTERS')
// var filters = gunther.makeNodeChain();
// filters.add(hiPass,loPass);
// var pA = gunther.makePitchAnalyser(filters);
// console.log('before method');
// console.log('HI EVERYBODY');

// filters.connect(pA);

// var streamLoaded = function(stream) {
//   mic = aContext.createMediaStreamSource(stream);
//   mic.connect(filters.first);
//   pA.calibrate(function(){
//     // animate(step);
//   });
// };

// var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
//         window.setTimeout(callback, 1000 / 60);
//     };
// var canvas = document.createElement("canvas");
// var width = 400;
// var height = 600;
// canvas.width = width;
// canvas.height = height;
// var context = canvas.getContext('2d');
// var player = new Player();
// var computer = new Computer();
// var ball = new Ball(200, 300);

// var keysDown = {};

// var render = function () {
//     context.fillStyle = "#000";
//     context.fillRect(0, 0, width, height);
//     player.render();
//     computer.render();
//     ball.render();
// };

// var update = function (pitch) {
//     player.update(pitch);
//     computer.update(ball);
//     ball.update(player.paddle, computer.paddle);
// };

// var step = function () {
//     pA.process(function(data){
//       update(data);
//     });
//     update();
//     render();
//     animate(step);
// };

// function Paddle(x, y, width, height) {
//     this.x = x;
//     this.y = y;
//     this.width = width;
//     this.height = height;
//     this.x_speed = 0;
//     this.y_speed = 0;
// }

// Paddle.prototype.render = function () {
//     context.fillStyle = "#999";
//     context.fillRect(this.x, this.y, this.width, this.height);
// };

// Paddle.prototype.move = function (x, y) {
//     this.x = x;
//     this.y = 0;
//     this.x_speed = x;
//     this.y_speed = y;
//     if (this.x < 0) {
//         this.x = 0;
//         this.x_speed = 0;
//     } else if (this.x + this.width > 400) {
//         this.x = 400 - this.width;
//         this.x_speed = 0;
//     }
// };

// function Computer() {
//     this.paddle = new Paddle(175, 10, 50, 10);
// }

// Computer.prototype.render = function () {
//     this.paddle.render();
// };

// Computer.prototype.update = function (ball) {
//     var x_pos = ball.x;
//     var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
//     if (diff < 0 && diff < -4) {
//         diff = -5;
//     } else if (diff > 0 && diff > 4) {
//         diff = 5;
//     }
//     this.paddle.move(diff, 0);
//     if (this.paddle.x < 0) {
//         this.paddle.x = 0;
//     } else if (this.paddle.x + this.paddle.width > 400) {
//         this.paddle.x = 400 - this.paddle.width;
//     }
// };

// function Player() {
//     this.paddle = new Paddle(175, 580, 50, 10);
// }

// Player.prototype.render = function () {
//     this.paddle.render();
// };

// Player.prototype.update = function (pitch) {
//   console.log(pitch);
//     if (pitch.hz < 300) {
//       this.paddle.move(-4, 0);
//     } else if (pitch.hz > 300) {
//       this.paddle.move(4, 0);
//     } else {
//       this.paddle.move(0, 0);
//     }
// };

// function Ball(x, y) {
//     this.x = x;
//     this.y = y;
//     this.x_speed = 0;
//     this.y_speed = 3;
// }

// Ball.prototype.render = function () {
//     context.beginPath();
//     context.arc(this.x, this.y, 5, 2 * Math.PI, false);
//     context.fillStyle = "#fff";
//     context.fill();
// };

// Ball.prototype.update = function (paddle1, paddle2) {
//     this.x += this.x_speed;
//     this.y += this.y_speed;
//     var top_x = this.x - 5;
//     var top_y = this.y - 5;
//     var bottom_x = this.x + 5;
//     var bottom_y = this.y + 5;

//     if (this.x - 5 < 0) {
//         this.x = 5;
//         this.x_speed = -this.x_speed;
//     } else if (this.x + 5 > 400) {
//         this.x = 395;
//         this.x_speed = -this.x_speed;
//     }

//     if (this.y < 0 || this.y > 600) {
//         this.x_speed = 0;
//         this.y_speed = 3;
//         this.x = 200;
//         this.y = 300;
//     }

//     if (top_y > 300) {
//         if (top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
//             this.y_speed = -3;
//             this.x_speed += (paddle1.x_speed / 2);
//             this.y += this.y_speed;
//         }
//     } else {
//         if (top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
//             this.y_speed = 3;
//             this.x_speed += (paddle2.x_speed / 2);
//             this.y += this.y_speed;
//         }
//     }
// };

// console.log(window.document.body);

// window.document.body.appendChild(canvas);

// animate(step);

// window.addEventListener("keydown", function (event) {
//     keysDown[event.keyCode] = true;
// });

// window.addEventListener("keyup", function (event) {
//     delete keysDown[event.keyCode];
// });

// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
// navigator.getUserMedia( {audio:true}, streamLoaded);




















var gunther = require('./audio/gunther.js');

// REFACTOR TO USE MODERNIZR
var contextClass = (window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.oAudioContext ||
    window.msAudioContext);

if (contextClass) {
  var aContext = new contextClass();
  gunther.context = aContext;
} else {
  console.log("web audio is not enabled");
}
var hiPass = gunther.makeFilter("HIGHPASS",80);
var loPass = gunther.makeFilter("LOWPASS",1200);
var filters = gunther.makeNodeChain();
filters.add(hiPass,loPass);
var pA = gunther.makePitchAnalyser(filters);

filters.connect(pA);

var streamLoaded = function(stream) {
  mic = aContext.createMediaStreamSource(stream);
  mic.connect(filters.first);
  pA.calibrate(function(){
    console.log(pA.smoothingTimeConstant);
    pA.smoothingTimeConstant = 0.5;
    console.log(pA.smoothingTimeConstant);
    document.body.appendChild(canvas);
    animate(step);
  });
};





var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
var canvas = document.createElement("canvas");


console.log(Context);


var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var player = new Player();
var computer = new Computer();
var ball = new Ball(200, 300);

var render = function () {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);
    player.render();
    computer.render();
    ball.render();
};

var update = function (pitch) {
    player.update(pitch);
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};

var step = function () {
    var pitch = pA.process();
    update(pitch);
    render();
    animate(step);
};

function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
}

Paddle.prototype.render = function () {
    context.fillStyle = "white";
    context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function (x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if (this.x < 0) {
        this.x = 0;
        this.x_speed = 0;
    } else if (this.x + this.width > 400) {
        this.x = 400 - this.width;
        this.x_speed = 0;
    }
};

function Computer() {
    this.paddle = new Paddle(175, 10, 50, 10);
}

Computer.prototype.render = function () {
    this.paddle.render();
};

Computer.prototype.update = function (ball) {
    var x_pos = ball.x;
    var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
    if (diff < 0 && diff < -4) {
        diff = -5;
    } else if (diff > 0 && diff > 4) {
        diff = 5;
    }
    this.paddle.move(diff, 0);
    if (this.paddle.x < 0) {
        this.paddle.x = 0;
    } else if (this.paddle.x + this.paddle.width > 400) {
        this.paddle.x = 400 - this.paddle.width;
    }
};

function Player() {
    this.paddle = new Paddle(175, 580, 50, 10);
    this.last = 0;
}

Player.prototype.render = function () {
    this.paddle.render();
};

Player.prototype.update = function (pitch) {
  if (pitch.hz > this.last) {
    this.paddle.move(6, 0);
  } else if (pitch.hz < this.last) {
    this.paddle.move(-6, 0);
  } else {
    this.paddle.move(0, 0);
  }
  this.last = pitch.hz;
};

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = 3;
}

Ball.prototype.render = function () {
    context.beginPath();
    context.arc(this.x, this.y, 5, 2 * Math.PI, false);
    context.fillStyle = "white";
    context.fill();
};

Ball.prototype.update = function (paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - 5;
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    if (this.x - 5 < 0) {
        this.x = 5;
        this.x_speed = -this.x_speed;
    } else if (this.x + 5 > 400) {
        this.x = 395;
        this.x_speed = -this.x_speed;
    }

    if (this.y < 0 || this.y > 600) {
        this.x_speed = 0;
        this.y_speed = 3;
        this.x = 200;
        this.y = 300;
    }

    if (top_y > 300) {
        if (top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
            this.y_speed = -3;
            this.x_speed += (paddle1.x_speed / 2);
            this.y += this.y_speed;
        }
    } else {
        if (top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
            this.y_speed = 3;
            this.x_speed += (paddle2.x_speed / 2);
            this.y += this.y_speed;
        }
    }
};

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
navigator.getUserMedia( {audio:true}, streamLoaded);




// If room is loud / jumpy

// In Player constructor function:
//     this.pitches = [200,200,200,200,200];

// Player.prototype.update = function (pitch) {
//   // console.log(this.pitches);
//   var l = this.pitches.length;
//   if ((pitch.hz > this.pitches[(l-1)]) && (pitch.hz > this.pitches[0]+5)) {
//     this.paddle.move(6, 0);
//   } else if ((pitch.hz < this.pitches[(l-1)]) && (pitch.hz < this.pitches[0]-5)) {
//     this.paddle.move(-6, 0);
//   } else {
//     this.paddle.move(0, 0);
//   }
//   this.pitches.push(pitch.hz);
//   this.pitches.shift();
// };
