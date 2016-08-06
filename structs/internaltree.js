function InternalTree() {
  this.root = null;
  this.neighbors = function(q) {
    var neighbors = [];		
    if (this.root==null) return null;
    else {
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
    // this means "parabola's y-val at pos x=0 for this sweepline val."
    var step = 0.5;
    var cl = 0;
    var cbp = 0;
    var bps_left = false;
    if (bps.length > 0) bps_left = true;
    /* draw active edges */
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
    /* draw beach line */
    var last_y, this_leaf, y;
    for (var i = 0; i < BOXW+1; i += step) {

      while (bps_left && i > bps[cbp].x(ly)) {
        cbp++; cl++;
        if (cbp==bps.length) bps_left = false;
      }

      this_leaf = leaves[cl];
      y = this.parabolic(this_leaf.x, this_leaf.y, i, ly);	

      // don't draw until we have an existing "last_y"
      if (i > 0) {
        ctx.beginPath();
        ctx.moveTo((i-step), last_y);
        ctx.lineTo(i, y);
        ctx.stroke();
      }
 
      last_y = y;
    }
  };
  this.parabolic = function(px, py, x, ly) {
    return (1/(2*(py-ly)))*(x*x-2*px*x+px*px+py*py-ly*ly);
  };
  this.handle_half_edges = function() {
    this.root.handle_half_edges();	
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
}
