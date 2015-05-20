// the points in Q need to know if they are site events or circle events

// specialized AVL Tree for Fortune's algorithm
function same_sites(a,b) {
	if (approx_equal(a.x, b.x) && approx_equal(a.y, b.y))
		return true;
	else return false;
}

function approx_equal(a,b) {
	if (Math.abs(a-b) < 0.0000001) return true;
	else return false;
}

function AVLtree() {
	this.root = null;
	// returns an array of left and right neighbors
	this.neighbors = function(q) {
		var neighbors = [];		
		if (this.root==null) return null;
		else {
//			neighbors.push(this.get_left_neighbor(y, q));
//			neighbors.push(this.get_right_neighbor(y, q));
			neighbors.push(this.gln_node(q));
			neighbors.push(this.grn_node(q));
			return neighbors;
		}
	};
	this.isEmpty = function() {
		if (this.root==null) return true;
		else return false;
	};
	this.insert = function(p) {
		this.root = new Node(new Leaf(p, null), 0, null, null, null);
	};
	// assumes this.root is not null
	this.get_left_neighbor = function(y, q) {
		var fork = null;
		var found = false;
		var cn = this.root; // current node
		if (cn==null) return null;
		while (!found) {
			if (cn.isLeaf()) { found=true; continue;}
			if (q < cn.x(y) && cn.l_child != null) cn = cn.l_child;
			else if (q >= cn.x(y) && cn.r_child != null) {
				fork = cn.l_child;
				cn = cn.r_child;
			}
			else found = true;
		}
		if (approx_equal(q, cn.x(y))) {
			if (cn.par==null) return null;
			else if (cn==cn.par.r_child) return this.go_right(cn.par.l_child);
			else return this.go_right(fork);
		}
		else if (q < cn.x(y)) return this.go_right(fork);
		else return cn;
	};
	this.get_right_neighbor = function(y, q) {
		var fork = null;
		var found = false;
		var cn = this.root; // current node
		if (cn==null) return null;
		while (!found) {
			if (cn.isLeaf()) { found=true; continue;}
			if ((q > cn.x(y) || approx_equal(q, cn.x(y))) && cn.r_child != null) cn = cn.r_child;
			else if (q < cn.x(y) && cn.l_child != null) {
				fork = cn.r_child;
				cn = cn.l_child;
			}
			else {
				found = true;
			}
		}
		if (approx_equal(q, cn.x(y))) {
			if (cn.par==null) return null;
			else if (cn==cn.par.l_child) return this.go_left(cn.par.r_child);	
			else return this.go_left(fork);
		}
		else if (q > cn.x(y)) return this.go_left(fork);
		else return cn;

	};
	// gets right neighbor of a given node
	this.grn_node = function(n) {
		var par = n.par;
		if (par==null) return null;
		var cn = n;
		while (cn==par.r_child) {
			cn = par;
			par = cn.par;
			if (par==null) return null;
		}
		// cn is par.l_child;
		return this.go_left(par.r_child);
	};
	this.gln_node = function(n) {
		var par = n.par;
		if (par==null) return null;
		var cn = n;
		while (cn==par.l_child) {
			cn = par;
			par = cn.par;
			if (par==null) return null;
		}
		return this.go_right(par.l_child);
	};
	this.go_left = function(n) {
		if (n==null) return null;
		while (n.l_child != null) {
			n = n.l_child;
		}
		return n;
	};
	this.go_right = function(n) {
		if (n==null) return null;
		while (n.r_child != null) {
			n = n.r_child;
		}
		return n;
	};
	// searches T for the arc vertically above q
	// taking out the offset screwed it up
	this.verticallyAbove = function(p, ly) {
		// get neighbors
		var ln = this.get_left_neighbor(ly, p.x); // p.y=ly at this point
		var rn = this.get_right_neighbor(ly, p.x);
		if (rn==null) return ln;
		if (ln==null) return rn;
		// one of these two arcs is the culprit
		// get the bisector and compare x-coords at p.y
		var mid = this.get_middle(ln, rn);
		if (p.x > mid.x(ly)) return rn;
		else return ln;
	};
	this.printTree = function(ly) {
		this.root.printTree(ly);
	};
	this.drawtree = function(ly) {
		var leaves = [];
		var bps = [];
		this.root.fill_list(leaves, bps, ly);
		var p1 = leaves[0]; // by x = 0
		var last_y = this.parabolic(p1.x, p1.y, 0, ly);
		var step = 0.5;
		var cl = 0;
		var cbp = 0;
		var bps_left = false;
		if (bps.length > 0) bps_left = true;
		var px = leaves[0].x;
		var py = leaves[0].y;
		for (var i = 0; i < bps.length; i++) {
			var bpx = bps[i].x(ly);
			var bpy = this.parabolic(bps[i].value.site1.x, bps[i].value.site1.y,
					bpx, ly);
			var startx = bps[i].value.start.x;
			var starty = bps[i].value.start.y;
			ctx.beginPath();
			ctx.moveTo(startx, starty);
			ctx.lineTo(bpx, bpy);
			ctx.stroke();
		}
		for (var i = 1; i < BOXW+1; i += step) {
			if (bps_left) {
				if (i > bps[cbp].x(ly)) {
					cbp++;
					cl++;
					if (cbp==bps.length) bps_left = false;
				}
			}
			px = leaves[cl].x;
			py = leaves[cl].y;
			// solve equation and draw
			var y = this.parabolic(px, py, i, ly);	
			if ((y < BOXL && y > 0) && (last_y < BOXL && last_y > 0)) {
				ctx.beginPath();
				ctx.moveTo((i-1), last_y);
				ctx.lineTo(i, y);
				ctx.stroke();
			}
			// update last
			last_y = y;
		}
	};
	this.parabolic = function(px, py, x, ly) {
		return (1/(2*(py-ly)))*(x*x-2*px*x+px*px+py*py-ly*ly);
	};
	this.handle_he = function() {
		this.root.handle_he();	
	};
	this.update_lr = function(n) {
		var val;
		if (n.isLeaf()) val = n.value.site;
		else val = this.go_right(n).value.site;
		n = n.par;
		var hit_root = false;
		while (!hit_root && n==n.par.r_child) {
			n = n.par;
			if (n.par==null) hit_root = true;
		}
		if (!hit_root) n.par.value.site1 = val;
	};
	this.update_rl = function(n) {
		var val;
		if (n.isLeaf()) val = n.value.site;
		else val = this.go_left(n).value.site; 
		n = n.par;
		var hit_root = false;
		while (!hit_root && n==n.par.l_child) {
			n = n.par;
			if (n.par==null) hit_root = true;
		}
		if (!hit_root) n.par.value.site2 = val;
	};
	// no protection if you try to remove something more than once
	this.remove = function(n) {
		// delete and update internal nodes
		var par = n.par;
		if (par == null) {
			this.root = null;
			return;
		}
		var grandparent = par.par;
		if (grandparent == null) {
			var other = par.otherChild(n);
			this.root = other;
			other.par = null;
			return;
		}
		// this is gonna break-->what if par is grandparent's r child?
		if (n==par.r_child) {
			if (par==grandparent.r_child) {
				grandparent.r_child = par.l_child;
				grandparent.r_child.par = grandparent;
//				grandparent.value.site2 = grandparent.r_child.value.site;
				this.update_lr(grandparent.r_child);
			}
			else {
				grandparent.l_child = par.l_child;
				grandparent.l_child.par = grandparent;
				var val;
				if (grandparent.l_child.isLeaf())
					val = grandparent.l_child.value.site;
				else
					val = this.go_right(grandparent.l_child).value.site;
				grandparent.value.site1 = val;
				//this.update_rl(grandparent.l_child);
			}
			// update the parent
		}
		else {
			if (par==grandparent.r_child) {
				grandparent.r_child = par.r_child;
				grandparent.r_child.par = grandparent;
				var val;
				if (grandparent.r_child.isLeaf()) 
					val = grandparent.r_child.value.site;
				else
					val = this.go_left(grandparent.r_child).value.site;
				grandparent.value.site2 = val;
				//this.update_lr(grandparent.r_child);
			}
			else {
				grandparent.l_child = par.r_child;
				grandparent.l_child.par = grandparent;
				//grandparent.value.site1 = grandparent.l_child.value.site;
				this.update_rl(grandparent.l_child);
			}
		}
		// rebalance
		var n = grandparent;
		while (n != null) {
			this.balance(n);
			n = n.par;
		}
	};
	// replaces a leaf node with a subtree
	// need to update heights and rebalance - same step
	// assume v is a point data type with x, y fields
	this.replace = function(a, v) {
		// two internal nodes
		var par = a.par;
		// what x-value does p_ij have?
		// value, height, parent, l child, r child
		var p_jk = new Node(new Internal(v, a.value.site), 2, par, null, null);
		if (par==null) this.root = p_jk;
		else {
			if (a==par.r_child) par.r_child = p_jk;
			else par.l_child = p_jk;
		}
		var p_ij = new Node(new Internal(a.value.site, v), 1, p_jk, null, null);
		var p_j = new Node(new Leaf(v, null), 0, p_ij, null, null);
		var p_i = new Node(a.value, 0, p_ij, null, null);
		var p_k = new Node(a.value, 0, p_jk, null, null); 
		p_ij.l_child = p_i;
		p_ij.r_child = p_j;
		p_jk.l_child = p_ij;
		p_jk.r_child = p_k;
		p_ij.par = p_jk;
		p_jk.par = par;
		p_k.par = p_jk;

		// now go backwards up tree, adjust heights and balance
		var n = p_jk;
		while (n != null) {
			var max = Math.max(n.l_child.height, n.r_child.height);
			n.height = max+1;
			this.balance(n);
			n = n.par;
		}
		return p_j;
	};
	this.get_middle = function(a, b) {
		var n = a.par;
		while (!same_sites(n.value.site2, b.value.site)) {
			n = n.par;
			if (n==null) return null;
		}
		return n;
	};
	// given Node b, check a, b, c to see if breakpoints converge
	this.check_triple = function(Q, b, y) {
		if (!b.isLeaf()) alert('meh');
		var neighbors = this.neighbors(b);
		if (neighbors[0]==null || neighbors[1]==null) return;

		var n0b = this.get_middle(neighbors[0], b);
		var bn1 = this.get_middle(b, neighbors[1]);
		var e = this.findCircleEvent(neighbors[0], n0b, b, bn1, neighbors[1], y);
		if (e != null) {
			// insert into Q and set pointers
			b.ptr = e;
			Q.enqueue(-e.site.y, e);
		}
	};
	// returns lowest pt of circle formed by these three
	// needs a ptr back to arc that will disappear
	// compares to lowest y-value
	// a,b,c are the triple elements; ab, bc are breakpoints; y is sweepline	
	this.findCircleEvent = function(a, ab, b, bc, c, y) {
		if (a==null || c==null) return null;
		var s1 = a.value.site;
		var s2 = b.value.site;
		var s3 = c.value.site;
		if (same_sites(s1,s2) || same_sites(s2, s3)) return null;
		// find perpendicular bisectors, get intersection pt	
		// return null if intersection above line, or none
		// using "site" is unnecessary for x
		if (approx_equal(a.value.site.x, c.value.site.x) || 
				approx_equal(a.value.site.y, c.value.site.y)) return null;
		var x1 = (a.value.site.x+b.value.site.x)/2;
		var y1 = (a.value.site.y+b.value.site.y)/2;
	//	var m1 = -1/((b.value.site.y-a.value.site.y)/(b.value.site.x-a.value.site.x));
		var m1 = -(b.value.site.x-a.value.site.x)/(b.value.site.y-a.value.site.y)
		var x2 = (b.value.site.x+c.value.site.x)/2;
		var y2 = (b.value.site.y+c.value.site.y)/2;
//		var m2 = -1/((c.value.site.y-b.value.site.y)/(c.value.site.x-b.value.site.x));
		var m2 = -(c.value.site.x-b.value.site.x)/(c.value.site.y-b.value.site.y);
		// find intersection pt - right now, assumes no degeneracies
		var xi = (m1*x1-m2*x2-y1+y2)/(m1-m2); // point-slope eq
		var yi = m1*(xi-x1)+y1;
		var ax = a.value.site.x;
		var ay = a.value.site.y;
		var dist = Math.sqrt((yi-ay)*(yi-ay)+(xi-ax)*(xi-ax));		
		if (this.converging(ab, xi, bc, y)) {
			return new Event(new Site(xi, (yi-dist)), new Site(xi, yi), 1, b);
		}
		else return null;
	};
	this.converging = function(ab, xi, bc, ly) {
		var ly_prime = ly-0.001;
		var diff1 = (xi-ab.x(ly));
		var diff2 = (xi-bc.x(ly));
		var diff1p = (xi-ab.x(ly_prime));
		var diff2p = (xi-bc.x(ly_prime));
		var dist1 = diff1*diff1;
		var dist2 = diff2*diff2;
		var dist1p = diff1p*diff1p;
		var dist2p = diff2p*diff2p;
		if (dist1p < dist1 && dist2p < dist2) return true; // not yet hit bp, but closer
		else if (diff1*diff1p < 0 && diff2*diff2p < 0) return true; // already passed bp
		else return false;
	};
	// is a point p below the beach line, given sweep line at y?
	this.belowBeachLine = function(x, y, ly) {
		var s = new Site(x, ly);
		var a = this.verticallyAbove(s, ly);
		var xa = a.value.site.x;
		var ya = a.value.site.y;
		var sy = (1/(2*(ya-ly)))*(x*x-2*xa*x+xa*xa+ya*ya-ly*ly);
		if (sy > y) return true;
		else return false;
	};
	this.balance = function(n) {
		if (n.isLeaf()) return;
		var r = n.r_child;
		var l = n.l_child;
		if (n.height != Math.max(r.height, l.height)+1) {
			n.height = Math.max(r.height, l.height)+1;
		}
	//	var balance_factor = l.height - r.height; // commented out before
	//	if (balance_factor < -1 || balance_factor > 1) {
	//		// check which needs adjusting
	//		if (r.height > l.height) {
	//			// this could break
	//			var rl = r.l_child;
	//			var rr = r.r_child;
	//			if (rl.height > rr.height) {
	//				// right rotate right subtree
	//				r.right_rotate(this);
	//				// left rotate tree
	//				n.left_rotate(this);
	//			}
	//			else {
	//				n.left_rotate(this);	
	//			}
	//		}
	//		else {
	//			var ll = l.l_child;
	//			var lr = l.r_child;
	//			if (lr.height > ll.height) {
	//				// left rotate left subtree
	//				l.left_rotate(this);
	//				// right rotate tree
	//				n.right_rotate(this);
	//			}
	//			else {
	//				n.right_rotate(this);
	//			}
	//		}
	//	}
	};
}

