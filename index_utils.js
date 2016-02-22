function generatePts(n) {
  // returns an array of n random pts
	var P = [];
	for (var i = 0; i < n; i++) {
		var s = new Site(Math.random()*BOXW, Math.random()*BOXL);
		P.push(s);
	}
	return P;
}

function fill_test_P() {
  // test case that causes prematurely drawn half-edges.
  var P = [];
  P.push(new Site(536.0503579276191, 160.67875172331665));
  P.push(new Site(314.2389601099687, 222.35578512883797));
  P.push(new Site(439.74570183839177, 16.44121591225836));
  P.push(new Site(401.3698397813927, 160.51519971607482));
  P.push(new Site(366.99666329921894, 14.524960946810495));
  return P;
}

function draw_pts(P, rad, color) {
  P.forEach(function(point) {
    filled_circle(point.x, point.y, rad, color);
  });
}

function filled_circle(cx, cy, rad, color) {
	ctx.beginPath();
	ctx.arc(cx, cy, rad, 0, 2*Math.PI, false);
	if (color==0) ctx.fillStyle = 'red';
	else ctx.fillStyle = 'blue';
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
