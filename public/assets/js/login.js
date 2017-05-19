angular.module('app').run(function($rootScope) {
    $rootScope.showReg = true;
    $rootScope.showUserName = false;
    $rootScope.showPasswordConfirm = false;
    $rootScope.showLoginButton = true;
    $rootScope.showRegButton = false;
    $rootScope.user = {};
    $rootScope.activeUser = {};
    $rootScope.activeChannel = 'Afterwork';
});

angular.module('app').controller('loginController', function($scope, $rootScope, Authentication, $state, $filter, userService) {
    var allUsers = userService.getUsers();
    allUsers.then(function(response) {
        console.log('allUsers', response);
        $rootScope.user = response;
    });

    $scope.loginButtonClicked = function() {
        if (Authentication.login($scope.email, $scope.password)) {
            $state.transitionTo('chat');
        } else {
            /*$scope.error = '';
            $scope.email = '';
            $scope.password = '';*/
            alert("Incorrect!");
        }
    };

    $scope.registerButtonClicked = function() {
        if (Authentication.register($scope.email, $scope.password, $scope.passwordConfirm)){
            var user = { email: $filter('lowercase')($scope.email), username: $scope.username, password: $scope.password, avatar: ""};
            shownElements();
            userService.post(user).then(function(response) {
                console.log('new user added');
                var allUsers = userService.getUsers();
                allUsers.then(function(response) {
                    $rootScope.user = response;
                });                
            });

        } else {
            alert("Incorrect!");
        }
    };

    $scope.registerClicked = function() {
        shownElements();
    };

    var shownElements = function() {
        $rootScope.showReg = !$rootScope.showReg;
        $rootScope.showLoginButton = !$rootScope.showLoginButton;
        $rootScope.showRegButton = !$rootScope.showRegButton;
        $rootScope.showPasswordConfirm = !$rootScope.showPasswordConfirm;
        $rootScope.showUserName = !$rootScope.showUserName;
    };
});

angular.module('app').factory('Authentication', function($rootScope, $cookies, userService) {
    return {
        login: function(inputEmail, inputPassword) {
            var isAuthenticated = false;

            for (var i = 0; i < $rootScope.user.length; i++) {
                if (inputEmail === $rootScope.user[i].email && inputPassword === $rootScope.user[i].password) {
                    var em = $rootScope.user[i].email;
                    var pw = $rootScope.user[i].password;
                    console.log(em + " " + pw);
                    isAuthenticated = true;

                    $rootScope.activeUser = $rootScope.user[i];
                    //NOTE: Set active user in userService
                    userService.active = $rootScope.user[i];
                    $cookies.put('user', userService.active._id);
                    console.log("input email and password  " + inputEmail + " " + "  " + inputPassword + ":::  database data  " +
                        $rootScope.user[i].email + "  " + $rootScope.user[i].password);
                }
            }
            return isAuthenticated;
        },
        register: function(inputEmail, inputPassword, passwordConfirm) {
            var isAuthenticated = false;
            if (inputPassword === passwordConfirm) {
                if ($rootScope.user.length > 0){
                    for (var i = 0; i < $rootScope.user.length; i++){
                        isAuthenticated = inputEmail !== $rootScope.user[i].email;
                    }
                } else {
                    isAuthenticated = true;
                }
            } else {
                isAuthenticated = false;
            }
            return isAuthenticated;
        }
    };
});