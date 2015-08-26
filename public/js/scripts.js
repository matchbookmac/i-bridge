var socket = io();

socket.on('bridge data', function (data) {
  $("#bridges").text("");
  $.each(data, function (bridge) {
    var name = bridge.split(" ");
    name = name[0];
console.log(data[bridge].status);
    var scheduledLift = data[bridge].scheduledLift;
    var date = scheduledLift ? new Date(scheduledLift.estimatedLiftTime) : new Date();
    $("#bridges").append(
      "<div class='bridge' id='" + name + "' data-role='content'>" +
        "<p>" + bridge + "</p>" +
        "<div>" +
          (
            scheduledLift ? "Potential lift at: " +
                            date.getHours() + ":" +
                            date.getMinutes()
                          : ""
          ) +
        "</div>" +
        "<div class='led " +
          (
            data[bridge].status ? "led-red"
                                : "led-green"
          ) +
        "'></div>" +
      "</div><br>"
    );
  });
});

socket.on('scheduled event', function (data) {
  var name = data.bridge.split(" ");
  name = name[0];
  var date = new Date(data.estimatedLiftTime);
  $("#" + name + " p").append(
    "<div>potential lift at: "+
      date.getHours() + ":" +
      date.getMinutes() +
    "</div>"
  );
});

var DateFormats = {
  short: "DD MMMM - YYYY",
  long: "dddd DD.MM.YYYY HH:mm"
};
