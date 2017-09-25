var app = angular.module('Feed',['infinite-scroll']);

app.controller('feedController',function($scope, $http){
  $scope.data = [];
  $scope.newest = {};
  $scope.current = {};
  $scope.origImages = [];
  $scope.comments = [];
  var newestID;
  var currentID;

  $http.get('#')
    .then(function (response) {
    })
    .catch(function (data) {
    });

    getOrigionalData();
    startData();

    fillComments();
    // fillComments("hi");


  function fillComments() {
    var i;
    for (i=5;i>=0;i--)
      getComments(i,function(){
      });

  }

  $scope.getMoreStories = function () {
    var i = currentID-1;
    var end = currentID - 4
    currentID = end + 1
    function next() {
        if (i > end && i>0) {
            getFeedData(i,next);

        } else {
        }
        i--;
    }
    next();

  }

  $scope.incrementScore = function(id,index){
    var button = document.getElementById("button_"+index);
    var icon = document.getElementById("icon_"+index);
    var text = document.getElementById("likecount_"+index);
    var clicked = button.getAttribute('data-clicked');
    if(clicked == 0){
    $scope.data[index].score += 1;
      var q = new XMLHttpRequest();
      q.onreadystatechange = receive;
      q.open("POST", "idIncrementScore.json", true);
      q.send(id);

      function receive() {
        if (this.readyState != XMLHttpRequest.DONE) return;
      }
      button.setAttribute('data-clicked',"1");
      icon.setAttribute('data',"resources/likeiconclicked.svg");
      text.style.color="#2196F3"
      button.removeAttribute("data-ng-click");
      button.removeAttribute("href");
      // el.setAttribute('value',"Liked!")
      // el.style.backgroundColor="#f9f9f9";
      // el.style.color="#8c8c8c"
    }

  }

  function startData(){
    addNewest(function() {
      var i = newestID-1;
      function next() {
          if (i > newestID-3) {
              getFeedData(i,next);

          } else {
          }
          i--;
      }
      next();

    });
  }

  function addNewest(_callback){
    getNewestFeedData(function(){
      $scope.data.push($scope.newest);
      _callback();
    });
  }

  function getNewestFeedData(_callback){
    var q = new XMLHttpRequest();
    q.onreadystatechange = receive;
    q.open("GET", "newFeedData.json", true);
    q.send();
    function receive() {
    if (this.readyState != XMLHttpRequest.DONE) return;
      $scope.newest = JSON.parse(this.response);
      if($scope.newest.score == null) $scope.newest.score = 0;
      newestID = $scope.newest.userImageID;
      _callback();
    }

  }

  function getFeedData(id,_callback){
    var q = new XMLHttpRequest();
    q.onreadystatechange = receive;
    q.open("POST", "idFeedData.json", true);
    q.send(id);

    function receive() {
    if (this.readyState != XMLHttpRequest.DONE) return;
      var current = JSON.parse(this.response);
      $scope.current = current;
      if(current.score == null) current.score = 0;
      currentID = current.userImageID;
      if(currentID == 1){
        var loadButton = document.getElementById("loadMore");
        loadButton.style.display = "none";
        var endText = document.getElementById("endText");
        endText.style.visibility = "visible";
      }
      $scope.data.push(current);
      _callback();
    }

  }

  function getOrigionalData(){
    var q = new XMLHttpRequest();
    q.onreadystatechange = receive;
    q.open("GET", "origionalData.json", true);
    q.send();
    function receive() {
    if (this.readyState != XMLHttpRequest.DONE) return;
      $scope.origImages = JSON.parse(this.response);
    }
  }

  function getComments(id,_callback){
    var q = new XMLHttpRequest();
    q.onreadystatechange = receive;
    q.open("POST", "idCommentsData.json", true);
    q.send(id);

    function receive() {
    if (this.readyState != XMLHttpRequest.DONE) return;
      $scope.comments[id] = JSON.parse(this.response);
      _callback();

    }

  }
   $scope.saveComment = function (id, comment,index){
    var comBox = document.getElementById("commentInput_"+index);
    comToPush = {"userImageID": id, "comment": comment};
    if (typeof $scope.comments[id]=='undefined'){
      $scope.comments[id] = [];
    }
    $scope.comments[id].push(comToPush);
    scrollToBottom("comments_"+index);
    var fd = $scope.comments[id].length;
    var q = new XMLHttpRequest();
    q.onreadystatechange = receive;
    q.open("POST", "idSaveComment.json", true);

    var idComment = id.toString() + "idEnd" + comment;
    q.send(idComment);
    comBox.value = '';


    function receive() {
    if (this.readyState != XMLHttpRequest.DONE) return;
      // console.log(this.response);

    }
  }

  $scope.getImageLink = function(id){
    if (typeof $scope.origImages[id-1]!='undefined')
    return $scope.origImages[id-1].location;
    else return "error.png";
  }
  function scrollToBottom(id){
   var div = document.getElementById(id);
   div.scrollTop = div.scrollHeight - div.clientHeight;
}


});
