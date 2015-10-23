function generatePts(n) {
        // returns an array of n random pts
	var P = [];
	for (var i = 0; i < n; i++) {
		var s = new Site(Math.random()*800, Math.random()*500);
		P.push(s);
	}
	return P;
}
