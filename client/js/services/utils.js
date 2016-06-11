angular.module('ProjectHands')

.service('UtilsService', function($rootScope, $mdToast, ROLES) {


    /**
     * Change date object to HH:MM format
     * @param timestamp {string} : Date Object String
     * @returns {string}
     */
    function parseTimestamp(timestamp) {
        var date = new Date(timestamp);
        var minutes = date.getMinutes();
        var hours = date.getHours();
        if (minutes < 10)
            minutes = '0' + minutes;
        if (hours < 10)
            hours = '0' + hours;

        return hours + ':' + minutes;
    }


    /**
     * Return a string with every first letter of every word capitalized
     * @param   {string} str : The string to title case
     * @returns {string} Title cased string
     */
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    /**
     * Invoke Angular-Material's Toast
     * @param {string} message  : The message to be shown in the toast
     * @param {string} anchor   : Element selector of the element the toast will attach to.
     * @param {string} position : The position of the toast in relation to the anchor element
     */
    function makeToast(message, anchor, position) {
        $mdToast.show(
            $mdToast.simple()
            .textContent(message)
            .position(position)
            .parent(anchor)
            .capsule(true)
            .hideDelay(2000)
        );
    }

    /**
     * Convert date object to DD/MM/YYYY string
     * @param date {object}
     */
    function dateToDDMMYYYY(date) {
        if(!date)
            return '';

        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        if(day < 10)
            day = '0' + day;
        if(month < 10)
            month = '0' + month;


        return day + '/' + month + '/' + year;
    }


    /**
     * Translate user role to hebrew
     * @param role {String} : user role
     * @returns {String} : role translated to hebrew
     */
    function translateRole(role) {
        switch(role) {
            case ROLES.GUEST:
                return 'אורח';
            case ROLES.VOLUNTEER:
                return 'מתנדב';
            case ROLES.TEAM_LEAD:
                return 'מנהל צוות';
            case ROLES.ADMIN:
                return 'אדמין';
            default:
                return 'failed to translate role';
        }

    }


    return {
        parseTimestamp: parseTimestamp,
        toTitleCase: toTitleCase,
        makeToast: makeToast,
        dateToDDMMYYYY: dateToDDMMYYYY,
        translateRole: translateRole
    };
});
