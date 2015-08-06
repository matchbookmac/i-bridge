var socket = io();

socket.on('bridge data', function (data) {
  $("#bridges").text("");
  $.each(data, function (bridge) {
    $("#bridges").append(
      "<div class='bridge'>" +
        bridge +
        ": " +
        (
          data[bridge].status
            ? "up"
            : "down"
        ) +
      "</div><br>"
    );
  });
})
