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
	this.handle_half_edges = function () {
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
					xinter = x-y/slope;
					if (xinter > 0 && xinter < BOUNDW) end = new Site(xinter, 0);
					else {
						yinter = y-slope*x;
						end = new Site(0, yinter);
					}
				}
				// test x=boundw, y=minboundl
				else {
					xinter = x-y/slope;
					if (xinter > 0 && xinter < BOUNDW) end = new Site(xinter, 0);
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
					if (xinter > 0 && xinter < BOUNDW) end = new Site(xinter, BOUNDL);
					else {
						yinter = y-slope*x;
						end = new Site(0, yinter);
					}
				}
				// test x=boundw, y=boundl
				else {
					xinter = x-(y-BOUNDL)/slope;
					if (xinter > 0 && xinter < BOUNDW) end = new Site(xinter, BOUNDL);
					else {
						yinter = y-slope*(x-BOUNDW);
						end = new Site(BOUNDW, yinter);
					}
				}
			}

      D.E.push(new Edge(this.value.start, end, this.value.site1, this.value.site2));
			this.l_child.handle_half_edges();
			this.r_child.handle_half_edges();
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
	this.is_inside_canvas = function(inside_box) {
		if (this.l_child!=null) this.l_child.is_inside_canvas(inside_box);
		if (!this.isLeaf() && is_inside_canvas(this.x(sweepline))) {
      inside_box.push(this);
    }
		if (this.r_child!=null) this.r_child.is_inside_canvas(inside_box);
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
}
