$(document).on('click', '.btn-approve', function(){
    var id=$("."+$(this).attr('id')).attr('id');
    var title=$('.'+id).attr('id');
    $.ajax({
        type: "post",
        url:  "/movie/approved",
        data: {id:id, title:title}
    }).done(function(data){
        if(data)
        {
            alert("Duyệt bài thành công!");
            window.location.reload();
        }
    })
});
// Unapprove
$(document).on('click', '.btn-unapprove', function(){
    var id=$("."+$(this).attr('id')).attr('id');
    var title=$('.'+id).attr('id');
    $(".btn-unapprove-note").click(function(){
        var note=$(".txt-unapprove-note").val();
        $.ajax({
            type: "post",
            url:  "/movie/unapprove",
            data: {id:id, title:title,note:note}
        }).done(function(data){
            if(data)
            {
                alert("Không duyệt bài thành công!");
                window.location.reload();
            }
        })
    })
    
});
// Delete
$(document).on('click', '.btn-remove-approve', function(){
    var id=$("."+$(this).attr('id')).attr('id');
    var title=$('.'+id).attr('id');
    $(".btn-remove-approve").click(function(){
       
        $.ajax({
            type: "post",
            url:  "/movie/deletemovie",
            data: {id:id, title:title}
        }).done(function(data){
            if(data)
            {
                alert("Xóa bài thành công!");
                window.location.reload();
            }
        })
    })
    
});
$(document).on('click', '.btn-view-post-admin', function(){
    var id=$("."+$(this).attr('id')).attr('id');
    // var title=$('.'+id).attr('id');
    window.location.href="/getmovie?id="+id;    
});