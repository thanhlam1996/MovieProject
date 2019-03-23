
$(document).on('click',".change-pass",function () {
    var pass="";
    $.ajax({
        url:"/account/check-password",
        type:"get"
    }).done(function(oldpass){
        if(oldpass)
        {
            pass=oldpass;
        }
        else
        {
            return false;
        }
    })
    $('#changepass-check').change(function () {
        var oldpass=$('#changepass-check').val();
        if(oldpass==pass)
        {
            $("#erroldpass").attr('style', 'display:none; color:red');
            $("#btn-submit-changepass").removeAttr('disabled');
        }
        else
        {
            $("#erroldpass").attr('style', 'display:block; color:red');
            $("#btn-submit-changepass").attr('disabled','disabled');
        }  
    });
});


$(document).on('click','#btn-submit-changepass', function () {
    $("#frm-change-pass").validate({
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        rules: {
            "oldpass": {
                required: true,
                minlength: 8
            },
            "newpass": {
                required: true,
                minlength: 8
            },
            "confpass": {
                required: true,
                equalTo: "#txt-newpass"
            }
        },
        messages: {
            "oldpass": {
                required: "Mật khẩu bắt buộc nhập",
                minlength: "Mật khẩu ít nhấp 8 ký tự"
            },
            "newpass": {
                required: "Mật khẩu bắt buộc nhập",
                minlength: "Mật khẩu ít nhấp 8 ký tự"
            },
            "confpass": {
                required: "Hãy nhập lại mật khẩu",
                equalTo: "Mật khẩu không khớp"
            }
        }
    });
    if( $("#frm-change-pass").valid()){
        var _newpass=$("#txt-newpass").val();
        $.ajax({
            url:"/account/change-password",
            type:"post",
            data:{
                newpass:_newpass
            }
        }).done((data)=>{
            if(data)
            {
                $.ajax({
                    url: "account/signout",
                    type: "get"
                }).done(function () {
                    alert("Đổi mật khẩu thành công. Bạn hãy đăng nhập lại để tiếp túc trải nghiệm nhé!")
                    window.location.href="/";
                });
            }else{
                alert("Lỗi máy chủ. Hãy thử lại sau ít phút!");
                return false;
            }
        })
    }
    else
    {
       return false;
    }
});