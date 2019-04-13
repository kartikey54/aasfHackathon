var init = true;
chrome.extension && chrome.extension.onMessage.addListener(function(image) {
  if (init) {
    init = false;
    document.getElementById('base').style.backgroundImage = 'url('+image+')';
    document.getElementById('cropped').style.backgroundImage = 'url('+image+')';
//    document.getElementById('popped').style.backgroundImage = 'url('+image+')'; 
  } else {
    // Create an empty canvas element
    var l = parseInt($('#cropped').css('left'), 10);
    var t = parseInt($('#cropped').css('top'), 10);
    var w = parseInt($('#cropped').css('width'), 10);
    var h = parseInt($('#cropped').css('height'), 10);

    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.onload = function() {
      ctx.drawImage(img, l, t, w, h, 0, 0, w, h);
      $('#final')
        .attr('src', canvas.toDataURL('image/png'))
        .css({
          marginLeft: -0.5 * w + 'px', 
          marginTop: -0.5 * h + 'px'
        });
      $('body').addClass('final');
    };
    img.src = image;

  image = img.src.replace(/^data:image\/(png|jpg);base64,/, "");
  console.log("Returned response!!!");
  image = base64ToBlob(image);
  var formData = new FormData();
  formData.append('file', image);
  // $.ajax({
  //     url: "https://swaggy-ka-swag.onrender.com/analyze", 
  //     type: "POST", 
  //     cache: false,
  //     contentType: false,
  //     processData: false,
  //     data: formData})
  //         .done(function(e){
  //             alert('done!');
  //         });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://swaggy-ka-swag.onrender.com/analyze', true);
    //console.log(`${loc.protocol}//${loc.hostname}:${loc.port}/analyze`) // added log
    xhr.onerror = function() {alert (xhr.responseText);}
    xhr.onload = function(e) {
        if (this.readyState === 4) {
            var response = JSON.parse(e.target.responseText);
            console.log(response);
        }
        
    }
    xhr.send(formData);
   }

});
$(function() {
  $('a[href=#save]').click(function() {
    $('#toolbar').hide();
    chrome.extension.sendMessage({ action: 'capture' });
    return false;
  });
  $('a[href=#close]').click(function() {
    chrome.tabs.getCurrent(function(tab) {
      chrome.tabs.remove(tab.id);
    });
    return false;
  });
  $('.image').each(function() {
    var image = $(this);
    image
      .draggable({
        grid: [5,5],
        containment: 'document'
      })
      .resizable({
        grid: [5,5],
        containment: 'document',
        handles: 'n, e, s, w, ne, se, sw, nw'
      })
      .bind('drag', function(event, ui) {
        var left = ui.offset.left;
        var top  = ui.offset.top;
        image.css({
          backgroundPosition: (left * -1) + 'px ' + (top * -1) + 'px'
        });
      })
      .bind('resize', function(event, ui) {
        var l = parseInt($(ui.element).css('left'), 10);
        var t = parseInt($(ui.element).css('top'), 10);
        var w = parseInt($(ui.element).css('width'), 10);
        var h = parseInt($(ui.element).css('height'), 10);
        $(ui.element).css({ backgroundPosition: (l*-1) + 'px ' + (t*-1) + 'px' });
        $('.dimensions', image).text(w + 'x' + h);
      });
  });
});

function base64ToBlob(base64) 
{
    mime = 'png';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
        var slice = byteChars.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: mime});
}
