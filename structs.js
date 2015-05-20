// storage classes for the final output

function Vertex(coord) {
	this.site = coord; // a Site object
	this.incident_edge = null; // HalfEdge obj
}

function Face(s) {
	this.site = s; // Site obj
	this.outer_component = null; // HalfEdge obj
}

function HalfEdge() {
	this.origin = null; // a Vertex object
	this.twin = null; // HalfEdge obj
	this.iface = null; // Face objs
	this.next = null; // HalfEdge objs
	this.prev = null;
	this.start = null; // for drawing purposes
	this.stop = null;
	this.slope = null;
	this.b = null;
	this.draw = false;
}

function Edge(start, stop, lface, rface) {
	this.start = start;
	this.stop = stop;
	this.lface = lface;
	this.rface = rface;
}

function dcel() {
	this.V = [];
	this.F = [];
	this.E = [];
}
