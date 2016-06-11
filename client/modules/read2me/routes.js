angular.module('ProjectHands.read2me')

    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/read2me');

        $stateProvider
            .state('read2me/record', {
                url: '/read2me/record',
                templateUrl: 'modules/read2me/templates/read2meRecord.html'
            }).state('read2me/listen', {
            url: '/read2me/listen',
            templateUrl: 'modules/read2me/templates/read2meListen.html'
        });

    });
