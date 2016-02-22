// input: P, an array of sorted points
// output: Voronoi diagram points and edges

// what is this? a global so the tree can access?
var last_added = null;

// what are these?
// I think these are used to determine when 
// the circle events have been passed, so the 
// animation looks correct.
// yeah, they are. they're used to set boundw and boundl.
var maxy = Number.NEGATIVE_INFINITY;
var miny = Number.POSITIVE_INFINITY;
var maxx = Number.NEGATIVE_INFINITY;
var minx = Number.POSITIVE_INFINITY;

function update_box_bounds(site) {
	if (site.y > maxy) maxy = site.y;
	if (site.x > maxx) maxx = site.x;
	if (site.y < miny) miny = site.y;
	if (site.x < minx) minx = site.x;
}

function get_next_event() {
		var e = Q.dequeue();

    while (e.deleted) {
			e = Q.dequeue();
			if (Q.isEmpty()) {
				finished = true;
				HandleHalfEdges();
				return null;
			}
		}
    return e;
}

function step_algorithm() {
	if (!finished) {

    // get a new event
		var e = get_next_event();
    if (e === null) return;

    update_box_bounds(e.site);

		sweepline = e.site.y;
		if (e.isSiteEvent()) {
			last_added = e.site;
			D.F.push(new Face(e.site));
			HandleSiteEvent(e.site);
		}
		else {
			HandleCircleEvent(e);
		}
	}
  // this is the problem. 
  // for the behavior to look correct, we'd like 
  // to first carry the beach line to the end of the box.
	if (Q.isEmpty()) {
		HandleHalfEdges();
		finished=true;
	}
}

function HandleHalfEdges() {
	BOUNDW = Math.max(BOXW, maxx+1);
	BOUNDL = Math.max(BOXL, maxy+1);
	MINBOUNDW = Math.min(0, minx-1);
	MINBOUNDL = Math.min(0, miny-1);
	T.handle_halfedges();
}

function step_animation() {
	var mult_factor = 30;
	var incr = 1;
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
	}
	if (finished) {
		var inside_box = [];
		T.root.inside_box(inside_box);
		finish = setInterval(function() {
			sweepline -= incr;
			if (inside_box.length==0) clearInterval(finish);
			for (var i = 0; i < inside_box.length; i++) {
				var n = inside_box[i];
				if (n.x(sweepline) < 0 || n.x(sweepline) > BOXW) {
					inside_box.splice(i, 1);
					//n.value.edge.stop = new Site(n.x(sweepline), T.parabolic(n.value.site1.x, n.value.site1.y, n.x(sweepline), sweepline));
				}
			}
			drawer(P);
		}, mult_factor);
	}
}

function enqueue_pts() {
  // adds points to Q
	for (var i = 0; i < P.length; i++) {
		var site_event = new Event(P[i], null, 0, null);
		Q.enqueue(-P[i].y, site_event); // smaller key values have higher priority
	}
}

function run_fortune() {
  enqueue_pts();
  step_animation();
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

function HandleSiteEvent(p_i) {
	if (T.isEmpty()) { T.insert(p_i); return; }
	var p_j = T.verticallyAbove(p_i, sweepline);
	if (p_j.ptr != null) {
		p_j.ptr.deleted = true;
	}
	var p = T.replace(p_j, p_i); // p = new middle leaf, with p_i
	var neighbors = T.neighbors(p); // yields the two new p_j leaves
	if (neighbors[0] != null) {
		T.check_triple(Q, neighbors[0], sweepline);
	}
	if (neighbors[1] != null) {
		T.check_triple(Q, neighbors[1], sweepline);
	}
}

function StoreNewEdges(mid1, mid2, n0, g, n1) {
	var e1 = new Edge();
	e1.start = mid1.value.start; // ideally don't use this
	e1.lface = n0.value.site;
	e1.rface = g.ptr.value.site;
	e1.stop = g.center;
	var e2 = new Edge();
	e2.start = mid2.value.start;
	e2.stop = g.center;
	e2.lface = g.ptr.value.site;
	e2.rface = n1.value.site;
	D.E.push(e1);
	D.E.push(e2);
}

// still need to flip over to AVL tree
function HandleCircleEvent(g) {
	var neighbors = T.neighbors(g.ptr);
	var mid1 = T.get_middle(neighbors[0], g.ptr);
	var mid2 = T.get_middle(g.ptr, neighbors[1]);
	// store the disappearing edges
	StoreNewEdges(mid1, mid2, neighbors[0], g, neighbors[1]);
	T.remove(g.ptr); 
	var mid = T.get_middle(neighbors[0], neighbors[1]);
	mid.value.start = g.center;
	mid.value.slope = -(neighbors[1].value.site.x-neighbors[0].value.site.x)/(neighbors[1].value.site.y-neighbors[0].value.site.y);
	var p1 = null;
	var p2 = null;
	if (neighbors[0] != null) 
		p1 = neighbors[0].ptr;
	if (neighbors[1] != null) 
		p2 = neighbors[1].ptr;
	// neighbors is returning internal nodes
	if (p1 != null) p1.deleted = true;
	if (p2 != null) p2.deleted = true;
	D.V.push(new Vertex(g.center));
	if (neighbors[0] != null) {
		T.check_triple(Q, neighbors[0], sweepline);
	}
    if (neighbors[1] != null) {
		T.check_triple(Q, neighbors[1], sweepline);
	}
}
