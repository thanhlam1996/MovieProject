
$(document).ready(function () {
    $.ajax({
        type: "get",
        url: "/getsession"

    }).done(function (sess) {
        if (sess) {
            $(".link-login-register").empty();
            $('.header-top-social').empty();
            var login = '<li>';
            login+='<div class="dropdown">';
            login+='<button type="button" id="btn-name-account-logined" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">';
            login+='<span id="daucach"> || </span>'+sess.fullname+'<span id="daucach"> ||</span>';
            login+='</button>';
            login+='<div class="dropdown-menu">';
            login+='<a class="dropdown-item" href="/get-detail-account">Thông tin tài khoản</a>';
            login+='<a class="dropdown-item" href="/get-update-account">Cập nhật thông tin</a>';
            login+='<a class="dropdown-item" href="#">Đăng xuất</a>';
            login+='</div>';
            login+='</div>';
            login += '</li>';          
            var admin = "<li id='daucach'>||</li>"
            admin += '<li><a id="logined1" class="nav-member-role2" href="/pageadmin">Chuyên Trang Quản Lý</i></a></li>'
            admin += "<li id='daucach'>||</li>"
            if (sess.role == 2) {
                $(".header-top-social").append(admin);
                $(".link-login-register").append(login);
            }
            else if (sess.role > 2) {
                $(".header-top-social").append(admin);
                $(".link-login-register").append(login);
            }
            else {
                $(".link-login-register").append(login);
            }
        }
        else {
            return false;
        }
    })
});
$(document).on('click', '.signout', function () {
    $.ajax({
        url: "account/signout",
        type: "get"
    }).done(function () {
        window.location.reload();
    });
});