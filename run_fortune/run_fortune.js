function run_fortune() {
  enqueue_pts();
  step_animation();
}

function enqueue_pts() {
  // adds points to Q
	for (var i = 0; i < P.length; i++) {
		var site_event = new Event(P[i], null, 0, null);
		Q.enqueue(-P[i].y, site_event); // smaller key values have higher priority
	}
}

function step_animation() {
	step_algorithm();
	drawer(P);
	
	if (!finished) {
		var int_diff = Math.floor(sweepline-Q.peek().site.y);
		timeouts.push(setTimeout(step_animation, mult_factor*int_diff));
		for (var i = 1; i < int_diff; i++) { 
			timeouts.push(setTimeout(function() {
				sweepline -= incr;
				drawer(P);
			}, mult_factor*incr*i));
		}
	} else {
		var inside_box = [];
    // so many side-effects...
		T.root.is_inside_canvas(inside_box);
		finish = setInterval(function() {
			sweepline -= incr;
			if (inside_box.length==0) clearInterval(finish);
			for (var i = 0; i < inside_box.length; i++) {
				var n = inside_box[i];
				if (n.x(sweepline) < 0 || n.x(sweepline) > BOXW) {
					inside_box.splice(i, 1);
				}
			}
			drawer(P);
		}, mult_factor);
	}
}


function step_algorithm() {

  // this is bad coding. we shouldn't be 
  // calling the function if it finished already.

	if (!finished) {

    // get a new event
		var e = get_next_event();
    if (e === null) return;

    update_box_and_sweepline(e.site);

    handle_event(e);
  }
}

function drawer(P) {
  // drawer draws the box, points, already drawn edges, and current tree pos.
  // this seems to work fine.

  // box
	ctx.clearRect(0, 0, BOXW, BOXL);
	ctx.strokeRect(0, 0, BOXW, BOXL);

  // points
	for (var i = 0; i < P.length; i++) {
		filled_circle(P[i].x, P[i].y, 2, 0);
	}

  // Voronoi diagram vertices
	for (var i = 0; i < D.V.length; i++) {
		filled_circle(D.V[i].site.x, D.V[i].site.y, 1, 1);	
	}

  // Voronoi diagram edges
	for (var i = 0; i < D.E.length; i++) {
		if (D.E[i].start!=null && D.E[i].stop!=null) {
			ctx.beginPath();
			ctx.moveTo(D.E[i].start.x, D.E[i].start.y);
			ctx.lineTo(D.E[i].stop.x, D.E[i].stop.y);
			ctx.stroke();
		}
	}

  // sweep line
	ctx.beginPath();
	ctx.moveTo(0, sweepline);
	ctx.lineTo(BOXW, sweepline);
	ctx.stroke();

  // parabolic arcs defined by the sweep line position
	T.drawtree(sweepline);
}
