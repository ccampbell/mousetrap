/**
 * Mice like peanut butter so we will use peanut butter to test to make sure
 * mousetrap is working as intended
 *
 * This is not an automated test tool although that would be nice someday
 *
 * Add tests and then open the index.html page in a browser and press each
 * keyboard combination to make sure the tests related to it pass
 *
 * @author Craig Campbell <iamcraigcampbell@gmail.com>
 */
PeanutButter = (function() {
    var tests = [],
        test_data = [],
        use_default = [],
        table_body = $("tbody"),
        _active_test,
        _next_test_timeout,
        _presses = 0;

    function _addToTable(test, test_data, i) {
        var html = '<tr id="test_' + i + '">' +
                        '<td class="combo">' + test + '</td>';

        $.each(['keypress', 'keydown', 'keyup'], function(i, event_name) {
            html += '<td class="' + event_name + '">';
            if ($.inArray(event_name, test_data) !== -1) {
                html += '-';
            } else {
                html += '<span class="na">n/a</span>';
            }
            html += '</td>';
        });

        html +=     '<td class="result"></td>' +
                '</tr>';

        table_body.append(html);
    }

    function _pass(event_type, test_number) {
        $("." + event_type, $("#test_" + test_number)).html('✓');
    }

    function _handleKeyEvent(e) {
        clearTimeout(_next_test_timeout);
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        _pass(e.type, _active_test);
        _next_test_timeout = setTimeout(_prepareNextTest, 500);
    }

    function _prepareNextTest() {
        var success = true,
            test_row = $("#test_" + _active_test),
            class_name;

        $("td", test_row).each(function(i, td) {
            if (i > 0 && $(td).html() == '-') {
                success = false;
            }
        });

        class_name = success ? 'success' : 'failure';
        $(".result", test_row).html('<span class="' + class_name + '">•</span>');

        _prepareTest(_active_test + 1);
    }

    function _resetMousetrap() {
        Mousetrap.reset();
        Mousetrap.bind('f', _prepareNextTest);
    }

    function _done() {}

    function _bindEventsForTest(i) {
        if (use_default[i]) {
            return Mousetrap.bind(tests[i], _handleKeyEvent);
        }

        $.each(test_data[i], function(j, event_name) {
            Mousetrap.bind(tests[i], _handleKeyEvent, event_name);
        });
    }

    function _prepareTest(i) {
        $("tr").removeClass('ready');

        if (i > tests.length - 1) {
            return _done();
        }
        _active_test = i;
        _resetMousetrap();

        _bindEventsForTest(i);

        var tr = $("#test_" + i),
            window_height = $(window).height();

        tr.addClass('ready');

        $(document).scrollTop(tr.position().top - (window_height - tr.height()) / 2);

        _presses = 0;
    }

    return {
        addTest: function(combo, events, use_default_event) {
            tests.push(combo);
            test_data.push(events);
            use_default.push(use_default_event);
        },

        spread: function() {
            $.each(tests, function(i, test) {
                _addToTable(test, test_data[i], i);
            });

            _prepareTest(0);
        }
    };
}) ();
