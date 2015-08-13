var socket = io();

socket.on('bridge data', function (data) {
  $("#bridges").text("");
  $.each(data, function (bridge) {
    $("#bridges").append(
      "<div class='bridge' data-role='content'><p>" +
        bridge +
        "</p><div class='led " +
          (
            data[bridge].status ? "led-red"
                                : "led-green"
          ) +
        "'></div>" +
      "</div><br>"
    );
  });
});
