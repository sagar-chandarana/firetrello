/**
 * Created by Sagar on 4/5/14.
 */
var trelloApp = angular.module('trello',['firebase']);

trelloApp.controller('body',function($scope,$firebase){
    $scope.boards = $firebase(new Firebase("https://fire-suck.firebaseio.com/boards"));
    $scope.addBoard = function(){
        $scope.boards.$add({name:$scope.newBoardName,by: $scope.newBoardUser});
        $scope.newBoardName =''
        $scope.newBoardUser = ""
    }

    $scope.selectedBoard = 0;

    $scope.selectBoard = function(id){
        $scope.selectedBoard = $firebase(new Firebase("https://fire-suck.firebaseio.com/boards/"+id));
        $scope.cards = $firebase(new Firebase("https://fire-suck.firebaseio.com/boards/"+id+"/cards"));
    }

    $scope.addCard = function(){
        $scope.cards.$add({name:$scope.newCardName,by: $scope.newCardUser});
        $scope.newCardName =''
        $scope.newCardUser = ""
    }

});