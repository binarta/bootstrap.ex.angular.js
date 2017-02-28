(function () {
    angular.module('ui.bootstrap.ex', ['ui.bootstrap.templates'])
        .service('binModal', ['$rootScope', '$document', '$compile', '$templateCache', binModalService]);

    function binModalService($rootScope, $document, $compile, $templateCache) {
        var scope, element;

        this.open = function (args) {
            removeElement();
            scope = $rootScope.$new();
            scope.$ctrl = angular.copy(args.$ctrl);
            element = $compile($templateCache.get(args.templateUrl))(scope);
            $document.find('body').append(element);

            if (element.modal) {
                element.modal('show');
                element.on('hidden.bs.modal', removeElement);
            }
        };

        this.close = function () {
            element.modal ? element.modal('hide') : removeElement();
        };

        function removeElement() {
            if (scope && scope.$destroy) scope.$destroy();
            if (element && element.remove) element.remove();
            scope = undefined;
            element = undefined;
        }
    }
})();