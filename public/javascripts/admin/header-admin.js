$(document).on('click', '.admin-logout', function () {
    $.ajax({
        url: "/account/signout",
        type: "get"
    }).done(function () {
        window.location.href="/";
    });
});