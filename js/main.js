Famous(function(require, exports, module) {
  var Engine = require('famous/Engine');
  var Surface = require('famous/Surface');
  var Modifier = require('famous/Modifier');
  var FM = require('famous/Matrix');
  var ContainerSurface = require('famous/ContainerSurface');
  var Context = Engine.createContext();

  var board = new Surface({
    size: [400,600],
    classes: ['board']
  });

  var center = new Modifier({
    origin: [0.5,0.5],
    transform: undefined
  });

  var infoMod = new Modifier({
    origin: [1,1]
  });

  var info = new ContainerSurface ({
    size: [window.innerWidth-400,window.innerHeight],
    classes: ['info']
  });

  Context.add(infoMod).link(info);
  Context.add(board);

  var titleX = (window.innerWidth - 400) * 0.35;
  var titleY = window.innerHeight * 0.05;
  var titleMod = new Modifier({
    transform: FM.translate(titleX,titleY,0)
  });

  var title = new Surface({
    size: [undefined, 200],
    content: 'Howler Pong',
    classes: ['title']
  });

  var subTitle = new Surface({
    size: [undefined, 200],
    content: "Click 'allow' above",
    classes: ['subTitle']
  });

  var subTitleMod = new Modifier({
    origin: [0.5,0.5],
    transform: FM.translate(titleX+20,window.innerHeight*0.4,0)
  });

  var scoreMod1 = new Modifier({
    transform: FM.translate(window.innerWidth*0.66,window.innerHeight*0.2,0)
  });

  var scoreMod2 = new Modifier({
    transform: FM.translate(window.innerWidth*0.66,window.innerHeight*0.5,0)
  });

  var pScore = '0';
  var cScore = '0';

  var playerScore = new Surface({
    size: [undefined, 200],
    content: pScore,
    classes: ['score']
  });

  var computerScore = new Surface({
    size: [undefined, 200],
    content: cScore,
    classes: ['score']
  });

  info.add(titleMod).link(title);
  info.add(subTitleMod).link(subTitle);
  Context.add(scoreMod1).link(playerScore);
  Context.add(scoreMod2).link(computerScore);

  var incrementScore = function(team) {
    if (team === 'player') {
      pScore++;
      playerScore.setContent(pScore.toString());
    } else if (team === 'computer') {
      cScore++;
      computerScore.setContent(cScore.toString());
    }
  };

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
    subTitle.setContent('setting audio threshold...');
    pA.calibrate(4000, 10, function(){
      subTitle.setContent('Use your voice!');
    });
  };

  var width = 400;
  var height = 600;
  var player = new Player();
  var computer = new Computer();
  var ball = new Ball(200, 300);

  var update = function (pitch) {
      player.update(pitch);
      computer.update(ball);
      ball.update(player.paddle, computer.paddle);
  };

  var step = function () {
      var pitch = pA.process();
      update(pitch);
  };

  Engine.on('prerender', function() {
    step();
  });

  function Paddle(x, y, width, height) {
      this.mod = new Modifier({
        transform: FM.translate(x, y, 0)
      });
      this.surface = new Surface({
        size: [width, height],
        classes: ['paddle']
      });
      Context.add(this.mod).link(this.surface);
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.x_speed = 0;
      this.y_speed = 0;
  }

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
      this.mod.setTransform(FM.translate(this.x, this.y, 0));
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
    if (pitch.volume < pA.threshold-20 && pitch.hz > 200) {
      this.paddle.move(0,0);
      this.last = pitch.hz;
      return;
    }
    if (pitch.volume < pA.threshold) {
      this.paddle.move(0,0);
      this.last = pitch.hz;
      return;
    }
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

      this.mod = new Modifier({
        transform: FM.translate(x, y, 0)
      });
      this.surface = new Surface({
        size: [13, 13],
        classes: ['ball']
      });
      Context.add(this.mod).link(this.surface);

      this.x_speed = 0;
      this.y_speed = 3;
  }

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

      if (this.y < 0) {
          incrementScore('computer');
          this.x_speed = 0;
          this.y_speed = 3;
          this.x = 200;
          this.y = 300;
      }

      if (this.y > 600) {
          incrementScore('player');
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
      this.mod.setTransform(FM.translate(this.x-7, this.y-5, 0));
  };

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
  navigator.getUserMedia( {audio:true}, streamLoaded);



});
