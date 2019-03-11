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

$(document).on("click", ".btn-submit-register-account", function () {
    if (Checkdate() == false) {
        alert("Ngày tháng năm sinh không hợp lệ");
        return false;
    }
});
// =======Check Email========

$(document).ready(function () {
    $("#reg-email").change(function () {
        var _email = $("#reg-email").val();

        $.ajax({
            url: "account/checkemail",
            data: {
                "email": _email
            },
            type: 'get'

        }).done(function (data) {
            console.log(data)
            if (data) {
                $("#err-reg").attr('style', 'display:none; color:red');
                $('.btn-submit-register-account').prop('disabled', false);
                return false;
            }
            else {
                $("#err-reg").attr('style', 'display:block; color:red');
                $('.btn-submit-register-account').prop('disabled', true);
                return true;
            }
        });
    });
});
// ==========End check email===
$(document).ready(function () {
    $("#form-register-account").validate({
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
                equalTo: "#loginpassword"
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
$(document).on('click', ".btn-submit-login-account", function () {
    var _email = $('#login-email').val();
    var _pass = $('#login-password').val();

    $.ajax({
        type: 'POST',
        url: "account/login",
        data: {
            "email": _email,
            "password": _pass
        }
    }).done(function (i) {
        // console.log(i)
        // if(sess==false)
        // {
        //     $("#err").attr('style', 'display:block; color:red');
        // }
        window.location.reload();
    });
})