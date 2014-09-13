var chatApp = angular.module('chat', ['firebase']);

chatApp.controller('chatController', ['$scope', '$firebase',
    function($scope, $firebase) {
      var baseRef = new Firebase("https://tokku.firebaseio.com/");

      var matchId;
      var waitingRef = baseRef.child('waiting');
      var chatroomRef = baseRef.child('chatroom');
      var privateRoomRef = baseRef;
      $scope.id = null;

      $scope.matched = false;
      $scope.loading = false;

      $scope.findNewMatch = function() {
        $firebase(waitingRef).$push({
            matched: false
          }).then(function(newChildRef) {
            $scope.id = newChildRef.name();
            console.log("added record with id " + newChildRef.name());
          });

        var potentialMatches = $firebase(waitingRef).$asArray();
        potentialMatches.$loaded().then(function() {
          console.log(potentialMatches);
          if(potentialMatches.length > 1) {
            matchId = potentialMatches[0].$id;
            $firebase(chatroomRef).$push({
              roomId: "init"
            }).then(function(newChildRef) {
              var roomId = newChildRef.name();
              var matchRef = waitingRef.child(matchId);
              $firebase(matchRef).$set({
                matched: roomId
              });
              privateRoomRef = chatroomRef.child(roomId);
              $scope.matched = true;
              $scope.messages = $firebase(privateRoomRef).$asArray();
              $firebase(waitingRef).$remove($scope.id);
            });
          } else {
            console.log("no match");
            $scope.loading = true;
            var room = $firebase(waitingRef.child($scope.id)).$asObject();
            room.$watch(function() {
              if(room.matched) {
                privateRoomRef = chatroomRef.child(room.matched);
                $scope.matched = true;
                $scope.messages = $firebase(privateRoomRef).$asArray();
                $firebase(waitingRef).$remove($scope.id);

                $scope.loading = false;
              }
            });


          }
        });

      }

      $scope.messages = null;
      $scope.addMessage = function(e) {
        if (e.keyCode === 13 && $scope.msg) {
          var name = $scope.name || 'anonymous';
          $scope.messages.$add({
            id: $scope.id,
            from: name,
            body: $scope.msg
          });
          $scope.msg = "";
        }
      }

      window.onbeforeunload = closingCode;
      function closingCode(){
        if($scope.id != null)
          $firebase(waitingRef).$remove($scope.id);
        return null;
      }
    }

]);

