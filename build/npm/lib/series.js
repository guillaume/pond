"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var _event = require("./event");

var _util = require("./util");

/**
 * Base class for a series of events.
 *
 * A series is compact representation for a list of events, with some additional
 * meta data on top of that.
 *
 */

var Series = (function () {

    /**
     * A Series is constructed by either:
     *
     *  1) passing in another series (copy constructor)
     *  2) passing in three arguments:
     *      name - the name of the series
     *      columns - an array containing the title of each data column
     *      data - an array containing the data of each column
     *             Note: data may be either:
     *               a) An Immutable.List of Immutable.Map data objects
     *               b) An array of objects
     *
     * Internally a Series is List of Maps. Each item in the list is one data map,
     * and is stored as an Immutable Map, where the keys are the column names
     * and the value is the data for that column at that index.
     *
     * This enables efficient extraction of Events, since the internal data of the
     * Event can be simply a reference to the Immutable Map in this Series, combined
     * with the time, Timerange or Index.
     */

    function Series(arg1, arg2, arg3, arg4) {
        var _this = this;

        _classCallCheck(this, Series);

        console.log("       ...args", arg1, arg2, arg3, arg4);

        // Series(Series other) - copy
        if (arg1 instanceof Series) {

            //
            // Copy constructor
            //

            var other = arg1;

            this._name = other._name;
            this._meta = other._meta;
            this._columns = other._columns;
            this._series = other._series;

            // Series(string name, object meta, list columns, list | ImmutableList points)
        } else if (_underscore2["default"].isString(arg1) && _underscore2["default"].isObject(arg2) && _underscore2["default"].isArray(arg3) && (_underscore2["default"].isArray(arg4) || _immutable2["default"].List.isList(arg4))) {
            (function () {

                //
                // Object constructor
                //

                var name = arg1;
                var meta = arg2;
                var columns = arg3;
                var data = arg4;

                _this._name = name;
                _this._meta = _immutable2["default"].fromJS(meta);
                _this._columns = _immutable2["default"].fromJS(columns);

                if (_immutable2["default"].List.isList(data)) {
                    _this._series = data;
                } else {
                    _this._series = _immutable2["default"].fromJS(_underscore2["default"].map(data, function (d) {
                        var pointMap = {};
                        _underscore2["default"].each(d, function (p, i) {
                            pointMap[columns[i]] = p;
                        });
                        return pointMap;
                    }));
                }
            })();
        }
    }

    _createClass(Series, [{
        key: "toJSON",

        //
        // Serialize
        //

        value: function toJSON() {
            var cols = this._columns;
            var series = this._series;
            return {
                name: this._name,
                columns: cols.toJSON(),
                points: series.map(function (value) {
                    return cols.map(function (column) {
                        data.push(value.get(column));
                    });
                })
            };
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }
    }, {
        key: "name",

        //
        // Access meta data about the series
        //

        value: function name() {
            return this._name;
        }
    }, {
        key: "columns",
        value: function columns() {
            return this._columns.toJSON();
        }
    }, {
        key: "meta",
        value: function meta(key) {
            return this._meta.get(key);
        }
    }, {
        key: "size",

        //
        // Access the series itself
        //

        value: function size() {
            return this._series.size;
        }
    }, {
        key: "count",
        value: function count() {
            return this.size();
        }
    }, {
        key: "at",
        value: function at(i) {
            return this._series.get(i);
        }
    }, {
        key: "sum",

        //
        // Aggregate the series
        //

        value: function sum(column) {
            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }
            return this._series.reduce(function (memo, data) {
                return data.get(c) + memo;
            }, 0);
        }
    }, {
        key: "avg",
        value: function avg(column) {
            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }
            return this.sum(column) / this.size();
        }
    }, {
        key: "max",
        value: function max(column) {
            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }
            var max = this._series.maxBy(function (a) {
                return a.get(c);
            });
            return max.get(c);
        }
    }, {
        key: "min",
        value: function min(column) {
            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }
            var min = this._series.minBy(function (a) {
                return a.get(c);
            });
            return min.get(c);
        }
    }, {
        key: "mean",
        value: function mean(column) {
            return this.avg(column);
        }
    }, {
        key: "medium",
        value: function medium(column) {
            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }
            var sorted = this._series.sortBy(function (event) {
                return event.get(c);
            });
            return sorted.get(Math.floor(sorted.size / 2)).get(c);
        }
    }, {
        key: "stdev",
        value: function stdev(column) {
            var c = column || "value";
            if (!this._columns.contains(c)) {
                return undefined;
            }

            var mean = this.mean();
            return Math.sqrt(this._series.reduce(function (memo, event) {
                return Math.pow(event.get(c) - mean, 2) + memo;
            }, 0) / this.size());
        }
    }], [{
        key: "equal",
        value: function equal(series1, series2) {
            return series1._name === series2._name && series1._meta === series2._meta && series1._columns === series2._columns && series1._series === series2._series;
        }
    }, {
        key: "is",
        value: function is(series1, series2) {
            return series1._name === series2._name && _immutable2["default"].is(series1._meta, series2._meta) && _immutable2["default"].is(series1._columns, series2._columns) && _immutable2["default"].is(series1._series, series2._series);
        }
    }]);

    return Series;
})();

