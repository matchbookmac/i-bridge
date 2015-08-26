var socket = io('http://52.26.186.75');


socket.on('bridge data', function (data) {
  $("#bridges").text("");
  $.each(data, function (bridge) {
    $("#bridges").append(
      "<div><span class='led " +
        (
          data[bridge].status ? "led-red"
                              : "led-green"
        ) + "'></span>" + "<span class='bridge' data-role='content'>" +
        bridge + "</span></div>" + "<br><br>"
    );
  });
});
