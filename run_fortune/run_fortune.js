function run_fortune() {
  enqueue_pts();
  step_animation();
}

function enqueue_pts() {
  for (var i = 0; i < P.length; i++) {
    var site_event = new Event(P[i], null, 0, null);
    // smaller key values have higher priority
    // 
    Q.enqueue(-P[i].y, site_event); 
  }
}

function step_animation() {
  step_algorithm();
  drawer(P, false);

  if (!finished) {
    var int_diff = Math.floor(sweepline-Q.peek().site.y);
    timeouts.push(setTimeout(step_animation, mult_factor*int_diff));
    for (var i = 1; i < int_diff; i++) { 
      timeouts.push(setTimeout(function() {
        sweepline -= incr;
        drawer(P, false);
      }, mult_factor*incr*i));
    }
  } else {
    var inside_box = [];
    // so many side-effects...
    // problem area here? 
    T.root.return_inside_canvas(inside_box);
    finish = setInterval(function() {
      var is_last_drawing = false;
      sweepline -= incr;
      if (inside_box.length==0) {
        clearInterval(finish);
        handle_half_edges();
        is_last_drawing = true;
      }
      for (var i = 0; i < inside_box.length; i++) {
        var n = inside_box[i];

        /* TODO: abstract "is outside canvas" function */
        /* use the fortune parabolic function to figure out 
         * where the current y-pos of the internal node is */
        var nx = n.x(sweepline);
        var nvs = n.value.site1;
        var ny = T.parabolic(nvs.x, nvs.y, nx, sweepline);
        if (nx < 0 || nx > BOXW || ny < 0 || ny > BOXL) {
          inside_box.splice(i, 1);
        }
      }
      drawer(P, is_last_drawing);
    }, mult_factor);
  }
}

function handle_half_edges() {
  BOUNDW = Math.max(BOXW, maxx+1);
  BOUNDL = Math.max(BOXL, maxy+1);
  MINBOUNDW = Math.min(0, minx-1);
  MINBOUNDL = Math.min(0, miny-1);
  T.handle_half_edges();
}

function step_algorithm() {
  if (!finished) {

    // get a new event
    var e = get_next_event();
    if (e === null) return;

    update_box_and_sweepline(e.site);

    handle_event(e);
  }
}

function drawer(P, is_last_drawing) {
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
/*  for (var i = 0; i < D.V.length; i++) {
    filled_circle(D.V[i].site.x, D.V[i].site.y, 1, 1);	
  }*/

  // Voronoi diagram edges
  for (var i = 0; i < D.E.length; i++) {
    if (D.E[i].start!=null && D.E[i].stop!=null) {
      ctx.beginPath();
      ctx.moveTo(D.E[i].start.x, D.E[i].start.y);
      ctx.lineTo(D.E[i].stop.x, D.E[i].stop.y);
      ctx.stroke();
    }
  }

  if (!is_last_drawing) {
    // sweep line
    ctx.beginPath();
    ctx.moveTo(0, sweepline);
    ctx.lineTo(BOXW, sweepline);
    ctx.stroke();
  
    // parabolic arcs defined by the sweep line position
    T.drawtree(sweepline);
  }
}
