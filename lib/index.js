'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _updeep = require('updeep');

var _updeep2 = _interopRequireDefault(_updeep);

var _unionBy = require('lodash/unionBy');

var _unionBy2 = _interopRequireDefault(_unionBy);

var _reject2 = require('lodash/reject');

var _reject3 = _interopRequireDefault(_reject2);

var _castArray = require('lodash/castArray');

var _castArray2 = _interopRequireDefault(_castArray);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _urlJoin = require('url-join');

var _urlJoin2 = _interopRequireDefault(_urlJoin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hyperdux = function hyperdux(_ref) {
  var resource = _ref.resource,
      url = _ref.url,
      _ref$identity = _ref.identity,
      identity = _ref$identity === undefined ? 'id' : _ref$identity,
      _ref$adapter = _ref.adapter,
      adapter = _ref$adapter === undefined ? axiosAdapter : _ref$adapter,
      _ref$request = _ref.request,
      request = _ref$request === undefined ? {} : _ref$request;

  var networkActions = buildRestActions(url, identity, adapter, request);
  return {
    actions: createActions(networkActions, resource),
    reducer: createReducer(resource, identity),
    types: createActionTypes(resource)
  };
};
exports.default = hyperdux;


var axiosAdapter = function axiosAdapter(verbOpts, data) {
  var requestOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { fullRequest: false };

  if (requestOpts.fullRequest) {
    return (0, _axios2.default)((0, _extends3.default)({}, verbOpts, data));
  }
  return (0, _axios2.default)((0, _extends3.default)({}, verbOpts, { data: data }));
};

var buildRestActions = function buildRestActions(url, identity, adapter, adapterOpts) {
  var jitOpts = (0, _isFunction2.default)(adapterOpts);
  // consider returning response.data directly from here
  return {
    create: function create(data, requestOpts) {
      return adapter((0, _extends3.default)({}, jitOpts ? adapterOpts() : adapterOpts, { method: 'post', url: url }), data, requestOpts);
    },
    all: function all(data, requestOpts) {
      return adapter((0, _extends3.default)({}, jitOpts ? adapterOpts() : adapterOpts, { method: 'get', url: url }), data, requestOpts);
    },
    destroy: function destroy(data, requestOpts) {
      return adapter((0, _extends3.default)({}, jitOpts ? adapterOpts() : adapterOpts, {
        method: 'delete',
        url: url + '/' + data[identity]
      }), data, requestOpts);
    },
    update: function update(data, requestOpts) {
      return adapter((0, _extends3.default)({}, jitOpts ? adapterOpts() : adapterOpts, {
        method: 'put',
        url: url + '/' + data[identity]
      }), data, requestOpts);
    },
    get: function get(data, requestOpts) {
      return adapter((0, _extends3.default)({}, jitOpts ? adapterOpts() : adapterOpts, {
        method: 'get',
        url: url + '/' + data[identity]
      }), data, requestOpts);
    },
    request: function request(path, data, requestOpts) {
      return adapter((0, _extends3.default)({}, jitOpts ? adapterOpts() : adapterOpts, { url: (0, _urlJoin2.default)(url, path) }), data, {
        fullRequest: true
      });
    }
  };
};

var actionType = function actionType(resource, kind) {
  var EVENT = resource.toUpperCase() + '_' + kind.toUpperCase();
  var PENDING = EVENT + '_PENDING';
  var FULFILLED = EVENT + '_FULFILLED';
  var REJECTED = EVENT + '_REJECTED';
  return { PENDING: PENDING, FULFILLED: FULFILLED, REJECTED: REJECTED };
};

var network = function network(adapter, resource, kind) {
  var type = actionType(resource, kind);
  var req = adapter[kind];

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return function (dispatch) {
      // if first argument is a string, skip it and get the
      // next one.
      var data = (0, _isString2.default)(args[0]) ? args[1] : args[0];
      var payload = data || {};
      dispatch({ type: type.PENDING, payload: payload });
      return req.apply(undefined, args).then(function (response) {
        return dispatch({
          type: type.FULFILLED,
          causer: payload,
          payload: response.data
        });
      }).catch(function (err) {
        dispatch({ type: type.REJECTED, causer: payload, payload: err });
        throw err;
      });
    };
  };
};

var createActionTypes = function createActionTypes(resource) {
  return {
    create: actionType(resource, 'create'),
    all: actionType(resource, 'all'),
    get: actionType(resource, 'get'),
    update: actionType(resource, 'update'),
    destroy: actionType(resource, 'destroy'),
    request: actionType(resource, 'request')
  };
};
var createActions = function createActions(adapter, resource) {
  return {
    create: network(adapter, resource, 'create'),
    all: network(adapter, resource, 'all'),
    get: network(adapter, resource, 'get'),
    update: network(adapter, resource, 'update'),
    destroy: network(adapter, resource, 'destroy'),
    request: network(adapter, resource, 'request')
  };
};

var initialState = {
  isFetching: false,
  didFetch: false,
  lastUpdated: null,
  error: null,
  flash: null
};
var createReducer = function createReducer(resource, identity) {
  var RESOURCE = resource.toUpperCase();
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    if (action.type.match(RESOURCE + '_[A-Z]+_PENDING')) {
      // consider using redux-actions for [create]:{}
      return (0, _extends3.default)({}, state, { isFetching: true, error: null, flash: null });
    }

    if (action.type.match(RESOURCE + '_[A-Z]+_REJECTED')) {
      return (0, _extends3.default)({}, state, {
        isFetching: false,
        error: {
          message: action.payload.toString(),
          code: (0, _get2.default)(action.payload, 'response.status', null),
          error: action.payload
        },
        flash: null
      });
    }
    var matches = action.type.match(RESOURCE + '_([A-Z]+)_FULFILLED');
    if (matches) {
      var fulfilledState = (0, _extends3.default)({}, state, {
        isFetching: false,
        didFetch: true,
        lastUpdated: new Date(),
        error: null,
        flash: null
      });
      var kind = matches[1];
      var payload = action.payload;
      switch (kind) {
        case 'CREATE':
        case 'UPDATE':
        case 'GET':
        case 'ALL':
          return (0, _updeep2.default)({ items: function items(_items) {
              return (0, _unionBy2.default)((0, _castArray2.default)(payload), _items, identity);
            } }, fulfilledState);
        case 'DESTROY':
          return (0, _updeep2.default)({
            items: function items(_items2) {
              return (0, _reject3.default)(_items2, (0, _defineProperty3.default)({}, identity, action.causer[identity]));
            }
          }, fulfilledState);
        case 'REQUEST':
          return fulfilledState;
      }
    }

    return state;
  };
};