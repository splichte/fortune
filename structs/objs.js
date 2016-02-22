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
