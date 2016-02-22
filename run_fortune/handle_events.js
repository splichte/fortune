function handle_event(e) {
	if (e.isSiteEvent()) {
		last_added = e.site;
		D.F.push(new Face(e.site));
		handle_site_event(e.site);
	}
	else {
		handle_circle_event(e);
	}
}

function handle_site_event(p_i) {
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

function handle_circle_event(g) {
	var neighbors = T.neighbors(g.ptr);
	var mid1 = T.get_middle(neighbors[0], g.ptr);
	var mid2 = T.get_middle(g.ptr, neighbors[1]);
	// store the disappearing edges
	store_new_edges(mid1, mid2, neighbors[0], g, neighbors[1]);
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
