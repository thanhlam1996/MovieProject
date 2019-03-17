function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $(".imgposter-create").attr('style', 'display:block');
            $(".imgposter-create").attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
$(document).ready(function () {
    $("#customFile").change(function (e) {
        var fileName = e.target.files[0].name;
        $('.file-name').val(fileName);
       readURL(this);

    });
   
});
$(document).on('click','.btn-cancel-writing', function(){
    window.history.back();
});
