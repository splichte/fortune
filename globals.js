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

// what is this? a global so the tree can access?
var last_added = null;

// animation globals
var mult_factor = 30;
var incr = 1;

// what are these?
// I think these are used to determine when 
// the circle events have been passed, so the 
// animation looks correct.
// yeah, they are. they're used to set boundw and boundl.
var maxy = Number.NEGATIVE_INFINITY;
var miny = Number.POSITIVE_INFINITY;
var maxx = Number.NEGATIVE_INFINITY;
var minx = Number.POSITIVE_INFINITY;
