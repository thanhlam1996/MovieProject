$(document).ready(function() {
    var table = $('#example').DataTable();
      
    /* Add event listeners to the two range filtering inputs */
    $('#min, #max').keyup( function() {
        table.draw();
    } );
} );