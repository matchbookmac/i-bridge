var socket = io('http://172.20.150.140');

socket.on('bridge data', function (data) {
  updateBridgeStatus(data, '#bridges-1');
});

function updateBridgeStatus(data, div) {
  $(div).text("");
  $.each(data, function (bridge) {
    var name = bridge.split(" ");
    name = name[0];
    var scheduledLift = data[bridge].scheduledLift;
    var date = scheduledLift ? new Date(scheduledLift.estimatedLiftTime) : new Date();
    $(div).append(
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
}
//
// socket.on('scheduled event', function (data) {
//   var name = data.bridge.split(" ");
//   name = name[0];
//   var date = new Date(data.estimatedLiftTime);
//   $("#" + name + " p").append(
//     "<div>potential lift at: "+
//       date.getHours() + ":" +
//       date.getMinutes() +
//     "</div>"
//   );
// });

var evtSource = new EventSource("http://172.20.150.140/sse");
evtSource.addEventListener("bridge data", function(e) {
  var data = JSON.parse(e.data);
  updateBridgeStatus(data, '#bridges-2');
  // $("body").append("<li>"+ message +"</li>");
}, false);
// evtSource.onmessage = function(e) {
//   var message = JSON.parse(e.data);
//   $("body").append("<li>"+ message +"</li>");
// };


var DateFormats = {
  short: "DD MMMM - YYYY",
  long: "dddd DD.MM.YYYY HH:mm"
};
