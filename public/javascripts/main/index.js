
$(document).ready(function () {
    $.ajax({
        type: "get",
        url: "/getsession"

    }).done(function (sess) {
        if (sess) {
            $(".link-login-register").empty();
            $('.header-top-social').empty();
            var login = "<li><a id='logined' href='#'>"+sess.fullname+"</a></li>";
                login+="<li id='daucach'>||</li>"
                login+="<li><a id='logined' class='signout' href='#'>Đăng xuất</a></li>"
            var menurole='<ul>'
            menurole+='<li><a id="logined1" class="nav-member-role2" href="/movie/list-movie-registed">Viết Bài</i></a></li>';
            menurole+="<li id='daucach'>||</li>"
            menurole+='<li><a id="logined1" class="nav-member-role2" href="/movie/list-movie-waiting-register-write">Đăng Ký BV</a></li>';
            menurole+="<li id='daucach'>||</li>"
            menurole+='<li><a id="logined1" class="nav-member-role2" href="#">BV Chờ Duyệt</a></li>';
            menurole+="<li id='daucach'>||</li>"
            menurole+='<li><a id="logined1" class="nav-member-role2" href="#">Danh Sách BV</i></a></li>';
            menurole+='</ul>';

          
            var admin="<li id='daucach'>||</li>"
            admin+='<li><a id="logined1" class="nav-member-role2" href="admin/pageadmin">Chuyên Trang Quản Lý</i></a></li>'
            admin+="<li id='daucach'>||</li>"
            if(sess.role==2)
            {  
                $(".header-top-social").append(menurole);
                $(".link-login-register").append(login);
            }
            else if(sess.role>2)
            {
                $(".header-top-social").append(admin);
                $(".link-login-register").append(login);
            }
            else
            {
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