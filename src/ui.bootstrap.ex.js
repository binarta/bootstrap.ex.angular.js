angular.module('ui.bootstrap.ex', ['ui.bootstrap'])
    .controller('ngClickConfirmModalController', ['$scope', '$modalInstance', ngClickConfirmModalController])
    .directive('ngClickConfirm', ['$modal', ngClickConfirmDirectiveFactory])
    .directive('uiModal', ['$modal', uiModalDirectiveFactory]);

function ngClickConfirmDirectiveFactory($modal) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.onSuccess = function () {
                return scope.$eval(attrs.ngClickConfirm);
            };

            var message = attrs.confirmMessage || 'Are you sure?';

            element.bind('click', function() {
                $modal.open({
                    template: '<div class="modal-body"><h4>' + message + '</h4></div>' +
                        '<div class="modal-footer">' +
                        '<button class="btn btn-danger" ng-click="yes()">Yes</button>' +
                        '<button class="btn btn-success" ng-click="no()">No</button>' +
                        '</div>',
                    controller: 'ngClickConfirmModalController',
                    scope: scope
                });
            });
        }
    }
}

function ngClickConfirmModalController($scope, $modalInstance) {
    $scope.yes = function () {
        $modalInstance.close();
        $scope.onSuccess();
    };

    $scope.no = function () {
        $modalInstance.dismiss('cancel');
    };
}

function uiModalDirectiveFactory($modal) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('click', function() {
                $modal.open({
                    templateUrl: attrs.uiModal,
                    scope: scope
                });
            });
        }
    }
}