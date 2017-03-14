describe('bootstrap.ex', function () {
    beforeEach(module('bootstrap.ex'));

    describe('binModal service', function () {
        var body, sut, scope, element;

        beforeEach(inject(function ($document, binModal, $templateCache) {
            body = $document.find('body');
            sut = binModal;
            $templateCache.put('test1.html', '<div id="test1"></div>')
            $templateCache.put('test2.html', '<div id="test2"></div>')
        }));

        it('calling close before open does nothing', function () {
            sut.close();
        });

        describe('on open modal', function () {
            var testSpy, modalCtrl;

            beforeEach(function () {
                testSpy = false;
                modalCtrl = {
                    test: function () {
                        testSpy = true;
                    }
                };
                sut.open({
                    templateUrl: 'test1.html',
                    $ctrl: modalCtrl
                });
                element = angular.element(document.getElementById('test1'));
                scope = element.scope();
            });

            afterEach(function () {
                element.remove();
            });

            it('template is appended to body', function () {
                expect(body.html()).toContain('id="test1"');
            });

            it('on execute test spy', function () {
                scope.$ctrl.test();
                expect(testSpy).toBeTruthy();
            });

            it('modal ctrl object can be modified from outside', function () {
                expect(scope.$ctrl).toBe(modalCtrl);
            });

            describe('on close', function () {
                var isScopeDestroyed;

                beforeEach(function () {
                    scope.$on('$destroy', function () {
                        isScopeDestroyed = true;
                    });
                    sut.close();
                });

                it('element is removed from body', function () {
                    expect(body.html()).not.toContain('id="test1"');
                });

                it('scope is destroyed', function () {
                    expect(isScopeDestroyed).toBeTruthy();
                });
            });

            describe('on open before previous was closed', function () {
                var element2;

                beforeEach(function () {
                    sut.open({
                        templateUrl: 'test2.html',
                        $ctrl: {
                            test: function () {
                                testSpy = true;
                            }
                        }
                    });
                    element2 = angular.element(document.getElementById('test2'));
                });

                afterEach(function () {
                    element2.remove();
                });

                it('do nothing', function () {
                    expect(body.html()).toContain('id="test1"');
                    expect(body.html()).not.toContain('id="test2"');
                });
            });
        });

        describe('when bootstrap modal is available', function () {
            var modalSpy, onCloseSpy;

            beforeEach(function () {
                modalSpy = jasmine.createSpy('modal');
                onCloseSpy = jasmine.createSpy('close');
                Object.prototype.modal = modalSpy;
                sut.open({
                    templateUrl: 'test1.html',
                    onClose: onCloseSpy,
                    $ctrl: {}
                });
                element = angular.element(document.getElementById('test1'));
                scope = element.scope();
            });

            afterEach(function () {
                element.remove();
            });

            it('element is on body', function () {
                expect(body.html()).toContain('id="test1"');
            });

            it('modal is opened', function () {
                expect(modalSpy).toHaveBeenCalledWith({backdrop: 'static', keyboard: false});
            });

            describe('on close', function () {
                beforeEach(function () {
                    sut.close();
                });

                it('hide the modal', function () {
                    expect(modalSpy).toHaveBeenCalledWith('hide');
                });

                it('element is not yet removed', function () {
                    expect(body.html()).toContain('id="test1"');
                });

                describe('on hidden.bs.modal event', function () {
                    var isScopeDestroyed;

                    beforeEach(function () {
                        scope.$on('$destroy', function () {
                            isScopeDestroyed = true;
                        });
                        element[0].dispatchEvent(new Event('hidden.bs.modal'));
                    });

                    it('element is removed from body', function () {
                        expect(body.html()).not.toContain('id="test1"');
                    });

                    it('scope is destroyed', function () {
                        expect(isScopeDestroyed).toBeTruthy();
                    });
                });

                describe('when open is called before modal is hidden', function () {
                    beforeEach(function () {
                        sut.open({
                            templateUrl: 'test2.html',
                            onClose: onCloseSpy,
                            $ctrl: {}
                        });
                    });

                    afterEach(function () {
                        element.remove();
                    });

                    it('element is not yet removed', function () {
                        expect(body.html()).toContain('id="test1"');
                    });

                    describe('on hidden.bs.modal event', function () {
                        beforeEach(function () {
                            element[0].dispatchEvent(new Event('hidden.bs.modal'));
                        });

                        it('new modal is opened', function () {
                            expect(body.html()).toContain('id="test2"');
                        });
                    });
                });
            });
        });
    });

    describe('binCols component', function () {
        var $ctrl;

        beforeEach(inject(function ($componentController) {
            $ctrl = $componentController('binCols');
        }));

        [
            {actual: '', expected: ''},
            {actual: 'xs-12', expected: 'col-xs-12'},
            {actual: 'xs-12 sm-6', expected: 'col-xs-12 col-sm-6'},
            {actual: 'xs-12 sm-6 md-4', expected: 'col-xs-12 col-sm-6 col-md-4'},
            {actual: 'xs-12 sm-6 md-4 lg-3', expected: 'col-xs-12 col-sm-6 col-md-4 col-lg-3'},
            {actual: 'col-xs-12 col-sm-6 col-md-4 col-lg-3', expected: 'col-xs-12 col-sm-6 col-md-4 col-lg-3'},
            {actual: 'xs-12 md-4 lg-3', expected: 'col-xs-12 col-md-4 col-lg-3'},
            {actual: 'xs-12 lg-3', expected: 'col-xs-12 col-lg-3'}
        ].forEach(function (test) {
            describe('when cols are set to "' + test.actual + '"', function () {
                beforeEach(function () {
                    $ctrl.cols = test.actual;
                    $ctrl.$onInit();
                });

                it('cssClass is available', function () {
                    expect($ctrl.cssClass).toEqual(test.expected);
                });
            });
        });

        describe('with cols', function () {
            beforeEach(function () {
               $ctrl.cols = 'xs-12 sm-6 md-4 lg-3'
            });

            [
                {index: 0, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block visible-lg-block'},
                {index: 1, expected: 'clearfix visible-xs-block'},
                {index: 2, expected: 'clearfix visible-xs-block visible-sm-block'},
                {index: 3, expected: 'clearfix visible-xs-block visible-md-block'},
                {index: 4, expected: 'clearfix visible-xs-block visible-sm-block visible-lg-block'},
                {index: 5, expected: 'clearfix visible-xs-block'},
                {index: 6, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block'},
                {index: 7, expected: 'clearfix visible-xs-block'},
                {index: 8, expected: 'clearfix visible-xs-block visible-sm-block visible-lg-block'},
                {index: 9, expected: 'clearfix visible-xs-block visible-md-block'},
                {index: 10, expected: 'clearfix visible-xs-block visible-sm-block'}
            ].forEach(function (test) {
                describe('and index is: ' + test.index, function () {
                    beforeEach(function () {
                        $ctrl.index = test.index;
                        $ctrl.$onInit();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });

        describe('with cols', function () {
            beforeEach(function () {
               $ctrl.cols = 'xs-6 sm-4'
            });

            [
                {index: 0, expected: 'clearfix visible-xs-block visible-sm-block'},
                {index: 1, expected: ''},
                {index: 2, expected: 'clearfix visible-xs-block'},
                {index: 3, expected: 'clearfix visible-sm-block'},
                {index: 4, expected: 'clearfix visible-xs-block'},
                {index: 5, expected: ''},
                {index: 6, expected: 'clearfix visible-xs-block visible-sm-block'},
                {index: 7, expected: ''},
                {index: 8, expected: 'clearfix visible-xs-block'},
                {index: 9, expected: 'clearfix visible-sm-block'},
                {index: 10, expected: 'clearfix visible-xs-block'}
            ].forEach(function (test) {
                describe('and index is: ' + test.index, function () {
                    beforeEach(function () {
                        $ctrl.index = test.index;
                        $ctrl.$onInit();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });

        describe('with cols', function () {
            beforeEach(function () {
               $ctrl.cols = 'sm-4'
            });

            [
                {index: 0, expected: 'clearfix visible-sm-block'},
                {index: 1, expected: ''},
                {index: 2, expected: ''},
                {index: 3, expected: 'clearfix visible-sm-block'},
                {index: 4, expected: ''},
                {index: 5, expected: ''},
                {index: 6, expected: 'clearfix visible-sm-block'},
                {index: 7, expected: ''},
                {index: 8, expected: ''},
                {index: 9, expected: 'clearfix visible-sm-block'},
                {index: 10, expected: ''}
            ].forEach(function (test) {
                describe('and index is: ' + test.index, function () {
                    beforeEach(function () {
                        $ctrl.index = test.index;
                        $ctrl.$onInit();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });
    });
});