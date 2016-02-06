// all globals go here!
var ctx;
var offx, offy; // offset of the box
var BOXW, BOXL; // box width and length
BOXW = 800;
BOXL = 500;
var BOUNDW, BOUNDL, MINBOUNDW, MINBOUNDL; // same as BOXW, BOXL for now
BOUNDW = BOXW;
BOUNDL = BOXL;
MINBOUNDW = 0;
MINBOUNDL = 0;
var P, T, D, Q, sweepline, finished, speed;
var timeouts = [];
var finish = null;
var contents;
var nochange = false;
var start_time, end_time;
function filled_circle(cx, cy, rad, color) {
	ctx.beginPath();
	ctx.arc(cx, cy, rad, 0, 2*Math.PI, false);
	if (color==0) ctx.fillStyle = 'red';
	else ctx.fillStyle = 'blue';
	ctx.fill();
}
function fillP(contents) {
	if (nochange) return;
	P = [];
	var points = contents.split("\n");
	for (var i = 0; i < points.length-1; i++) { // make this more robust later
		var pt = points[i].split(" ")
		var x = parseFloat(pt[0]);
		var y = parseFloat(pt[1]);
		P.push(new Site(x, y));	
	}
}
function handleFileSelect(evt) {
	var file = evt.target.files[0];
	if (file) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			fillP(contents);
		}
		r.readAsText(file);
		
	}
	else {
		alert('uh oh file problems');
	}
}
$(document).ready(function() {
/*	var pf = document.getElementById('pointfile');
	pf.addEventListener('change', handleFileSelect, false);*/
	
        var canvas = document.getElementById("a");
	ctx = canvas.getContext("2d");
	ctx.lineWidth=0.5;
	ctx.strokeRect(0, 0, BOXW, BOXL);
	$('#but1').click(function() {

		nochange = true;
		for (var i = 0; i < timeouts.length; i++) {
			clearTimeout(timeouts[i]);
		}
		if (finish!=null) {
			clearInterval(finish);
		}
		// should clear everything starting...now
		ctx.clearRect(0, 0, BOXW, BOXL);
		ctx.strokeRect(0, 0, BOXW, BOXL);
		T = new AVLtree(); // is not a proper AVL tree; the rebalancing operations are commented out
		D = new dcel(); // is not a proper DCEL; only used to maintain lists of vertices and edges
		Q = new goog.structs.PriorityQueue();
		sweepline = 0.0;
		finished = false;
/*		if (pf.value=="") {	
			var n = $('#quantity').val();
			P = generatePts(n);
		}*/
                var n = $('#quantity').val();
                P = generatePts(n);
		var anim = parseInt($('[name="graphic"]:checked').val());
		start_time = Date.now();
		VoronoiDiagram(anim);
		if (anim!=3) {
			for (var i = 0; i < P.length; i++) {
				filled_circle(P[i].x, P[i].y, 2, 0);
			}
		}
		var s = setInterval(function() {
			if (finished) {
				var y = end_time-start_time;	
				$("#algtime").text(y);
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
});
