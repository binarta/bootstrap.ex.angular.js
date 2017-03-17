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
            {actual: 'lg-3', expected: 'col-lg-3'},
            {actual: 'xs-12 sm-6', expected: 'col-xs-12 col-sm-6'},
            {actual: 'xs-12 sm-6 md-4', expected: 'col-xs-12 col-sm-6 col-md-4'},
            {actual: 'xs-12 sm-6 md-4 lg-3', expected: 'col-xs-12 col-sm-6 col-md-4 col-lg-3'},
            {actual: 'col-xs-12 col-sm-6 col-md-4 col-lg-3', expected: 'col-xs-12 col-sm-6 col-md-4 col-lg-3'},
            {actual: 'xs-12 md-4 lg-3', expected: 'col-xs-12 col-md-4 col-lg-3'},
            {actual: 'xs-12 lg-3', expected: 'col-xs-12 col-lg-3'},
            {actual: 'md-4 xs-6', expected: 'col-xs-6 col-md-4'}
        ].forEach(function (test) {
            describe('when cols are set to "' + test.actual + '"', function () {
                beforeEach(function () {
                    $ctrl.cols = test.actual;
                    $ctrl.$onChanges();
                });

                it('cssClass is available', function () {
                    expect($ctrl.cssClass).toEqual(test.expected);
                });
            });
        });

        describe('with cols set to "xs-6"', function () {
            beforeEach(function () {
                $ctrl.cols = 'xs-6';
            });

            [
                {index: 0, expected: 'clearfix'},
                {index: 1, expected: ''},
                {index: 2, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block visible-lg-block'},
                {index: 3, expected: ''},
                {index: 4, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block visible-lg-block'},
                {index: 5, expected: ''},
                {index: 6, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block visible-lg-block'},
                {index: 7, expected: ''},
                {index: 8, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block visible-lg-block'},
                {index: 9, expected: ''},
                {index: 10, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block visible-lg-block'}
            ].forEach(function (test) {
                describe('and index is: ' + test.index, function () {
                    beforeEach(function () {
                        $ctrl.index = test.index;
                        $ctrl.$onChanges();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });

        describe('with cols set to "sm-4"', function () {
            beforeEach(function () {
                $ctrl.cols = 'sm-4';
            });

            [
                {index: 0, expected: 'clearfix'},
                {index: 1, expected: ''},
                {index: 2, expected: ''},
                {index: 3, expected: 'clearfix visible-sm-block visible-md-block visible-lg-block'},
                {index: 4, expected: ''},
                {index: 5, expected: ''},
                {index: 6, expected: 'clearfix visible-sm-block visible-md-block visible-lg-block'},
                {index: 7, expected: ''},
                {index: 8, expected: ''},
                {index: 9, expected: 'clearfix visible-sm-block visible-md-block visible-lg-block'},
                {index: 10, expected: ''}
            ].forEach(function (test) {
                describe('and index is: ' + test.index, function () {
                    beforeEach(function () {
                        $ctrl.index = test.index;
                        $ctrl.$onChanges();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });

        describe('with cols set to "lg-3"', function () {
            beforeEach(function () {
                $ctrl.cols = 'lg-3';
            });

            [
                {index: 0, expected: 'clearfix'},
                {index: 1, expected: ''},
                {index: 2, expected: ''},
                {index: 3, expected: ''},
                {index: 4, expected: 'clearfix visible-lg-block'},
                {index: 5, expected: ''},
                {index: 6, expected: ''},
                {index: 7, expected: ''},
                {index: 8, expected: 'clearfix visible-lg-block'},
                {index: 9, expected: ''},
                {index: 10, expected: ''}
            ].forEach(function (test) {
                describe('and index is: ' + test.index, function () {
                    beforeEach(function () {
                        $ctrl.index = test.index;
                        $ctrl.$onChanges();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });

        describe('with cols set to "xs-6 sm-4"', function () {
            beforeEach(function () {
                $ctrl.cols = 'xs-6 sm-4';
            });

            [
                {index: 0, expected: 'clearfix'},
                {index: 1, expected: ''},
                {index: 2, expected: 'clearfix visible-xs-block'},
                {index: 3, expected: 'clearfix visible-sm-block visible-md-block visible-lg-block'},
                {index: 4, expected: 'clearfix visible-xs-block'},
                {index: 5, expected: ''},
                {index: 6, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block visible-lg-block'},
                {index: 7, expected: ''},
                {index: 8, expected: 'clearfix visible-xs-block'},
                {index: 9, expected: 'clearfix visible-sm-block visible-md-block visible-lg-block'},
                {index: 10, expected: 'clearfix visible-xs-block'}
            ].forEach(function (test) {
                describe('and index is: ' + test.index, function () {
                    beforeEach(function () {
                        $ctrl.index = test.index;
                        $ctrl.$onChanges();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });

        describe('with cols set to "xs-6 lg-4"', function () {
            beforeEach(function () {
                $ctrl.cols = 'xs-6 lg-4';
            });

            [
                {index: 0, expected: 'clearfix'},
                {index: 1, expected: ''},
                {index: 2, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block'},
                {index: 3, expected: 'clearfix visible-lg-block'},
                {index: 4, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block'},
                {index: 5, expected: ''},
                {index: 6, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block visible-lg-block'},
                {index: 7, expected: ''},
                {index: 8, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block'},
                {index: 9, expected: 'clearfix visible-lg-block'},
                {index: 10, expected: 'clearfix visible-xs-block visible-sm-block visible-md-block'}
            ].forEach(function (test) {
                describe('and index is: ' + test.index, function () {
                    beforeEach(function () {
                        $ctrl.index = test.index;
                        $ctrl.$onChanges();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });

        describe('with cols set to "md-4 lg-3"', function () {
            beforeEach(function () {
                $ctrl.cols = 'md-4 lg-3';
            });

            [
                {index: 0, expected: 'clearfix'},
                {index: 1, expected: ''},
                {index: 2, expected: ''},
                {index: 3, expected: 'clearfix visible-md-block'},
                {index: 4, expected: 'clearfix visible-lg-block'},
                {index: 5, expected: ''},
                {index: 6, expected: 'clearfix visible-md-block'},
                {index: 7, expected: ''},
                {index: 8, expected: 'clearfix visible-lg-block'},
                {index: 9, expected: 'clearfix visible-md-block'},
                {index: 10, expected: ''}
            ].forEach(function (test) {
                describe('and index is: ' + test.index, function () {
                    beforeEach(function () {
                        $ctrl.index = test.index;
                        $ctrl.$onChanges();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });

        describe('with cols set to "xs-12 sm-6 md-4 lg-3"', function () {
            beforeEach(function () {
                $ctrl.cols = 'xs-12 sm-6 md-4 lg-3';
            });

            [
                {index: 0, expected: 'clearfix'},
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
                        $ctrl.$onChanges();
                    });

                    it('clearfixClass is available', function () {
                        expect($ctrl.clearfixClass).toEqual(test.expected);
                    });
                });
            });
        });

        describe('when center mode is active', function () {
            beforeEach(function () {
                $ctrl.center = 'true';
            });

            describe('when length is 1', function () {
                beforeEach(function () {
                    $ctrl.length = 1;
                });

                describe('first item', function () {
                    beforeEach(function () {
                        $ctrl.index = 0;
                    });

                    [
                        {
                            actual: 'xs-12 sm-12 md-12 lg-12',
                            expected: 'col-xs-12 col-sm-12 col-md-12 col-lg-12'
                        },
                        {
                            actual: 'xs-11 sm-11 md-11 lg-11',
                            expected: 'col-xs-11 col-sm-11 col-md-11 col-lg-11'
                        },
                        {
                            actual: 'xs-10 sm-10 md-10 lg-10',
                            expected: 'col-xs-10 col-sm-10 col-md-10 col-lg-10 col-xs-offset-1 col-sm-offset-1 col-md-offset-1 col-lg-offset-1'
                        },
                        {
                            actual: 'xs-9 sm-9 md-9 lg-9',
                            expected: 'col-xs-9 col-sm-9 col-md-9 col-lg-9'
                        },
                        {
                            actual: 'xs-8 sm-8 md-8 lg-8',
                            expected: 'col-xs-8 col-sm-8 col-md-8 col-lg-8 col-xs-offset-2 col-sm-offset-2 col-md-offset-2 col-lg-offset-2'
                        },
                        {
                            actual: 'xs-7 sm-7 md-7 lg-7',
                            expected: 'col-xs-7 col-sm-7 col-md-7 col-lg-7'
                        },
                        {
                            actual: 'xs-6 sm-6 md-6 lg-6',
                            expected: 'col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xs-offset-3 col-sm-offset-3 col-md-offset-3 col-lg-offset-3'
                        },
                        {
                            actual: 'xs-5 sm-5 md-5 lg-5',
                            expected: 'col-xs-5 col-sm-5 col-md-5 col-lg-5'
                        },
                        {
                            actual: 'xs-4 sm-4 md-4 lg-4',
                            expected: 'col-xs-4 col-sm-4 col-md-4 col-lg-4 col-xs-offset-4 col-sm-offset-4 col-md-offset-4 col-lg-offset-4'
                        },
                        {
                            actual: 'xs-3 sm-3 md-3 lg-3',
                            expected: 'col-xs-3 col-sm-3 col-md-3 col-lg-3'
                        },
                        {
                            actual: 'xs-2 sm-2 md-2 lg-2',
                            expected: 'col-xs-2 col-sm-2 col-md-2 col-lg-2 col-xs-offset-5 col-sm-offset-5 col-md-offset-5 col-lg-offset-5'
                        },
                        {
                            actual: 'xs-1 sm-1 md-1 lg-1',
                            expected: 'col-xs-1 col-sm-1 col-md-1 col-lg-1'
                        }
                    ].forEach(function (test) {
                        describe('when cols are set to "' + test.actual + '"', function () {
                            beforeEach(function () {
                                $ctrl.cols = test.actual;
                                $ctrl.$onChanges();
                            });

                            it('cssClass is available', function () {
                                expect($ctrl.cssClass).toEqual(test.expected);
                            });
                        });
                    });
                });
            });

            describe('when length is 2', function () {
                beforeEach(function () {
                    $ctrl.length = 2;
                });

                describe('first item', function () {
                    beforeEach(function () {
                        $ctrl.index = 0;
                    });

                    [
                        {
                            actual: 'xs-12 sm-12 md-12 lg-12',
                            expected: 'col-xs-12 col-sm-12 col-md-12 col-lg-12'
                        },
                        {
                            actual: 'xs-11 sm-11 md-11 lg-11',
                            expected: 'col-xs-11 col-sm-11 col-md-11 col-lg-11'
                        },
                        {
                            actual: 'xs-10 sm-10 md-10 lg-10',
                            expected: 'col-xs-10 col-sm-10 col-md-10 col-lg-10'
                        },
                        {
                            actual: 'xs-9 sm-9 md-9 lg-9',
                            expected: 'col-xs-9 col-sm-9 col-md-9 col-lg-9'
                        },
                        {
                            actual: 'xs-8 sm-8 md-8 lg-8',
                            expected: 'col-xs-8 col-sm-8 col-md-8 col-lg-8'
                        },
                        {
                            actual: 'xs-7 sm-7 md-7 lg-7',
                            expected: 'col-xs-7 col-sm-7 col-md-7 col-lg-7'
                        },
                        {
                            actual: 'xs-6 sm-6 md-6 lg-6',
                            expected: 'col-xs-6 col-sm-6 col-md-6 col-lg-6'
                        },
                        {
                            actual: 'xs-5 sm-5 md-5 lg-5',
                            expected: 'col-xs-5 col-sm-5 col-md-5 col-lg-5 col-xs-offset-1 col-sm-offset-1 col-md-offset-1 col-lg-offset-1'
                        },
                        {
                            actual: 'xs-4 sm-4 md-4 lg-4',
                            expected: 'col-xs-4 col-sm-4 col-md-4 col-lg-4 col-xs-offset-2 col-sm-offset-2 col-md-offset-2 col-lg-offset-2'
                        },
                        {
                            actual: 'xs-3 sm-3 md-3 lg-3',
                            expected: 'col-xs-3 col-sm-3 col-md-3 col-lg-3 col-xs-offset-3 col-sm-offset-3 col-md-offset-3 col-lg-offset-3'
                        },
                        {
                            actual: 'xs-2 sm-2 md-2 lg-2',
                            expected: 'col-xs-2 col-sm-2 col-md-2 col-lg-2 col-xs-offset-4 col-sm-offset-4 col-md-offset-4 col-lg-offset-4'
                        },
                        {
                            actual: 'xs-1 sm-1 md-1 lg-1',
                            expected: 'col-xs-1 col-sm-1 col-md-1 col-lg-1 col-xs-offset-5 col-sm-offset-5 col-md-offset-5 col-lg-offset-5'
                        }
                    ].forEach(function (test) {
                        describe('when cols are set to "' + test.actual + '"', function () {
                            beforeEach(function () {
                                $ctrl.cols = test.actual;
                                $ctrl.$onChanges();
                            });

                            it('cssClass is available', function () {
                                expect($ctrl.cssClass).toEqual(test.expected);
                            });
                        });
                    });
                });

                describe('last item', function () {
                    beforeEach(function () {
                        $ctrl.index = 1;
                    });

                    [
                        {
                            actual: 'xs-12 sm-12 md-12 lg-12',
                            expected: 'col-xs-12 col-sm-12 col-md-12 col-lg-12'
                        },
                        {
                            actual: 'xs-11 sm-11 md-11 lg-11',
                            expected: 'col-xs-11 col-sm-11 col-md-11 col-lg-11'
                        },
                        {
                            actual: 'xs-10 sm-10 md-10 lg-10',
                            expected: 'col-xs-10 col-sm-10 col-md-10 col-lg-10 col-xs-offset-1 col-sm-offset-1 col-md-offset-1 col-lg-offset-1'
                        },
                        {
                            actual: 'xs-9 sm-9 md-9 lg-9',
                            expected: 'col-xs-9 col-sm-9 col-md-9 col-lg-9'
                        },
                        {
                            actual: 'xs-8 sm-8 md-8 lg-8',
                            expected: 'col-xs-8 col-sm-8 col-md-8 col-lg-8 col-xs-offset-2 col-sm-offset-2 col-md-offset-2 col-lg-offset-2'
                        },
                        {
                            actual: 'xs-7 sm-7 md-7 lg-7',
                            expected: 'col-xs-7 col-sm-7 col-md-7 col-lg-7'
                        },
                        {
                            actual: 'xs-6 sm-6 md-6 lg-6',
                            expected: 'col-xs-6 col-sm-6 col-md-6 col-lg-6'
                        },
                        {
                            actual: 'xs-5 sm-5 md-5 lg-5',
                            expected: 'col-xs-5 col-sm-5 col-md-5 col-lg-5'
                        },
                        {
                            actual: 'xs-4 sm-4 md-4 lg-4',
                            expected: 'col-xs-4 col-sm-4 col-md-4 col-lg-4'
                        },
                        {
                            actual: 'xs-3 sm-3 md-3 lg-3',
                            expected: 'col-xs-3 col-sm-3 col-md-3 col-lg-3'
                        },
                        {
                            actual: 'xs-2 sm-2 md-2 lg-2',
                            expected: 'col-xs-2 col-sm-2 col-md-2 col-lg-2'
                        },
                        {
                            actual: 'xs-1 sm-1 md-1 lg-1',
                            expected: 'col-xs-1 col-sm-1 col-md-1 col-lg-1'
                        }
                    ].forEach(function (test) {
                        describe('when cols are set to "' + test.actual + '"', function () {
                            beforeEach(function () {
                                $ctrl.cols = test.actual;
                                $ctrl.$onChanges();
                            });

                            it('cssClass is available', function () {
                                expect($ctrl.cssClass).toEqual(test.expected);
                            });
                        });
                    });
                });
            });
        });
    });
});