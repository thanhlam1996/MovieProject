
$(document).on('click', '.btnregistionmovie', function () {
    var id=$('.'+$(this).attr('id')).attr('id');
    var title=$("."+id).attr('id');

    $.ajax({
        type: "post",
        url:  "/movie/registermoviewriter",
        data: {id:id, title:title}
    }).done(function(data){
        if(data)
        {
            alert("Đăng ký thành công!");
            window.location.reload();
        }
    })
});
