describe('bootstrap.ex', function () {
    beforeEach(module('bootstrap.ex'));

    describe('binModal service', function () {
        var body, sut, scope, element;

        beforeEach(inject(function ($document, binModal, $templateCache) {
            body = $document.find('body');
            sut = binModal;
            $templateCache.put('test.html', '<div id="test"></div>')
        }));

        describe('on open modal', function () {
            var testSpy;

            beforeEach(function () {
                testSpy = false;
                sut.open({
                    templateUrl: 'test.html',
                    $ctrl: {
                        test: function () {
                            testSpy = true;
                        }
                    }
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
        });

        describe('when bootstrap modal is available', function () {
            var modalSpy;

            beforeEach(function () {
                modalSpy = jasmine.createSpy('modal');
                Object.prototype.modal = modalSpy;
                sut.open({
                    templateUrl: 'test.html',
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