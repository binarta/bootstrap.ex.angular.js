describe('ui.bootstrap.ex', function () {
    var modal, scope, element, event, click;

    beforeEach(module('ui.bootstrap.ex'));

    beforeEach(inject(function($rootScope) {
        scope = $rootScope.$new();
        modal = jasmine.createSpyObj('modal', ['open']);
        element = {
            bind: function (evt, callback) {
                event = evt;
                click = callback;
            }
        };
    }));

    describe('ngClickConfirm directive', function () {
        var directive, clickExecuted, attrs, modalInstance;

        beforeEach(inject(function($rootScope) {
            directive = ngClickConfirmDirectiveFactory(modal);
        }));

        it('restrict to attribute', function () {
            expect(directive.restrict).toEqual('A');
        });

        describe('on link', function () {
            beforeEach(function () {
                clickExecuted = false;
                attrs = {
                    ngClickConfirm: function () {
                        clickExecuted = true;
                    }
                };
                directive.link(scope, element, attrs);
            });

            it('binds to click event', function () {
                expect(event).toEqual('click');
            });

            describe('when click event is triggered', function () {
                beforeEach(function () {
                    click();
                });

                it('modal is opened', function () {
                    expect(modal.open).toHaveBeenCalled();
                });

                it('modal is opened with scope setting', function () {
                    expect(modal.open.mostRecentCall.args[0].scope).toEqual(scope);
                });

                it('modal is opened with controller setting', function () {
                    expect(modal.open.mostRecentCall.args[0].controller).toEqual(ModalInstanceCtrl);
                });

                describe('modal is opened with template setting', function () {
                    var template;

                    beforeEach(function () {
                        template = function (message) {
                            return '<div class="modal-body"><h4>' + message + '</h4></div>' +
                            '<div class="modal-footer">' +
                            '<button class="btn btn-danger" ng-click="yes()">Yes</button>' +
                            '<button class="btn btn-success" ng-click="no()">No</button>' +
                            '</div>';
                        }
                    });

                    it('with default message', function () {
                        expect(modal.open.mostRecentCall.args[0].template).toEqual(template('Are you sure?'));
                    });

                    it('with overridden message', function () {
                        attrs.confirmMessage = 'overridden';

                        directive.link(scope, element, attrs);
                        click();

                        expect(modal.open.mostRecentCall.args[0].template).toEqual(template('overridden'));
                    });
                });
            });

            describe('when onSuccess is triggered', function () {
                beforeEach(function () {
                    scope.onSuccess();
                });

                it('confirmed click action is executed', function () {
                    expect(clickExecuted).toEqual(true);
                });
            });
        });

        describe('modalInstanceCtrl', function () {
            var modalInstanceCtrl, closeExecuted, onSuccessExecuted, dismissReason;

            beforeEach(function () {
                modalInstance = {
                    close: function () {
                        closeExecuted = true;
                    },
                    dismiss: function (reason) {
                        dismissReason = reason
                    }
                };
                scope.onSuccess = function () {
                    onSuccessExecuted = true;
                };
                modalInstanceCtrl = new ModalInstanceCtrl(scope, modalInstance);
            });

            it('yes action', function () {
                scope.yes();

                expect(closeExecuted).toEqual(true);
                expect(onSuccessExecuted).toEqual(true);
            });

            it('no action', function () {
                scope.no();

                expect(dismissReason).toEqual('cancel');
            });
        });
    });

    describe('uiModal directive', function () {
        var directive, attrs;

        beforeEach(function() {
            directive = uiModalDirectiveFactory(modal);
        });

        it('restrict to attribute', function () {
            expect(directive.restrict).toEqual('A');
        });

        describe('on link', function () {
            beforeEach(function () {
                attrs = {
                    uiModal: 'template url'
                };
                directive.link(scope, element, attrs);
            });

            describe('when click event is triggered', function () {
                beforeEach(function () {
                    click();
                });

                it('modal is opened', function () {
                    expect(modal.open).toHaveBeenCalled();
                });

                it('modal is opened with templateUrl setting', function () {
                    expect(modal.open.mostRecentCall.args[0].templateUrl).toEqual('template url');
                });

                it('modal is opened with scope setting', function () {
                    expect(modal.open.mostRecentCall.args[0].scope).toEqual(scope);
                });
            });
        });
    });
});