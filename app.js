//module
var TeamApp = angular.module('TeamApp',['ngRoute' , 'ngResource' , 'firebase']);


//Routes

TeamApp.config(function ($routeProvider , $locationProvider) {

    $routeProvider
        .when('/', {
            templateUrl:'pages/login.html',
            controller:'AuthCtrl'
        })
        .when('/:id', {
            templateUrl:'pages/home.htm',
            controller:'homeController'
        })
        .when('/:id/list.htm', {
            templateUrl:'pages/list.htm',
            controller:'listController'
        })
        .when('/:id/editSkills.html', {
            templateUrl:'pages/editSkills.html',
            controller:'editController'
        });


    $locationProvider.hashPrefix('');
});

//services
TeamApp.factory('Auth' , function($firebaseAuth) {
    var auth = $firebaseAuth();
    return auth;
});


//controllers
TeamApp.controller('AuthCtrl' ,['$rootScope','$scope', '$window','Auth','$location' ,'$firebaseArray' , '$firebaseObject',
    function($rootScope,$scope , $window,Auth, $location , $firebaseArray , $firebaseObject) {

        $scope.test = "I am login";
        var authCtrl = this;
        $scope.email = "";
        $scope.password = "";

// HELPER FUNCTION TO NAVIGATE TO PATH
        $scope.go = function (path) {
            //console.log("in go");
            $location.path(path);
        };

        $scope.authChanged = function () {
            console.log("in Auth Changed");
            Auth.$onAuthStateChanged( function (user) {

                console.log("Logged in as: " + user.uid);
                $scope.uid = user.uid;
                $scope.go("/"+$scope.uid);
                const dbRef = firebase.database().ref();
                const userRef = dbRef.child(user.uid);
                $scope.object = $firebaseObject(userRef) ;
                console.log($scope.object);

                //make database model


            });
        };

        $scope.login = function () {
            console.log("In Login Method");
            Auth.$signInWithEmailAndPassword($scope.email , $scope.password).then(function (auth) {
                console.log("Logged in successfully");
                $scope.authChanged();

            }, function (error) {


                console.log("Error Occured" + error.message);
            });
        };

        $scope.createUser = function () {

            $scope.user.uid = {
                "email":"",
                "name":"",
                //COMPLETE THIS HOOK IT UPTO MODEL IN MODAL. CREATE USER IS DISCONNECTED

            }
            console.log("In create Method");
            Auth.$createUserWithEmailAndPassword($scope.email , $scope.password).then(function (auth) {
                console.log("User Created Successfully");
                //OPEN FORM AND ADD SKILL



                $scope.login();
            }, function (error) {
                console.log("Error Occured" + error.message);
            });
        };
    }]);

TeamApp.controller('homeController' ,['$scope', '$route', '$routeParams', '$location' , function($scope , $route, $routeParams, $location) {

    console.log("In home controller");

    $scope.param = $routeParams.id;
    console.log($scope.param);


    // Fetching data from firebase:

    var userId = firebase.auth().currentUser.uid;

    var phone,name,email,skills;

    firebase.database().ref(userId+'/email').on('value', function(snapshot){
        $scope.email = snapshot.val();

        //console.log(snapshot.val());
    });
    firebase.database().ref(userId+'/phone').on('value', function(snapshot){
        $scope.phone = snapshot.val();
        //console.log(phone);
    });
    firebase.database().ref(userId+'/skills').on('value', function(snapshot){
        $scope.skills = snapshot.val();
        //console.log(snapshot.val());
    });
    firebase.database().ref(userId+'/name').on('value', function(snapshot){
        $scope.name = snapshot.val();
        //console.log(snapshot.val());
    });

    $scope.redirect = function(){
        console.log("In redirect Method");
        //window.location = "#/list.htm";
        $location.path('#/list.htm');

    }
    $scope.redirect2 = function(){
        console.log("In redirect2 Method");
        //window.location = "#/list.htm";
        $location.path('#/editSkills.html');

    }

    firebase.database().ref.orderByChild("skills").equalTo("Java").on("child_added", function(snapshot) {
        console.log(snapshot.key());
    });


}]);


TeamApp.controller('listController' ,['$scope', '$http','Service','$route', '$routeParams' ,
    function($scope , $http, Service, $route, $routeParams ) {

        console.log("I am list");
        $scope.param = $routeParams.id;
        console.log($scope.param);

    }]);


TeamApp.controller('editController' ,['$scope', '$http','Service','$route', '$routeParams' ,
    function($scope , $http, Service, $route, $routeParams ) {

        var userId = firebase.auth().currentUser.uid;
        var skills;

        firebase.database().ref(userId+'/skills').on('value', function(snapshot){
            $scope.skills = snapshot.val();
            //console.log(snapshot.val());
        });

        console.log("I am edit");
        $scope.param = $routeParams.id;
        console.log($scope.param);

    }]);