/* Mostly drawing utilities. */

function generatePts(n) {
  // returns an array of n random pts
  var P = [];
  for (var i = 0; i < n; i++) {
    var s = new Site(Math.random()*BOXW, Math.random()*BOXL);
    P.push(s);
    console.log(s);
  }
  return P;
}

// test case that causes prematurely drawn half-edges.
// 
function fill_test_P_premature() {
  var P = [];
  P.push(new Site(536.0503579276191, 160.67875172331665));
  P.push(new Site(314.2389601099687, 222.35578512883797));
  P.push(new Site(439.74570183839177, 16.44121591225836));
  P.push(new Site(401.3698397813927, 160.51519971607482));
  P.push(new Site(366.99666329921894, 14.524960946810495));
  return P;
}

// test case: weird dangling on left canvas.
function fill_test_P_dangling() {
  var P = [];
  P.push(new Site(46.36410586195105, 27.703806198913718));
  P.push(new Site(57.013146874017416, 78.53957699759926));
  P.push(new Site(471.06929520561357, 7.278950801136191));
  P.push(new Site(89.39441051798471, 76.75897539346555));
  P.push(new Site(349.0679181458536, 67.03342611249214));
  return P;
}

function draw_pts(P) {
  P.forEach(function(point) {
    filled_circle(point.x, point.y, 2, 'black');
  });
}

function filled_circle(cx, cy, rad, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, 2*Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
}

function init_ctx() {
  var canvas = document.getElementById("a");
  ctx = canvas.getContext("2d");
  ctx.lineWidth=0.5;
  ctx.strokeRect(0, 0, BOXW, BOXL);
}

function reset_state() {
  nochange = true;

  timeouts.forEach(function(ti) { clearTimeout(ti) });
  if (finish!=null) {
    clearInterval(finish);
  }

  // should clear everything starting...now
  ctx.clearRect(0, 0, BOXW, BOXL);
  ctx.strokeRect(0, 0, BOXW, BOXL);
  T = new InternalTree();
  D = new dcel();
  Q = new goog.structs.PriorityQueue();
  sweepline = 0.0;
  finished = false;
  var n = Math.min($('#quantity').val(), 1000);
  P = generatePts(n);
  var anim = parseInt($('[name="graphic"]:checked').val());
}
