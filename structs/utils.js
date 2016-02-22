function same_sites(a,b) {
	if (approx_equal(a.x, b.x) && approx_equal(a.y, b.y))
		return true;
	else return false;
}

function is_inside_canvas(x) {
  return (x > 0 && x < BOXW);
}

function approx_equal(a,b) {
	if (Math.abs(a-b) < 0.0000001) return true;
	else return false;
}
