function generatePts(n) {
        // returns an array of n random pts
	var P = [];
	for (var i = 0; i < n; i++) {
		var s = new Site(Math.random()*BOXW, Math.random()*BOXL);
		P.push(s);
	}
	return P;
}
