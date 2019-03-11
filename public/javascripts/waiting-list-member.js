$(document).on('click', '.btn-view-post-member', function(){
    var id=$("."+$(this).attr('id')).attr('id');
    // var title=$('.'+id).attr('id');
    window.location.href="/getmovie?id="+id;    
});
$(document).on('click', '.btn-edit-post-member', function(){
    var id=$("."+$(this).attr('id')).attr('id');
    // var title=$('.'+id).attr('id');
    window.location.href="/update-movie?id="+id;    
});