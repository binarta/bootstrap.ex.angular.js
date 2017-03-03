(function () {
    angular.module('bootstrap.ex', [])
        .service('binModal', ['$rootScope', '$document', '$compile', '$templateCache', '$timeout', binModalService]);

    function binModalService($rootScope, $document, $compile, $templateCache, $timeout) {
        var self = this, scope, element;

        self.open = function (args) {
            removeElement();
            scope = $rootScope.$new();
            scope.$ctrl = args.$ctrl;
            element = $compile($templateCache.get(args.templateUrl))(scope);
            $document.find('body').append(element);

            if (element.modal) {
                element.modal('show');
                element.on('hide.bs.modal', function () {
                    $timeout(executeOnCloseHandler);
                });
                element.on('hidden.bs.modal', removeElement);
            }

            self.close = function () {
                element.modal ? element.modal('hide') : closeModal();
            };

            function executeOnCloseHandler() {
                if (args.onClose) args.onClose();
            }

            function closeModal() {
                executeOnCloseHandler();
                removeElement();
            }

            function removeElement() {
                if (scope && scope.$destroy) scope.$destroy();
                if (element && element.remove) element.remove();
                scope = undefined;
                element = undefined;
            }
        };

        self.close = angular.noop;
    }
})();