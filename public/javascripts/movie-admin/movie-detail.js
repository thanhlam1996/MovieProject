$(document).on('click','#btn-back-admin-and-member',function(){
    window.history.back();
})
$(document).on('click', '.btn-admin-approve', function(){
    var _title=$(this).attr('id');
    var _id=$('.movie-details-page-box').attr('id');
    $.ajax({
        url:"/movie/admin-approve-movie",
        type: 'post',
        data:{title:_title, id:_id}
    }).done(function(data){
        if(data)
        {
            alert("Bài "+_title+" được duyệt thành công!");
            window.location.href="/movie/get-admin-approve-movie"
        }
        else
        {
            return false;
        }
    })
   
})
$(document).on('click','.btn-admin-edit', function(){
    var _id=$('.movie-details-page-box').attr('id');
    window.location.href="/movie/get-update-movie-member?id="+_id;
})