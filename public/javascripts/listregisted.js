$(document).on('click','.btn-writing-registed',function(){
   var id=$('.'+$(this).attr('id')).attr('id');
   window.location.href="/getwriting?id="+id+"";    
});

$(document).on('click', '.btn-writing-unregister', function () {
   var id=$('.'+$(this).attr('id')).attr('id');
   var title=$("."+id).attr('id');
   // console.log(id+"==="+title)
   $.ajax({
       type: "post",
       url:  "/movie/unregistermoviewriter",
       data: {id:id, title:title}
   }).done(function(data){
       if(data)
       {
           alert("Hủy đăng ký thành công!");
           window.location.reload();
       }
   })
});