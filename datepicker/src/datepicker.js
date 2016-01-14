(function ($, widgets) {
    'use strict';

    var instances = [];

    widgets.datePickerFactory = datePickerFactory;
    widgets.datePickerWithoutConstructor = datePickerWithoutConstructor;
    widgets.dpInstances = instances;

    $.fn.datePicker = function (options) {
        return this.each(function () {
            var dp = new DatePicker(this, options);
            this.datePicker = dp;
            instances.push(dp);
        });
    }

    function datePickerFactory(collection, options) {
        collection.each(function (index, elem) {
            var dp = new DatePicker(elem, options);
            elem.datePicker = dp;
            instances.push(dp);
        });
    }

    function datePickerWithoutConstructor(collection, options) {
        var DatePickerWithoutConstructor = myLib.new_constructor(Object, DatePicker, DatePicker.prototype);
        collection.each(function (index, elem) {
            var dp = DatePickerWithoutConstructor(elem, options);
            elem.datePicker = dp;
            instances.push(dp);
        });
    }

    function DatePicker(element, options) {
        this.element = $(element);
        this.options = options || {};
        this.init();
    }

    DatePicker.prototype = {
        createBoilerPlate: function () {
            var wrapperElement = this.wrapperElement = $('<div/>');
            wrapperElement.addClass('datepicker-wrapper');
            var element = this.element;
            wrapperElement.insertBefore(element).append(element).append(this.selector);

        },
        date: {
            current: {
                year: function () {
                    return this.currentDate.getFullYear();
                },
                month: {
                    index: function () {
                        return this.currentDate.getMonth();
                    }
                },
                day: function () {
                    return this.currentDate.getDate();
                }
            },
            month: {
                string: function () {
                    return this.monthToString(this.currentMonthView, this.config.shorthandCurrentMonth);
                },
                days: function () {
                    return this.currentMonthView === 1 && (((this.currentYearView % 4 === 0) && (this.currentYearView % 100 !== 0)) || (this.currentYearView % 400 === 0)) ? 29 : this.metadata.daysInMonth[this.currentMonthView];
                }
            }
        },
        monthToString: function (date, shorthand) {
            var val = shorthand === true ? this.metadata.monthNamesShort[date] : this.metadata.monthNames[date];
            return val;
        },
        buildHeaders: function () {
            var metadata = this.metadata;
            var weekdayContainer = $('<thead/>');
            var weekdays = metadata.dayNamesShort;
            weekdayContainer.html('<tr><th>' + weekdays.join('</th><th>') + '</th></tr>');
            this.calendar.append(weekdayContainer);
        },
        buildCalendar: function () {
            var firstOfMonth = new Date(this.currentYearView, this.currentMonthView, 1).getDay();
            var daysInMonth = this.date.month.days.call(this);
            var calendarFragment = document.createDocumentFragment();
            var row = $('<tr/>');
            var dayCount;
            firstOfMonth -= this.metadata.firstDayOfWeek;
            if (firstOfMonth < 0) {
                firstOfMonth += 7;
            }
            dayCount = firstOfMonth;
            this.calendarBody.html('');
            if (firstOfMonth > 0) {
                row.html('<td colspan="' + firstOfMonth + '">&nbsp;</td>');
            }
            var currentMonth = this.date.current.month.index.call(this);
            var currentDay = this.date.current.day.call(this);
            var selected = '';
            for (var dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
                if (dayCount === 7) {
                    calendarFragment.appendChild(row.get(0));
                    row = $('<tr/>');
                    dayCount = 0;
                }
                selected = this.currentMonthView === currentMonth && dayNumber === currentDay ? ' today' : '';
                row.html(row.html() + '<td><span class="datepicker-day' + selected + '">' + dayNumber + '</span></td>');
                dayCount++;
            }
            calendarFragment.appendChild(row.get(0));
            this.calendar.append(this.calendarBody.append(calendarFragment));
        },
        updateNav: function () {
            this.navigationCurrentMonth.html(this.date.month.string.call(this) + ' ' + this.currentYearView);
        },
        buildNav: function () {
            var months = $('<div class="datepicker-months"/>');
            var monthNavigation = $('<span class="datepicker-prev-month">&lt;</span><span class="datepicker-next-month">&gt;</span>');
            months.html(monthNavigation);
            months.append(this.navigationCurrentMonth);
            this.updateNav();
            this.calendarContainer.append(months);
            monthNavigation.on('click', this.events.onChangeMonth.bind(this));
        },
        buildWidget: function () {
            this.buildNav();
            this.buildHeaders();
            this.buildCalendar();
            this.calendarContainer.append(this.calendar);
            this.wrapperElement.append(this.calendarContainer);
        },
        bindEvents: function () {
            this.element.on('blur', this.events.onClose.bind(this));
            this.selector.on('click', this.events.onOpen.bind(this));
            this.calendarContainer.on('mousedown', '.datepicker-day', this.events.onDateSelect.bind(this));
            $(document).on('click', this.events.documentClick.bind(this));
        },
        unbindEvents: function () {
            $(document).off('click', this.events.documentClick);
            $(this.element).off('blur', this.events.onClose);
            $(this.element).off('click', this.events.onOpen);
            $(this.calendarContainer).off('mousedown', this.events.onDateSelect);
        },
        events: {
            onMonthChange: function () {
                if (this.currentMonthView < 0) {
                    this.currentYearView--;
                    this.currentMonthView = 11;
                }
                if (this.currentMonthView > 11) {
                    this.currentYearView++;
                    this.currentMonthView = 0;
                }
            },
            documentClick: function () {
                if (this.isOpen) {
                    this.events.onClose();
                    this.isOpen = false;
                }
            },
            onOpen: function (event) {
                event.stopImmediatePropagation();
                if (!this.domInit) {
                    this.buildWidget();
                    this.domInit = true;
                }
                if (this.wrapperElement && $(this.wrapperElement).hasClass('open')) {
                    this.events.onClose();
                    this.isOpen = false;
                } else {
                    $(this.wrapperElement).addClass('open');
                    this.isOpen = true;
                }
            },
            onClose: function () {
                $(document).off('click', this.events.documentClick);
                if (this.wrapperElement) {
                    $(this.wrapperElement).removeClass('open');
                }
                this.isOpen = false;
            },
            onDestroy: function () {
                $(this.selector).remove();
                $(this.calendarContainer).remove();
                $(this.element).insertBefore(this.wrapperElement);
                $(this.wrapperElement).remove();
                this.unbindEvents();
            },
            onChangeMonth: function (event) {
                event.stopImmediatePropagation();
                var targetClass = event.target.className;
                targetClass === 'datepicker-prev-month' ? this.currentMonthView-- : this.currentMonthView++;
                this.events.onMonthChange.call(this);
                this.updateNav();
                this.buildCalendar();
            },
            onDateSelect: function (event) {
                event.stopImmediatePropagation();
                var currentTimestamp;
                this.selectedDate = {
                    day: parseInt(event.target.innerHTML, 10),
                    month: this.currentMonthView,
                    year: this.currentYearView
                };
                currentTimestamp = new Date(this.selectedDate.year, this.selectedDate.month, this.selectedDate.day).getTime();
                this.element.val(moment(currentTimestamp).format(this.config.dateFormat));
                this.events.onClose.call(this);
            },
        },
        init: function () {
            this.defaultConfig = {
                dateFormat: 'MMMM Do YYYY',
                shorthandCurrentMonth: false
            };
            this.selector = $('<span class="fa fa-calendar date-picker-selector"></span>');
            this.selector.insertAfter(this.element);
            this.calendarContainer = $('<div class="datepicker-calendar"/>'),
            this.navigationCurrentMonth = $('<span class="datepicker-current-month"></span'),
            this.calendar = $('<table/>'),
            this.calendarBody = $('<tbody/>'),
            this.currentDate = new Date(),
            this.config = $.extend({}, this.defaultConfig, this.options);
            this.currentYearView = this.date.current.year.call(this);
            this.currentMonthView = this.date.current.month.index.call(this);
            this.currentDayView = this.date.current.day.call(this);
            this.bindEvents();
            this.createBoilerPlate();
            this.domInit = false;
        },
        metadata: {
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            dayNames: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            dayNamesShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            firstDayOfWeek: 1
        }
    }
})($, window.widgets = window.widgets || {})