$(document).ready(function () {
    var slider = $("#slider").mostSlider({
        animation: 'slide',
        aniMethod: 'auto',
    });

    //   ================= JS Dialog=======================


    // ====================END JS DIALOG===================
});
$(document).on("click", ".linklogin", function () {
    $(".modal1").attr("style", "display:block");
});
$(document).on("click", ".cancelbtn", function () {
    $(".modal1").attr("style", "display:none");
});
// Register
$(document).on("click", ".linkregister", function () {
    $(".modal2").attr("style", "display:block");
});
$(document).on("click", ".cancelbtn", function () {
    $(".modal2").attr("style", "display:none");
});
$(document).ready(function () {

    var d = new Date();
    $("#day").val(d.getDate());
    $("#month").val(d.getUTCMonth() + 1);
    $("#year").val(d.getFullYear());

});

function Checkdate() {
    var d = new Date();
    var day = $("#day").val();
    var month = $("#month").val();
    var year = $("#year").val();
    if (year > $("#year").val(d.getFullYear())) {
        return false;
    } else {
        if (month == 2) {
            if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
                if (day <= 29) {

                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                if (day <= 28) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        else {
            if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                if (day <= 31) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                if (day <= 30) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }
}

$(document).on("click", "#btnregister", function () {
    if (Checkdate() == false) {
        alert("Ngày tháng năm sinh không hợp lệ");
        return false;
    }
});
// =========Check Email========
$(document).ready(function () {
    $("#emailregister").change(function () {
        var _email = $("#emailregister").val();

        $.ajax({
            url: "/checkemail",
            data: {
                "email": _email
            },
            type: 'get'

        }).done(function (data) {
            console.log(data)
            if (data) {
                $("#check").hide();
                $('#btnregister').prop('disabled', false);
                return false;
            }
            else {
                $("#check").show();
                $('#btnregister').prop('disabled', true);
                return true;
            }
        });
    });
});
// ==========End check email===
$(document).ready(function () {
    $("#formregister").validate({
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        rules: {
            "email": {
                required: true,
                email: true
            },
            "fullname": {
                required: true

            },
            "password": {
                required: true,
                minlength: 8
            },
            "confirmpassword": {
                required: true,
                equalTo: "#password"
            },
            "phone": {
                required: true
            },
            "adress": {
                required: true
            }
        },
        messages: {
            "email": {
                required: "Email không hợp lệ",
                email: "Email bắt buộc nhập"
            },
            "fullname": {
                required: "Họ và tên bắt buộc nhập"
            },
            "password": {
                required: "Mật khẩu bắt buộc nhập",
                minlength: "Mật khẩu ít nhấp 8 ký tự"
            },
            "confirmpassword": {
                required: "Hãy nhập lại mật khẩu",
                equalTo: "Mật khẩu không khớp"
            },
            "phone": {
                required: "Số điện thoại bắt buộc nhập"
            },
            "adress": {
                required: "Địa chỉ bắt buộc nhập"
            }

        }
    });
});
$(document).on('click', "#btnlogin", function () {
    var _email = $('#email').val();
    var _pass = $('#password').val();

    $.ajax({
        type: 'POST',
        url: "/login",
        data: {
            "email": _email,
            "password": _pass
        }
    }).done(function (sess) {
        if (sess) {
            $(".modal1").attr("style", "display:none");
            $(".arealogin").empty();
            $(".arearegister").empty();
            var login = "<a class='nav-link member'><i class='fas fa-user-check'> " + sess.fullname + "</i></a>"
            var register = "<a class='nav-link signout'><i class='fas fa-user-times'> Đăng xuất</i></a>"
            $(".arealogin").append(login);
            $(".arearegister").append(register);
        }
        else {
            $("#err").attr('style', 'display:block; color:red');
        }
    });
})
$(document).on('click', '.signout', function () {
    $.ajax({
        url: "/signout",
        type: "get"
    }).done(function () {
        window.location.reload();
    });
});
// Load form sau khi login thanh cong
$(document).ready(function () {
    $.ajax({
        type: "get",
        url: "/getsession"

    }).done(function (sess) {
        if (sess) {
            $(".modal1").attr("style", "display:none");
            $(".arealogin").empty();
            $(".arearegister").empty();
            var login = "<a class='nav-link member'><i class='fas fa-user-check'> " + sess.fullname + "</i></a>"
            var register = "<a class='nav-link signout'><i class='fas fa-user-times'> Đăng xuất</i></a>"
            $(".arealogin").append(login);
            $(".arearegister").append(register);
        }
        else {
            return false;
        }
    })
});
//===========Click menu
// ==<a =>Tạo bài viết======
$(document).on("click", "#create", function () {
    $.ajax({
        url: "/create",
        type: "get"
    }).done(function () {
        window.location.reload();
    });
});
// ======end tao bai viet===
