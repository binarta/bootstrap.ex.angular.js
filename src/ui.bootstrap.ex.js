angular.module('ui.bootstrap.ex', ['ui.bootstrap.modal'])
    .directive('ngClickConfirm', ['$modal', ngClickConfirmDirectiveFactory]);

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
                    controller: ModalInstanceCtrl,
                    scope: scope
                });
            });
        }
    }
}

function ModalInstanceCtrl($scope, $modalInstance) {
    $scope.yes = function () {
        $modalInstance.close();
        $scope.onSuccess();
    };

    $scope.no = function () {
        $modalInstance.dismiss('cancel');
    };
}