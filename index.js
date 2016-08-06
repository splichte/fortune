$(document).ready(function() {
  init_ctx();

  $('#but1').click(function() {
    // reset state handles generating P
    //
    reset_state(); 
    run_fortune();
  });

  // automatic start on page load
  //
  $('#but1').click();
});
