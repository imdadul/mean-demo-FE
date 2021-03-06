
(function () {
  'use strict';
  angular.module('login.services')
  .factory('loginService', LoginService);

  LoginService.$inject = ['$state','$http','CONFIG','$rootScope', '$cookies', 'ROUTE_INFO','$transitions' ];

  function LoginService($state, $http, CONFIG,$rootScope, $cookies, ROUTE_INFO,$transitions) {

    var authenticated = false;

    $transitions.onStart({
      to: function(toState){
        if( (toState.name!=ROUTE_INFO.LOGIN.STATE && toState.name!=ROUTE_INFO.SIGNUP.STATE) && isAuthenticated()==false){
          console.log('Should redirect to login');
          return true;
        }
        else  if(toState.url==ROUTE_INFO.LOGIN.URL && isAuthenticated()==true){
          console.log('Should redirect to dashboard');
          return true;
        }
      }
    }, function() {
      if(isAuthenticated()) {
        $state.go(ROUTE_INFO.DASHBOARD.STATE);
      }
      else {
        $state.go(ROUTE_INFO.LOGIN.STATE);
      }
    });

    if($cookies.getObject('globals')!=undefined) {
      $rootScope.globals = $cookies.getObject('globals');
      setUserCookies($cookies.get('rememberMe')!=undefined);
      setHeader($rootScope.globals.token);
    }

    function setHeader(token){
      $http.defaults.headers.common['Authorization'] = 'Basic ' + token;
    }

    function setUserCookies(rememberMe){
      if(rememberMe){
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1);
        $cookies.putObject('globals', $rootScope.globals,{'expires': expireDate});
        $cookies.put('rememberMe',true,{'expires': expireDate});
      }
      else {
        if($cookies.getObject('globals')==undefined) $cookies.putObject('globals', $rootScope.globals);
      }
      authenticated = true;
    }


    function clearCredentials() {
      $rootScope.globals = {};
      $cookies.remove('globals');
      $cookies.remove('rememberMe');
      $cookies.remove('lastSoretedProp');

      $http.defaults.headers.common.Authorization = 'Basic ';
    }

    function setCredentials(email,token,rememberMe) {
        $rootScope.globals = {
          email: email,
          token:token
        };
        setUserCookies(rememberMe);
        setHeader(token);
    }
    function isAuthenticated(){
      return authenticated;
    }

    function getName(){
      if($rootScope.globals==undefined) return "";
      return $rootScope.globals.email;
    }


    function logout (){
      clearCredentials();
      authenticated = false;
      $state.go(ROUTE_INFO.LOGIN.STATE);
    }

    function login(data) {
      return $http.post(CONFIG.BASE_URL+'/users/login',data);
    }


    return {
      login:login,
      logout:logout,
      setHeader:setHeader,
      setCredentials:setCredentials,
      isAuthenticated:isAuthenticated,
      getName:getName
    }
  }

})();