exports.Series = Series;

/** Internal function to find the unique keys of a bunch
  * of immutable maps objects. There's probably a more elegent way
  * to do this.
  */
function uniqueKeys(events) {
    var arrayOfKeys = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = e.data().keySeq()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var k = _step2.value;

                    arrayOfKeys.push(k);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return new _immutable2["default"].Set(arrayOfKeys);
}

/**
 * Functions used to determine slice indexes. Copied from immutable.js.
 */
function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
}

function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
}

function resolveIndex(index, size, defaultIndex) {
    return index === undefined ? defaultIndex : index < 0 ? Math.max(0, size + index) : size === undefined ? index : Math.min(size, index);
}

/**
 * A TimeSeries is a a Series where each event is an association of a timestamp
 * and some associated data.
 *
 * Data passed into it may have the following format, which corresponds to InfluxDB's
 * wire format:
 *
 *   {
 *     "name": "traffic",
 *     "columns": ["time", "value", ...],
 *     "points": [
 *        [1400425947000, 52, ...],
 *        [1400425948000, 18, ...],
 *        [1400425949000, 26, ...],
 *        [1400425950000, 93, ...],
 *        ...
 *      ]
 *   }
 *
 * Alternatively, the TimeSeries may be constructed from a list of Events.
 *
 * Internaly the above series is represented as two lists, one of times and
 * one of data associated with those times. The position in the list links them
 * together. For each position, therefore, you have a time and an event:
 *
 * 'time'  -->  Event
 *
 * The time may be of several forms:
 *
 *   - a time
 *   - an index (which represents a timerange)
 *   - a timerange
 *
 * The event itself is stored is an Immutable Map. Requesting a particular
 * position in the list will return an Event that will in fact internally reference
 * the Immutable Map within the series, making it efficient to get back items
 * within the TimeSeries.
 *
 * You can fetch the full item at index n using get(n).
 *
 * The timerange associated with a TimeSeries is simply the bounds of the
 * events within it (i.e. the min and max times).
 */

