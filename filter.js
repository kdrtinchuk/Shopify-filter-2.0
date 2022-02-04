//Please check jquery loaded in your site.....
//call this file in the collection template above.......

$(document).ready(function(){

  $('body').on('click', '.filter-header', function(e) {
    if (!$(this).parent().hasClass('filter-open')) {
      $('.filter-box').removeClass('filter-open');
      $('.filter-values').slideUp(400);

      $(this).parent().addClass('filter-open');
      $(this).parent().find('.filter-values').slideDown(400);
    } else {
      $(this).parent().removeClass('filter-open');
      $(this).parent().find('.filter-values').slideUp(400);
    }
  });

  var main_arr = [];
  var min = parseInt($("#min_price").attr('min'));
  var max = parseInt($("#max_price").attr('max'));

  function slider(min_val, max_val) {
    $("#slider-range").slider({
      range: true,
      orientation: "horizontal",
      min: min,
      max: max,
      values: [min_val, max_val],
      step: 100,

      slide: function (event, ui) {
        if (ui.values[0] == ui.values[1]) {
          return false;
        }
        $("#min_price").val(ui.values[0]);
        $("#max_price").val(ui.values[1]);
      },
      stop: function(event, ui) {
        $('.filter-values li input').trigger('change');
      }
    });
  }
  
  function get_data(url, index) {
    $.get(url, function(data) {
      var html = $(data).find('[data-collection]').html();
      $('[data-collection]').html(html);
      $('[data-filter-box]').each(function(p, q) {
        if (p != index) {
          $(q, '[data-index="'+p+'"]').html($(data).find('[data-filter-box][data-index="'+p+'"]').html());
        }
      })
      var active_filter_html = $(data).find('[data-active-filter]').html()
      $('[data-active-filter]').html(active_filter_html);
      if ($("#min_price").val() != '') {
        var get_cur_min = parseInt($(data).find('#min_price').val());
      } else {
        var get_cur_min = min;
      }
      if ($("#max_price").val() != '') {
        var get_cur_max = parseInt($(data).find('#max_price').val());
      } else {
        var get_cur_max = max;
      }
      slider(get_cur_min, get_cur_max);
    });
  }
  
  function update_filter(arr) {
    $('[data-filter-box]:not([data-filter-price-box])').each(function(i, v) {
      $(v).find('[data-filter-value].active').each(function(j, k) {
        var filter_name = $(k).data('name');
        var filter_value = $(k).data('value');
        var final = filter_name+'='+filter_value;
        if (arr.indexOf(filter_value) == -1 && final.indexOf('undefined') == -1) {
          arr.push(final);
        }
      });
    });
    $('[data-filter-value] input').each(function(i, v) {
      if ($(v).val() != '') {
        var price_name = $(v).parent().data('name');
        var price_value = $(v).val();
        var price_final = price_name+'='+price_value;
        arr.push(price_final);
      }
    });
    main_arr = arr;
  }

  $('body').on('click', '[data-filter-box]:not([data-filter-price-box]) .filter-values li', function(e) {
    $(this).toggleClass('active');
    var cur_url = $('[data-filter-url]').data('col');
    var section_id = $('[data-filter-url]').data('id');
    var matchIndex = $(this).closest('[data-filter-box]').data('index');
    var search_param = [];
    update_filter(search_param);
    var get_url = cur_url+'?section_id='+section_id+'&'+main_arr.join('&');
    if (main_arr != '') {
      history.pushState({ search_param }, '', window.location.pathname+'?'+main_arr.join('&'));
    } else {
      history.pushState({ search_param }, '', window.location.pathname);
    }
    get_data(get_url, matchIndex);
  });

  $('body').on('change keyup', '.filter-values li input', function(e) {
    var cur_url = $('[data-filter-url]').data('col');
    var section_id = $('[data-filter-url]').data('id');
    var matchIndex = $(this).closest('[data-filter-box]').data('index');
    var price_arr = [];
    update_filter(price_arr);
    setTimeout(function() {
      var get_url = cur_url+'?section_id='+section_id+'&'+main_arr.join('&');
      if (main_arr != '') {
        history.pushState({ main_arr }, '', window.location.pathname+'?'+main_arr.join('&'));
      } else {
        history.pushState({ main_arr }, '', window.location.pathname);
      }
      get_data(get_url, matchIndex);
    }, 1500);
  });

  $('body').on('click', '[data-remove]', function(e) {
    e.preventDefault();
    var cur_url = $('[data-filter-url]').data('col');
    var section_id = $('[data-filter-url]').data('id');
    var remove_param = [];
    update_filter(remove_param);
    if ($(this).hasClass('price-remove')) {
      var new_arr = main_arr.filter(function(elem){
        return elem.indexOf('price') == -1;
      });
    } else {
      var active_name = $(this).find('span').data('name');
      var active_value = $(this).find('span').data('value');
      var active_final = active_name+'='+active_value;
      var new_arr = main_arr.filter(function(elem){
        return elem != active_final; 
      });
    }
    var get_url = cur_url+'?section_id='+section_id+'&'+new_arr.join('&');
    if (new_arr != '') {
      history.pushState({ remove_param }, '', window.location.pathname+'?'+new_arr.join('&'));
    } else {
      history.pushState({ remove_param }, '', window.location.pathname);
    }
    get_data(get_url);
  });

  $('#price-range-submit').hide();
  $("#min_price,#max_price").on('change', function () {
    $('#price-range-submit').show();
    var min_price_range = parseInt($("#min_price").val());
    var max_price_range = parseInt($("#max_price").val());
    if (min_price_range > max_price_range) {
      $('#max_price').val(min_price_range);
    }
    $("#slider-range").slider({
      values: [min_price_range, max_price_range]
    });
  });

  $("#min_price,#max_price").on("paste keyup", function () {                                        
    $('#price-range-submit').show();
    var min_price_range = parseInt($("#min_price").val());
    var max_price_range = parseInt($("#max_price").val());
    if(min_price_range == max_price_range){
      max_price_range = min_price_range + 100;
      $("#min_price").val(min_price_range);		
      $("#max_price").val(max_price_range);
    }
    $("#slider-range").slider({
      values: [min_price_range, max_price_range]
    });
  });

  $(function () {
    if ($("#min_price").val() != '') {
      var cur_start = parseInt($("#min_price").val());
    } else {
      var cur_start = min;
    }
    if ($("#max_price").val() != '') {
      var cur_end = parseInt($("#max_price").val());
    } else {
      var cur_end = max;
    }
    slider(cur_start, cur_end);
  });
});
