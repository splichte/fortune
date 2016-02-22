// ==================== GLOBAL VARIABLES ======================
var ctx; // canvas object
var BOXW = 600, 
    BOXL = 250; // canvas width and length

var BOUNDW = BOXW, 
    BOUNDL = BOXL; // not sure why these exist

var P, T, D, Q, sweepline, finished, speed;
// P - list of points
// T - sweepline tree
// D - edges the algorithm has found
// Q - priority queue of events
// sweepline - a number indicating sweepline's vertical position
// finished - true when Q has no more events to process
// speed - how fast to animate the sweepline

var timeouts = [];
var finish = null;
var nochange = false; // checks if we need to reset computation?

// ====================== END GLOBAL ===========================

function fill_test_P() {
  var P = [];
  P.push(new Site(536.0503579276191, 160.67875172331665));
  P.push(new Site(314.2389601099687, 222.35578512883797));
  P.push(new Site(439.74570183839177, 16.44121591225836));
  P.push(new Site(401.3698397813927, 160.51519971607482));
  P.push(new Site(366.99666329921894, 14.524960946810495));
  return P;
}

$(document).ready(function() {
  init_ctx();

	$('#but1').click(function() {
    reset_state();
    P = fill_test_P();

		run_fortune();

    for (var i = 0; i < P.length; i++) {
      filled_circle(P[i].x, P[i].y, 2, 0);
    }
		var s = setInterval(function() {
			if (finished) {
				clearInterval(s);
				nochange = false;
				var pts_str = "";
				for (var i = 0; i < D.V.length; i++) {
					pts_str += D.V[i].site.x+" "+D.V[i].site.y+"\n";
				}
				$('#ta').val(pts_str);
				var e_str = "";
				for (var i = 0; i < D.E.length; i++) {
					e_str += D.E[i].start.x+" "+D.E[i].start.y+" "+D.E[i].stop.x+" "+D.E[i].stop.y+"\n";
				}
				$('#tae').val(e_str);
				if (anim!=3) {
					for (var i = 0; i < D.V.length; i++) {
						filled_circle(D.V[i].site.x, D.V[i].site.y, 2, 1);
					}
					ctx.clearRect(0, 0, BOXW, BOXL);
					ctx.strokeRect(0, 0, BOXW, BOXL);

					for (var i = 0; i < P.length; i++) {
						filled_circle(P[i].x, P[i].y, 2, 0);
					}
					for (var i = 0; i < D.V.length; i++) {
						filled_circle(D.V[i].site.x, D.V[i].site.y, 1, 1);	
					}
					for (var i = 0; i < D.E.length; i++) {
						if (D.E[i].start!=null && D.E[i].stop!=null) {
							ctx.beginPath();
							ctx.moveTo(D.E[i].start.x, D.E[i].start.y);
							ctx.lineTo(D.E[i].stop.x, D.E[i].stop.y);
							ctx.stroke();
						}
					}
				}
			}
		}, 1000);
	});
  $('#but1').click();
});
