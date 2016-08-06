function update_box_and_sweepline(site) {
  if (site.y > maxy) maxy = site.y;
  if (site.x > maxx) maxx = site.x;
  if (site.y < miny) miny = site.y;
  if (site.x < minx) minx = site.x;

  sweepline = site.y;
}

function get_next_event() {
  var e = Q.dequeue();
  while (e.deleted) {
    e = Q.dequeue();
    if (Q.isEmpty()) {
      finished = true;
      return null;
    }
  }
  return e;
}

function store_new_edges(mid1, mid2, n0, g, n1) {
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
