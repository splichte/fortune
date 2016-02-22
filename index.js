$(document).ready(function() {
  init_ctx();

	$('#but1').click(function() {
    reset_state();
    P = fill_test_P();

		run_fortune();

    for (var i = 0; i < P.length; i++) {
      filled_circle(P[i].x, P[i].y, 2, 0);
    }
		var s = setInterval(function() {
			if (finished) {
				clearInterval(s);
				nochange = false;
				var pts_str = "";
				for (var i = 0; i < D.V.length; i++) {
					pts_str += D.V[i].site.x+" "+D.V[i].site.y+"\n";
				}
				$('#ta').val(pts_str);
				var e_str = "";
				for (var i = 0; i < D.E.length; i++) {
					e_str += D.E[i].start.x+" "+D.E[i].start.y+" "+D.E[i].stop.x+" "+D.E[i].stop.y+"\n";
				}
				$('#tae').val(e_str);
				if (anim!=3) {
					for (var i = 0; i < D.V.length; i++) {
						filled_circle(D.V[i].site.x, D.V[i].site.y, 2, 1);
					}
					ctx.clearRect(0, 0, BOXW, BOXL);
					ctx.strokeRect(0, 0, BOXW, BOXL);

					for (var i = 0; i < P.length; i++) {
						filled_circle(P[i].x, P[i].y, 2, 0);
					}
					for (var i = 0; i < D.V.length; i++) {
						filled_circle(D.V[i].site.x, D.V[i].site.y, 1, 1);	
					}
					for (var i = 0; i < D.E.length; i++) {
						if (D.E[i].start!=null && D.E[i].stop!=null) {
							ctx.beginPath();
							ctx.moveTo(D.E[i].start.x, D.E[i].start.y);
							ctx.lineTo(D.E[i].stop.x, D.E[i].stop.y);
							ctx.stroke();
						}
					}
				}
			}
		}, 1000);
	});
  $('#but1').click();
});
