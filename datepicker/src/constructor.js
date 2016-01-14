(function (myLib) {
    'use strict';

    var new_constructor = myLib.new_constructor = function (extend, initializer, methods) {
        var func;
        var prototype = Object.create(extend && extend.prototype);
        if (methods) {
            var keys = Object.keys(methods);
            keys.forEach(function (key) {
                prototype[key] = methods[key];
            });
        }
        func = function () {
            var that = Object.create(prototype);
            if (typeof initializer === 'function') {
                initializer.apply(that, arguments);
            }
            return that;
        }
        func.prototype = prototype;
        func.constructor = func;
        return func;
    }
    function Animal(name) {
        this.name = name;
    }
    function Rabbit(name) {
        this.name = name;
    }
    function Dog(name) {
        this.name = name;
    }
    var AnimalConstructor = myLib.AnimalConstructor = new_constructor(Object, Animal, {
        toString: function () {
            return 'My name ' + this.name;
        }
    });
    myLib.RabbitConstructor = new_constructor(AnimalConstructor, Rabbit, {
        hop: function () {
            return 'I\'m hopping!';
        }
    });
    myLib.DogConstructor = new_constructor(AnimalConstructor, Dog, {
        bark: function () {
            return 'I\'m barking!';
        }
    });
})(window.myLib = window.myLib || {})