var TimeSeries = (function (_Series) {
    function TimeSeries(arg1) {
        var _this2 = this;

        _classCallCheck(this, TimeSeries);

        // TimeSeries(TimeSeries other)
        if (arg1 instanceof TimeSeries) {

            _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", this).call(this);

            //
            // Copy constructor
            //

            //Construct the base series
            var other = arg1;

            this._name = other._name;
            this._meta = other._meta;
            this._utc = other._utc;
            this._index = other._index;
            this._columns = other._columns;
            this._series = other._series;
            this._times = other._times;

            // TimeSeries(object data) where data may be
            //    {"events": Event list} or
            //    {"columns": string list, "points": value list}
        } else if (_underscore2["default"].isObject(arg1)) {
            (function () {

                //
                // Object constructor
                //
                // There are two forms of Timeseries construction:
                //   - As a list of Events
                //   - As a list of points and columns
                //
                // See below.
                //

                var obj = arg1;

                var columns = [];
                var times = [];
                var data = [];

                if (_underscore2["default"].has(obj, "events")) {

                    console.log("...from events", arg1);

                    //
                    // If events is passed in, then we construct the series out of a list
                    // of Event objects
                    //

                    var events = obj.events;
                    var utc = obj.utc;
                    var index = obj.index;
                    var _name = obj.name;
                    var meta = obj.meta;

                    columns = uniqueKeys(events).toJSON();
                    _underscore2["default"].each(events, function (event) {
                        times.push(event.timestamp());
                        data.push(event.data());
                    });

                    // Optional index associated with this TimeSeries
                    if (index) {
                        if (_underscore2["default"].isString(index)) {
                            _this2._index = new _index2["default"](index);
                        } else if (index instanceof _index2["default"]) {
                            _this2._index = index;
                        }
                    }

                    _this2._utc = true;
                    if (_underscore2["default"].isBoolean(utc)) {
                        _this2._utc = utc;
                    }

                    console.log("   ...dd", data);

                    //Construct the base series
                    _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", _this2).call(_this2, _name, meta, columns, new _immutable2["default"].List(data));

                    //List of times, as Immutable List
                    _this2._times = new _immutable2["default"].List(times);
                } else if (_underscore2["default"].has(obj, "columns") && _underscore2["default"].has(obj, "points")) {
                    var _name2 = obj.name;
                    var index = obj.index;
                    var utc = obj.utc;
                    var points = obj.points;
                    var _columns = obj.columns;

                    var meta = _objectWithoutProperties(obj, ["name", "index", "utc", "points", "columns"]);

                    var seriesPoints = points || [];
                    var seriesName = _name2 || "";
                    var seriesMeta = meta || {};
                    var seriesColumns = _columns.slice(1) || [];
                    var seriesUTC = _underscore2["default"].isBoolean(utc) ? utc : true;

                    //
                    // If columns and points are passed in, then we construct the series
                    // out of those, assuming the format of each point is:
                    //
                    //   [time, col1, col2, col3]
                    //
                    // TODO: check to see if the first item is the time

                    _underscore2["default"].each(seriesPoints, function (point) {
                        var _point = _toArray(point);

                        var time = _point[0];

                        var others = _point.slice(1);

                        times.push(time);
                        data.push(others);
                    });

                    _get(Object.getPrototypeOf(TimeSeries.prototype), "constructor", _this2).call(_this2, seriesName, seriesMeta, seriesColumns, data);

                    // Optional index associated with this TimeSeries
                    if (index) {
                        if (_underscore2["default"].isString(index)) {
                            _this2._index = new _index2["default"](index);
                        } else if (index instanceof _index2["default"]) {
                            _this2._index = index;
                        }
                    }

                    //Is this data in UTC or local?
                    _this2._utc = seriesUTC;

                    // List of times, as Immutable List
                    _this2._times = _immutable2["default"].fromJS(times);
                }
            })();
        }
    }

    _inherits(TimeSeries, _Series);

    _createClass(TimeSeries, [{
        key: "toJSON",

        //
        // Serialize
        //

        /**
         * Turn the TimeSeries into regular javascript objects
         */
        value: function toJSON() {
            var name = this._name;
            var index = this._index;
            var cols = this._columns;
            var series = this._series;
            var times = this._times;

            var points = series.map(function (value, i) {
                var data = [times.get(i)]; // time
                cols.forEach(function (column, j) {
                    data.push(value.get(column));
                }); //values
                return data;
            }).toJSON();

            //The JSON output has 'time' as the first column
            var columns = ["time"];
            cols.forEach(function (column) {
                columns.push(column);
            });

            var result = {
                name: name
            };

            if (index) {
                result.index = index.toString();
            }

            result = _underscore2["default"].extend(result, {
                columns: columns,
                points: points
            });

            result = _underscore2["default"].extend(result, this._meta.toJSON());

            return result;
        }
    }, {
        key: "toString",

        /**
         * Represent the TimeSeries as a string
         */
        value: function toString() {
            return JSON.stringify(this.toJSON());
        }
    }, {
        key: "range",

        //
        // Series range
        //

        value: function range() {
            var _this3 = this;

            var min = undefined;
            var max = undefined;
            this._times.forEach(function (time) {
                console.log("-", time);
                if (_underscore2["default"].isString(time)) {
                    var r = (0, _util.rangeFromIndexString)(time, _this3.isUTC());
                    console.log("   - range", r.toLocalString());
                    if (!min || r.begin() < min) min = r.begin();
                    if (!max || r.end() > max) max = r.end();
                } else if (_underscore2["default"].isNumber(time)) {
                    if (!min || time < min) min = time;
                    if (!max || time > max) max = time;
                }
            });

            console.log(min, max);

            return new _range2["default"](min, max);
        }
    }, {
        key: "begin",
        value: function begin() {
            return this.range().begin();
        }
    }, {
        key: "end",
        value: function end() {
            return this.range().end();
        }
    }, {
        key: "index",

        /**
         * Access the Index, if this TimeSeries has one
         */

        value: function index() {
            return this._index;
        }
    }, {
        key: "indexAsString",
        value: function indexAsString() {
            return this._index ? this._index.asString() : undefined;
        }
    }, {
        key: "indexAsRange",
        value: function indexAsRange() {
            return this._index ? this._index.asTimerange() : undefined;
        }
    }, {
        key: "isUTC",

        /**
         * Is the data in UTC or Local?
         */
        value: function isUTC() {
            return this._utc;
        }
    }, {
        key: "at",

        /**
         * Access the series data via index. The result is an Event.
         */
        value: function at(i) {
            var time = this._times.get(i);
            if (_underscore2["default"].isString(time)) {
                var index = time;
                return new _event.IndexedEvent(index, this._series.get(i), this._utc);
            } else {
                return new _event.Event(time, this._series.get(i));
            }
        }
    }, {
        key: "slice",

        /**
         * Perform a slice of events within the TimeSeries, returns a new TimeSeries
         * representing a portion of this TimeSeries from begin up to but not including end.
         */
        value: function slice(begin, end) {
            var size = this.size();
            var b = resolveBegin(begin, size);
            var e = resolveEnd(end, size);

            if (b === 0 && e === size) {
                return this;
            }

            var events = [];
            for (var i = b; i < e; i++) {
                events.push(this.at(i));
            }

            return new TimeSeries({ "name": this._name,
                "index": this._index,
                "utc": this._utc,
                "meta": this._meta,
                "events": events });
        }
    }, {
        key: "events",

        /**
         *  Generator to allow for..of loops over series.events()
         */
        value: regeneratorRuntime.mark(function events() {
            var i;
            return regeneratorRuntime.wrap(function events$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        i = 0;

                    case 1:
                        if (!(i < this.size())) {
                            context$2$0.next = 7;
                            break;
                        }

                        context$2$0.next = 4;
                        return this.at(i);

                    case 4:
                        i++;
                        context$2$0.next = 1;
                        break;

                    case 7:
                    case "end":
                        return context$2$0.stop();
                }
            }, events, this);
        })
    }], [{
        key: "equal",
        value: function equal(series1, series2) {
            return series1._name === series2._name && series1._meta === series2._meta && series1._utc === series2._utc && series1._columns === series2._columns && series1._series === series2._series && series1._times === series2._times;
        }
    }, {
        key: "is",
        value: function is(series1, series2) {
            return series1._name === series2._name && series1._utc === series2._utc && _immutable2["default"].is(series1._meta, series2._meta) && _immutable2["default"].is(series1._columns, series2._columns) && _immutable2["default"].is(series1._series, series2._series) && _immutable2["default"].is(series1._times, series2._times);
        }
    }]);

    return TimeSeries;
})(Series);

exports.TimeSeries = TimeSeries;