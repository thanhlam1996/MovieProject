$(document).ready(function () {
    $('#datepicker').datepicker({
        dateFormat: 'dd/mm/yy',
        showMonthAfterYear: true,
        yearSuffix: '',
        dayNamesMin: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        monthNames: ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'],
    });
})

var count = 1;
$(document).on('click', '#btnadditemmovie', function () {
    var item = '<div class="item-movie" id=' + count + '>'
    item += ' <div class="row">';
    item += ' <label class="col col-11"></label>';
    item += '  <label class="col col-1" ><button type="button" id=' + count + ' class="icon-remove-item-movie"><i class="fa fa-remove"></i></button></label>';
    item += '</div>';
    item += '<div class="row">';
    item += '<div class="col col-6">';
    item += ' <label>Tiêu đề phim</label>';
    item += ' <input type="text" class="form-control col col-10" name="title">';
    item += '</div>';
    item += '<div class="col col-6">';
    item += ' <label>Nhà phát hành</label>';
    item += '  <input type="text" class="form-control col col-10" name="producer">';
    item += '</div>';
    item += '</div>';
    item += '<div class="row">';
    item += ' <div class="col col-6 date">';
    item += '     <label>Hạn nộp bài</label>';
    item += '     <input placeholder="dd/mm/yyyy" type="text" class="form-control col col-10" id="datepicker" name="deadline">';
    item += '  </div>';
    item += '  <div class="col col-6">';
    item += '      <label>Ghi chú</label>';
    item += '     <input type="text" class="form-control col col-10" name="note">';
    item += ' </div>';
    item += ' </div>';
    item += '</div>';
    $('.item-create-movie').after(item);
    count++;
})
$(document).on('click', '.icon-remove-item-movie', function () {
    var id = $(this).attr("id");
    $('#' + id).remove();
})
// $(document).ready(function () {

// })
$('#datepicker').on('click','#datepicker',function () {
   
    $('#datepicker').datepicker({
        dateFormat: 'dd/mm/yy',
        showMonthAfterYear: true,
        yearSuffix: '',
        dayNamesMin: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        monthNames: ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'],
    });
})


