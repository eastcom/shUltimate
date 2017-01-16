/**
 * jQuery小技巧
 * @authors Kerry W (wangxuan@eastcom-sw.com)
 * @date    2016-09-06 14:43:34
 * @version $Id$
 */

//回到顶部按钮
$('a.top').click(function (e) {
  e.preventDefault();
  $(document.body).animate({scrollTop: 0}, 800);
});
//预加载图片
$.preloadImages = function () {
  for (var i = 0, len = arguments.length; i < len; i++) {
    $('<img>').attr('src', arguments[i]);
  }
};
//检查图片是否加载完毕
$('img').load(function () {
  console.log('image load successful');
});
//自动修复损坏的图片
$('img').on('error', function () {
  $(this).prop('src', 'img/broken.png');
});
//禁用 input 字段
$('input[type="submit"]').prop('disabled', true);
//Ajax 调用的错误处理
$(document).ajaxError(function (e, xhr, settings, error) {
  console.log(error);
});