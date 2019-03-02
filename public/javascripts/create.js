// $(".btnaddcreatemovie").click(function () {
//     var component=' <div class="form-group form-inline">'
//     component+='<label class="col col-1">Tiêu đề</label>'
//     component+='<input type="text" class="form-control col col-5">'
//     component+='<label class="col col-2">Nhà phát hành</label>'
//     component+='<input type="text" class="form-control col col-4">'
//     component+='</div>'
//     $('.component-create').append(component);
//     // $('input:text').change(function () {
//     //     var name = $(this).attr('name');
//     //     var vl = $(this).val();
//     //     $(this).val(jsUcfirst(vl));
//     // });
//     // overview++;
// });
$(document).on('click','.btnaddcreatemovie', function(){
    var component='<div class="form-group">'
    component+='<div class="row form-inline group-formcreate">'
    component+='<label class="col col-4 lable-create-title">Tiêu đề</label>'
    component+='<label class="col col-4 lable-create-producer">Nhà phát hành</label>'
    component+='<label class="col col-3 lable-create-producer">Hạn viết bài</label>'
    component+='</div>'
    component+='<div class="row form-inline">'
    component+='<input type="text" class="form-control col col-4 txt-create-title" name="title">'
    component+='<input type="text" class="form-control col col-4 txt-create-producer" name="producer">'
    component+='<input type="date" class="form-control col col-3 txt-create-producer" name="deadline">'
    component+='<button type="button" id="btn-removecomponentmovie" class="btn btn-danger">Xóa</button>'
    component+='</div>'
    component+='</div>'
    $('.component-create').append(component);
    // $('input:text').change(function () {
    //     var name = $(this).attr('name');
    //     var vl = $(this).val();
    //     $(this).val(jsUcfirst(vl));
    // });
    // overview++;
})