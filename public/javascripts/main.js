$(document).ready(function () {
    var slider = $("#slider").mostSlider({
        animation: 'slide',
        aniMethod: 'auto',
    });

    //   ================= JS Dialog=======================


    // ====================END JS DIALOG===================
});
// Check date for dialog register

$(document).on('click', '.signout', function () {
    $.ajax({
        url: "account/signout",
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
// $(document).on("click", "#navcreate", function () {
//     $.ajax({
//         url: "/create",
//         type: "get"
//     }).done(function () {
//         window.location.reload();
//     });
// });
// ======end tao bai viet===
// =========Check Role======
$(document).on('click', '#navcreate', function () {
    $.ajax({
        type: "get",
        url: "/getsession"

    }).done(function (sess) {
        if (sess) {
            if (sess.role == 4) {
                $.ajax({
                    url: "/create",
                    type: "get"
                }).done(function () {
                    // window.location.reload();
                    document.location.href="/create";
                });
            }
            else {
                alert("Bạn cần được cấp quyền để sử dụng chức năng này.!")
                window.location.reload();
                return false;
            }
        }
        else {
            alert("Bạn cần phải đăng nhập để sử dụng chức năng này.!")
            window.location.reload();
            return false;
        }
    })
})
// $(document).on("click", "#nav-register", function () {
//     $.ajax({
//         url: "/getsession",
//         type: "get"
//     }).done(function () {
//         window.location.reload();
//     });
// });
$(document).on('click', '#nav-register', function () {
    $.ajax({
        type: "get",
        url: "/getsession"

    }).done(function (sess) {
        if (sess) {
            if (sess.role > 1) {
                $.ajax({
                    url: "/getlistregister",
                    type: "get"
                }).done(function () {
                    // window.location.reload();
                    document.location.href="/getlistregister";
                });
            }
            else {
                alert("Bạn cần được cấp quyền để sử dụng chức năng này.!")
                window.location.reload();
                return false;
            }
        }
        else {
            alert("Bạn cần phải đăng nhập để sử dụng chức năng này.!")
            window.location.reload();
            return false;
        }
    })
})
// ===End Check role========
// ===Writing===============
$(document).on('click', '#nav-writing', function () {
    $.ajax({
        type: "get",
        url: "/getsession"

    }).done(function (sess) {
        if (sess) {
            if (sess.role > 1) {
                $.ajax({
                    url: "/getlistregisteraccout",
                    type: "get"
                }).done(function () {
                    // window.location.reload();
                    document.location.href="/getlistregisteraccout";
                });
            }
            else {
                alert("Bạn cần được cấp quyền để sử dụng chức năng này.!")
                window.location.reload();
                return false;
            }
        }
        else {
            alert("Bạn cần phải đăng nhập để sử dụng chức năng này.!")
            window.location.reload();
            return false;
        }
    })
})
// ===End writing===========
// ====Approve============
$(document).on('click', '#nav-approve', function () {
    $.ajax({
        type: "get",
        url: "/getsession"

    }).done(function (sess) {
        if (sess) {
            if (sess.role > 2) {
                $.ajax({
                    url: "/approve",
                    type: "get"
                }).done(function () {
                    // window.location.reload();
                    document.location.href="/approve";
                });
            }
            else {
                alert("Bạn cần được cấp quyền để sử dụng chức năng này.!")
                window.location.reload();
                return false;
            }
        }
        else {
            alert("Bạn cần phải đăng nhập để sử dụng chức năng này.!")
            window.location.reload();
            return false;
        }
    })
})
// =======end approve=============
// ==============================================TESSSSSSSSSSSSSSSSSSSSSSSSSSSSSsss
$(document).on('click', '.testislogin', function(){
    $.ajax({
        url:'/islogin',
        type:'get'
    }).done(function(data){
        console.log(data);
    })
})