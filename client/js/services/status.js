/**
 * Created by ND88 on 25/05/2016.
 */
angular.module('ProjectHands')

    .service('StatusService', function($resource) {

        var baseUrl = '/api/status';

        function getStatus() {
            return $resource(baseUrl + '/get_status').get();
        }

        function updateStatus(active, message) {
            return $resource(baseUrl + '/update_status').save({
                active: active,
                message: message
            });
        }

        return {
            getStatus: getStatus,
            updateStatus: updateStatus
        };
    });