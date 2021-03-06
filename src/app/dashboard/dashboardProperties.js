/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardProperties', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'ngLocalize'
])
    .service('dashboardProperties',
    function ($modal, $rootScope, growl, locale, UserService) {
        this.editOptions = function (dashboard) {
            var scope = $rootScope.$new();
            scope.dashboard = angular.copy(dashboard);

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $modalInstance
             */
            var controller = function ($scope, $modalInstance) {
                $scope.ok = function (result) {
                    $modalInstance.close(scope.dashboard);
                };
                $scope.cancel = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            };

            return $modal.open({
                backdrop: 'static',
                keyboard: true,
                modalFade: true,
                size: 'lg',
                templateUrl: 'dashboard/dashboardProperties.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

;