// needs height-adjusting as part of this
function Node(value, height, par, l_child, r_child) {
	this.height = height;
	this.par = par; // parent
	this.value = value;
	this.l_child = l_child;
	this.r_child = r_child;
	this.ptr = null;
	this.isLeaf = function() {
		if (this.l_child == null && this.r_child == null) return true;
		else return false;
	};
	this.handle_he = function () {
		if (this.isLeaf()) return;
		else {
			var x = this.x(sweepline-1);
			var y = T.parabolic(this.value.site1.x, this.value.site1.y, x, sweepline-1);
			var end;
			var slope = this.value.slope;
			var xinter, yinter;
			// mins were 0 before
			// we aren't getting points that are outside the bounding region! ahh!
			if (y < this.value.start.y) {
				// test x=minboundw, y=minboundl
				if (x < this.value.start.x) {
					xinter = x-(y-MINBOUNDL)/slope;
					if (xinter > MINBOUNDW && xinter < BOUNDW) end = new Site(xinter, MINBOUNDL);
					else {
						yinter = y-slope*(x-MINBOUNDW);
						end = new Site(MINBOUNDW, yinter);
					}
				}
				// test x=boundw, y=minboundl
				else {
					xinter = x-(y-MINBOUNDL)/slope;
					if (xinter > MINBOUNDW && xinter < BOUNDW) end = new Site(xinter, MINBOUNDL);
					else {
						yinter = y-slope*(x-BOUNDW);
						end = new Site(BOUNDW, yinter);
					}
				}
			}
			else {
				// test x=minboundw, y=boundl
				if (x < this.value.start.x) {
					xinter = x-(y-BOUNDL)/slope;
					if (xinter > MINBOUNDW && xinter < BOUNDW) end = new Site(xinter, BOUNDL);
					else {
						yinter = y-slope*(x-MINBOUNDW);
						end = new Site(MINBOUNDW, yinter);
					}
				}
				// test x=boundw, y=boundl
				else {
					xinter = x-(y-BOUNDL)/slope;
					if (xinter > MINBOUNDW && xinter < BOUNDW) end = new Site(xinter, BOUNDL);
					else {
						yinter = y-slope*(x-BOUNDW);
						end = new Site(BOUNDW, yinter);
					}
				}
			}
			D.E.push(new Edge(this.value.start, end, this.value.site1, this.value.site2));
			this.l_child.handle_he();
			this.r_child.handle_he();
		}
	}
	this.x = function(ly) { // pos of sweep line
		if (this.isLeaf()) return this.value.site.x;
		else { // perform breakpoint computation
			// given the y-value of sweep line, which parabola is above you?
			// instead of doing approx equal, can we do last added?
			if (approx_equal(ly, this.value.site1.y)) return this.value.site1.x;
			if (approx_equal(ly, this.value.site2.y)) return this.value.site2.x;
			// above relies on no two having same y value->could use a list
			var site1 = this.value.site1;
			var site2 = this.value.site2;
			if (approx_equal(site1.x, site2.x) && approx_equal(site1.y, site2.y))
				return site1.x;
			var pix = site1.x;
			var piy = site1.y;
			var pjx = site2.x;
			var pjy = site2.y;
			var z = (piy-ly)/(pjy-ly);
			var a = (1-z);
			var b = -(2*pix-2*pjx*z);
			var c = -(z*(pjx*pjx+pjy*pjy-ly*ly)-pix*pix-piy*piy+ly*ly);
			// solve quadratic equation
			var n1 = -b+Math.sqrt(b*b-4*a*c);
			var n2 = -b-Math.sqrt(b*b-4*a*c);
			var d = 2*a;
			var s1 = n1/d;
			var s2 = n2/d;
			return s1;
			if (site1.y < site2.y) return Math.max(s1, s2);
			else return Math.min(s1, s2);
		}
	};
	this.inside_box = function(inside_box) {
		if (this.l_child!=null) this.l_child.inside_box(inside_box);
		if (!this.isLeaf()) {
			if (this.x(sweepline) > 0 && this.x(sweepline) < BOXW) 
				inside_box.push(this);
		}
		if (this.r_child!=null) this.r_child.inside_box(inside_box);
	};
	this.fill_list = function(leaves, bps, ly) {
		if (this.l_child!=null) this.l_child.fill_list(leaves, bps, ly);
		if (this.isLeaf()) leaves.push(this.value.site);
		else bps.push(this);
		if (this.r_child!=null) this.r_child.fill_list(leaves, bps, ly);
	};
	this.printTree = function(ly) {
		if (this.l_child!=null) this.l_child.printTree(ly);
		if (this.isLeaf()) {
			console.log("leaf x "+this.value.site.x);
			console.log("leaf y: "+this.value.site.y);
		}
		else {
			console.log("inner x: "+this.x(ly));
			if (this.value.site1 !=null) console.log("inner site1: "+this.value.site1.x);
			if (this.value.site2 !=null) console.log("inner site2: "+this.value.site2.x);
		}
		if(this.r_child!=null) this.r_child.printTree(ly);
	};
	this.other_child = function(c) {
		if (c==this.l_child) return this.r_child;
		else return this.l_child;
	};
	// when right tree is heavy
	this.left_rotate = function(T) {
		var b = this.r_child;
		var c = b.l_child;
		var par = this.par;
		this.r_child = c;
		b.par = par;
		if (par != null) {
			if (par.l_child==this) par.l_child = b;
			else par.r_child = b;
		}
		else T.root = b;
		b.l_child = this;
		this.par = b;
		if (c != null) c.par = this;
		this.height = Math.max(c.height, this.l_child.height)+1;
		b.height = Math.max(this.height, b.r_child.height)+1;
	};
	// when left tree is heavy
	this.right_rotate = function(T) {
		var b = this.l_child;
		var c = b.r_child;
		var par = this.par;
		this.l_child = c;
		b.par = par;
		if (par != null) {
			if (par.l_child==this) par.l_child=b;
			else par.r_child=b;
		}
		else T.root = b;
		b.r_child = this;
		this.par = b;
		if (c != null) c.par = this;
		this.height = Math.max(c.height, this.r_child.height)+1;
		b.height = Math.max(this.height, b.l_child.height)+1;
	};
}

function Internal(site1, site2) {
	this.site1 = site1;
	this.site2 = site2;
	// the start point is whatever has the pt has the lower y-val
	// use the start point to draw
	var min_y = Math.min(site1.y, site2.y);
	var min_site;
	var max_site;
	if (site1.y==min_y) { min_site=site1; max_site=site2; }
	else { min_site=site2; max_site=site1; }
	this.start = new Site(min_site.x, T.parabolic(max_site.x, max_site.y, min_site.x, min_site.y)); // this is what's causing the animation problem! because it should really go out...
	this.slope = -(this.site2.x-this.site1.x)/(this.site2.y-this.site1.y);
}

function Leaf(site, ptr) {
	this.site = site; // point
	this.ptr = ptr; // pointer to circle event in Q
}

function Event(site, center, type, ptr) {
	this.site = site;
	this.center = center;
	this.type = type;
	this.ptr = ptr;
	this.deleted = false; // marked deletion
	this.isSiteEvent = function() {
		if (type==0) return true;
		else return false;
	};
}

function Site(x, y) {
	this.x = x;
	this.y = y;
}
