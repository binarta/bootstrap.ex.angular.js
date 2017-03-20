(function () {
    angular.module('bootstrap.ex', [])
        .service('binModal', ['$rootScope', '$document', '$compile', '$templateCache', binModalService])
        .component('binCols', new BinColsComponent());

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

    function BinColsComponent() {
        this.template = '<div ng-class="$ctrl.clearfixClass"></div><div ng-class="$ctrl.cssClass" ng-transclude></div>';
        this.transclude = true;
        this.bindings = {
            index: '<',
            length: '<',
            cols: '@',
            center: '@'
        };
        this.controller = function () {
            var $ctrl = this, xs, sm, md, lg;

            $ctrl.$onChanges = function () {
                if ($ctrl.cols != undefined) $ctrl.cssClass = getCssClass();
                if ($ctrl.index != undefined) $ctrl.clearfixClass = getClearfixClass();
            };

            function getResponsiveValues() {
                angular.forEach($ctrl.cols.split(' '), function (v) {
                    if (v.indexOf('xs') != -1) xs = extractInt(v);
                    if (v.indexOf('sm') != -1) sm = extractInt(v);
                    if (v.indexOf('md') != -1) md = extractInt(v);
                    if (v.indexOf('lg') != -1) lg = extractInt(v);
                });
            }

            function extractInt(v) {
                return v.match(/[\d]+/)[0];
            }

            function getCssClass() {
                getResponsiveValues();
                var c = '';
                if (xs) c += ' col-xs-' + xs;
                if (sm) c += ' col-sm-' + sm;
                if (md) c += ' col-md-' + md;
                if (lg) c += ' col-lg-' + lg;
                c = c.trim();
                if ($ctrl.center == 'true' && $ctrl.length > 0) c += getOffsetClasses();
                return c;
            }

            function getOffsetClasses() {
                var c = '';
                var previous = {};
                [
                    {name: 'xs', size: xs},
                    {name: 'sm', size: sm},
                    {name: 'md', size: md},
                    {name: 'lg', size: lg}
                ].forEach(function (it) {
                    if (isFirstItemOnLastRow(it.size)) {
                        var offset = getEmptyItemSlotsOnLastRow(it.size)/2;
                        if (offset > 0) {
                            it.offset = offset;
                            c += getOffsetClass(it.name, formatOffset(offset));
                        }
                    }
                    if (isOffsetResetNeeded(it, previous)) c += getOffsetClass(it.name, 0);
                    previous = it;
                });
                return c;

                function formatOffset(offset) {
                    return offset.toString().replace('.', '-');
                }

                function isOffsetResetNeeded(current, previous) {
                    return current.size && !current.offset && previous.offset;
                }

                function getOffsetClass(name, offset) {
                    return ' col-' + name + '-offset-' + offset;
                }

                function getEmptyItemSlotsOnLastRow(size) {
                    return 12 - (itemsOnLastRow(size) * size);
                }

                function isFirstItemOnLastRow(size) {
                    var remainder = remainderLength(size);
                    if (remainder > 0 && $ctrl.index == ($ctrl.length - remainder)) return true;
                    if (remainder == 0 && $ctrl.index == ($ctrl.length - maxItemsOnRow(size))) return true;
                    return false;
                }

                function itemsOnLastRow(size) {
                    var remainder = remainderLength(size);
                    return remainder > 0 ? remainder : maxItemsOnRow(size);
                }

                function remainderLength(size) {
                    return $ctrl.length % maxItemsOnRow(size);
                }

                function maxItemsOnRow(size) {
                    return Math.floor(12/size);
                }

                function isInteger(value) {
                    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
                }
            }

            function getClearfixClass() {
                var i = $ctrl.index;
                var clearfix = 'clearfix';
                if (i == 0) return clearfix;
                var xsClass = xs && i % (12/xs) == 0 ? getName('xs') : '';
                var smClass = (sm || xs) && i % (12/(sm || xs)) == 0 ? getName('sm') : '';
                var mdClass = (md || sm || xs) && i % (12/(md || sm || xs)) == 0 ? getName('md') : '';
                var lgClass = (lg || md || sm || xs) && i % (12/(lg || md || sm || xs)) == 0 ? getName('lg') : '';
                var c = (xsClass + smClass + mdClass + lgClass).trim();
                if (c != '') c = clearfix + ' ' + c;
                return c;
            }

            function getName(id) {
                return ' visible-' + id + '-block';
            }
        };
    }
})();