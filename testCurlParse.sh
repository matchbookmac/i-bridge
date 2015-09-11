curl -X POST \
  -H "X-Parse-Application-Id: 3auqJUgZz2edaX8bUDrB1TRoUaVxPaWZ4gSAFzYq" \
  -H "X-Parse-REST-API-Key: 3MRH51tSlpsIcfUB2sFuS6o8YLaTSCJuX8NHtl2P" \
  -d '{
        "channels": [
          "Hawthorne"
        ],
        "data": {
          "alert": "The Giants won against the Mets 2-3."
        }
      }' \
  https://api.parse.com/1/push
curl -X POST \
  -H "X-Parse-Application-Id: 3auqJUgZz2edaX8bUDrB1TRoUaVxPaWZ4gSAFzYq" \
  -H "X-Parse-REST-API-Key: 3MRH51tSlpsIcfUB2sFuS6o8YLaTSCJuX8NHtl2P" \
  -d '{
        "channels": [
          "CuevasCrossing"
        ],
        "data": {
          "alert": "has started to raise"
        }
      }' \
  https://api.parse.com/1/push
  -H "Content-Type: application/json" \
