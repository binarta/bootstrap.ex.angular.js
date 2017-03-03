describe('bootstrap.ex', function () {
    beforeEach(module('bootstrap.ex'));

    describe('binModal service', function () {
        var body, sut, scope, element, $timeout;

        beforeEach(inject(function ($document, binModal, $templateCache, _$timeout_) {
            body = $document.find('body');
            sut = binModal;
            $timeout = _$timeout_;
            $templateCache.put('test.html', '<div id="test"></div>')
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
                    templateUrl: 'test.html',
                    $ctrl: modalCtrl
                });
                element = angular.element(document.getElementById('test'));
                scope = element.scope();
            });

            afterEach(function () {
                element.remove();
            });

            it('template is appended to body', function () {
                expect(body.html()).toContain('id="test"');
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
                    expect(body.html()).not.toContain('id="test"');
                });

                it('scope is destroyed', function () {
                    expect(isScopeDestroyed).toBeTruthy();
                });
            });

            describe('on open before previous was closed', function () {
                var isScopeDestroyed;

                beforeEach(function () {
                    scope.$on('$destroy', function () {
                        isScopeDestroyed = true;
                    });
                    sut.open({
                        templateUrl: 'test.html',
                        $ctrl: {
                            test: function () {
                                testSpy = true;
                            }
                        }
                    });
                    element = angular.element(document.getElementById('test'));
                });

                afterEach(function () {
                    element.remove();
                });

                it('previous element is removed', function () {
                    expect(body.html().match(/id="test"/g).length).toEqual(1);
                });

                it('previous scope is destroyed', function () {
                    expect(isScopeDestroyed).toBeTruthy();
                });
            });

            describe('on open with onClose handler', function () {
                var onCloseSpy;

                beforeEach(function () {
                    onCloseSpy = jasmine.createSpy('close');

                    sut.open({
                        templateUrl: 'test.html',
                        onClose: onCloseSpy
                    });
                    element = angular.element(document.getElementById('test'));
                    scope = element.scope();
                });

                it('on close, close handler is executed', function () {
                    sut.close();
                    expect(onCloseSpy).toHaveBeenCalled();
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
                    templateUrl: 'test.html',
                    onClose: onCloseSpy,
                    $ctrl: {}
                });
                element = angular.element(document.getElementById('test'));
                scope = element.scope();
            });

            afterEach(function () {
                element.remove();
            });

            it('element is on body', function () {
                expect(body.html().match(/id="test"/g).length).toEqual(1);
            });

            it('modal is opened', function () {
                expect(modalSpy).toHaveBeenCalledWith('show');
            });

            describe('on close', function () {
                beforeEach(function () {
                    sut.close();
                });

                it('hide the modal', function () {
                    expect(modalSpy).toHaveBeenCalledWith('hide');
                });

                it('element is not yet removed', function () {
                    expect(body.html().match(/id="test"/g).length).toEqual(1);
                });

                it('on hide.bs.modal event, execute onClose handler', function () {
                    element[0].dispatchEvent(new Event('hide.bs.modal'));
                    $timeout.flush();
                    expect(onCloseSpy).toHaveBeenCalled();
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
                        expect(body.html()).not.toContain('id="test"');
                    });

                    it('scope is destroyed', function () {
                        expect(isScopeDestroyed).toBeTruthy();
                    });
                });
            });
        });
    });
});