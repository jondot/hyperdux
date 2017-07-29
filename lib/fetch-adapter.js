'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _whatwgFetch = require('whatwg-fetch');

var _whatwgFetch2 = _interopRequireDefault(_whatwgFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetchAdapter = function fetchAdapter(verbOpts, data) {
  var requestOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { fullRequest: false };

  var url = verbOpts.url;
  delete verbOpts.url;

  var body = verbOpts.method.toUpperCase() === 'GET' ? {} : { body: data };
  if (requestOpts.fullRequest) {
    return (0, _whatwgFetch2.default)(url, (0, _extends3.default)({}, verbOpts, data)).then(function (_) {
      return _.json();
    });
  }
  return (0, _whatwgFetch2.default)(url, (0, _extends3.default)({}, verbOpts, body)).then(function (_) {
    return _.json();
  });
};

exports.default = fetchAdapter;