(function () {
    angular.module('bootstrap.ex', [])
        .service('binModal', ['$rootScope', '$document', '$compile', '$templateCache', binModalService]);

    function binModalService($rootScope, $document, $compile, $templateCache) {
        var self = this, scope, element, isOpen, isClosing, openDeferred;

        self.open = function (args) {
            if (!isOpen && !isClosing) open(args);
            if (!isOpen && isClosing) openDeferred = function () {
                open(args);
            };

            self.close = function () {
                isOpen = false;
                isClosing = true;
                element.modal ? element.modal('hide') : removeElement();
            };
        };

        self.close = angular.noop;

        function open(args) {
            isOpen = true;
            scope = $rootScope.$new();
            scope.$ctrl = args.$ctrl;
            element = $compile($templateCache.get(args.templateUrl))(scope);
            $document.find('body').append(element);

            if (element.modal) {
                element.modal({backdrop: 'static', keyboard: false});
                element.on('hidden.bs.modal', removeElement);
            }
        }

        function removeElement() {
            if (scope && scope.$destroy) scope.$destroy();
            if (element && element.remove) element.remove();
            scope = undefined;
            element = undefined;
            isClosing = false;
            if (openDeferred) openDeferred();
            openDeferred = undefined;
        }
    }
})();