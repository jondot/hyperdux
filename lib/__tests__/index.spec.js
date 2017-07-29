'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _http = require('axios/lib/adapters/http');

var _http2 = _interopRequireDefault(_http);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _nock = require('nock');

var _nock2 = _interopRequireDefault(_nock);

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _mockdate = require('mockdate');

var _mockdate2 = _interopRequireDefault(_mockdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createSlimeStore = function createSlimeStore() {
  var _hyperduce = (0, _index2.default)({
    resource: 'projects',
    url: 'http://example.com/projects'
  }),
      actions = _hyperduce.actions,
      reducer = _hyperduce.reducer;

  var store = (0, _redux.createStore)((0, _redux.combineReducers)({ projects: reducer }), (0, _redux.applyMiddleware)(_reduxThunk2.default));
  return { store: store, actions: actions };
};
/*
test:
201, 202 status codes
empty responses
responses without 'id'
update, delete nonexisting
query params passing on all ops (via query: ?)
errors and error flags/messages
error message reset
add reset() operation and test it
add fetch() operation that does all() but resets collection first.
*/

_axios2.default.defaults.adapter = _http2.default;
describe('hyperduce', function () {
  beforeEach(function () {
    _mockdate2.default.set(new Date(1501010107199));
  });
  afterEach(function () {
    var done = _nock2.default.isDone();
    _nock2.default.cleanAll();
    expect(done).toBe(true);
  });
  it('can build', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    var projects;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            projects = (0, _index2.default)({
              resource: 'projects',
              url: 'http://example.com/projects'
            });


            expect(projects).toMatchSnapshot();

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  it('w/redux: request(): GET', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
    var _createSlimeStore, store, actions;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').get('/projects/some/path?filter=hot').reply(200, { id: 1, name: 'filtered hot' });
            _createSlimeStore = createSlimeStore(), store = _createSlimeStore.store, actions = _createSlimeStore.actions;
            _context2.next = 4;
            return store.dispatch(actions.request('some/path', { params: { filter: 'hot' } }));

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  it('w/redux: request(): POST', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
    var _createSlimeStore2, store, actions;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').post('/projects/some/path?filter=hot', { hey: 'joe' }).reply(200, { id: 1, name: 'filtered hot' });
            _createSlimeStore2 = createSlimeStore(), store = _createSlimeStore2.store, actions = _createSlimeStore2.actions;
            _context3.next = 4;
            return store.dispatch(actions.request('some/path', {
              method: 'post',
              data: { hey: 'joe' },
              params: { filter: 'hot' }
            }));

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  })));
  it('w/redux: all(): full request', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
    var _createSlimeStore3, store, actions;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').get('/projects?filter=hot').reply(200, [{ id: 1, name: 'filtered hot' }]);
            _createSlimeStore3 = createSlimeStore(), store = _createSlimeStore3.store, actions = _createSlimeStore3.actions;
            _context4.next = 4;
            return store.dispatch(actions.all({ params: { filter: 'hot' } }, { fullRequest: true }));

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  })));
  it('w/redux: get(): full request', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
    var _createSlimeStore4, store, actions;

    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').get('/projects/1?filter=hot').reply(200, { id: 1, name: 'filtered hot' });
            _createSlimeStore4 = createSlimeStore(), store = _createSlimeStore4.store, actions = _createSlimeStore4.actions;
            _context5.next = 4;
            return store.dispatch(actions.get({ id: 1, params: { filter: 'hot' } }, { fullRequest: true }));

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  })));

  it('w/redux: update(): nonexisting', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
    var _createSlimeStore5, store, actions;

    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').put('/projects/1', { id: 1 }).reply(404, {});
            _createSlimeStore5 = createSlimeStore(), store = _createSlimeStore5.store, actions = _createSlimeStore5.actions;
            _context6.next = 4;
            return store.dispatch(actions.update({ id: 1 }));

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  })));

  it('w/redux: all(): nonexisting', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
    var _createSlimeStore6, store, actions;

    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').get('/projects').reply(404, {});
            _createSlimeStore6 = createSlimeStore(), store = _createSlimeStore6.store, actions = _createSlimeStore6.actions;
            _context7.next = 4;
            return store.dispatch(actions.all());

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  })));

  it('w/redux: get(): nonexisting', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
    var _createSlimeStore7, store, actions;

    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').get('/projects/10').reply(404, {});
            _createSlimeStore7 = createSlimeStore(), store = _createSlimeStore7.store, actions = _createSlimeStore7.actions;
            _context8.next = 4;
            return store.dispatch(actions.get({ id: 10 }));

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined);
  })));

  it('w/redux: destroy(): nonexisting', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
    var _createSlimeStore8, store, actions;

    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').delete('/projects/1', { id: 1 }).reply(404, {});
            _createSlimeStore8 = createSlimeStore(), store = _createSlimeStore8.store, actions = _createSlimeStore8.actions;
            _context9.next = 4;
            return store.dispatch(actions.destroy({ id: 1 }));

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined);
  })));

  it('w/redux: update(): updates and places nonexisting', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10() {
    var _createSlimeStore9, store, actions;

    return _regenerator2.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').put('/projects/1', { id: 1, name: 'foobar' }).reply(200, { id: '1', name: 'foobar' });
            _createSlimeStore9 = createSlimeStore(), store = _createSlimeStore9.store, actions = _createSlimeStore9.actions;
            _context10.next = 4;
            return store.dispatch(actions.update({ id: 1, name: 'foobar' }));

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, undefined);
  })));
  it('w/redux: all()', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11() {
    var _createSlimeStore10, store, actions;

    return _regenerator2.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').get('/projects').reply(200, [{ id: '1', name: 'foobar' }, { id: '2', name: 'foobaz' }]);
            _createSlimeStore10 = createSlimeStore(), store = _createSlimeStore10.store, actions = _createSlimeStore10.actions;
            _context11.next = 4;
            return store.dispatch(actions.all());

          case 4:
            expect(store.getState()).toMatchSnapshot();

          case 5:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, undefined);
  })));
  it('w/redux: get() -> update() -> destroy(): destroys existing item', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12() {
    var _hyperduce2, actions, reducer, store;

    return _regenerator2.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').get('/projects/1').reply(200, { id: 1, name: 'foobar' });

            (0, _nock2.default)('http://example.com/').put('/projects/1', { id: 1, name: 'updated!' }).reply(200, { id: 1, name: 'updated!' });
            (0, _nock2.default)('http://example.com/').delete('/projects/1', { id: 1 }).reply(200, {});

            _hyperduce2 = (0, _index2.default)({
              resource: 'projects',
              url: 'http://example.com/projects'
            }), actions = _hyperduce2.actions, reducer = _hyperduce2.reducer;
            store = (0, _redux.createStore)((0, _redux.combineReducers)({ projects: reducer }), (0, _redux.applyMiddleware)(_reduxThunk2.default));
            _context12.next = 7;
            return store.dispatch(actions.get({ id: 1 }));

          case 7:
            expect(store.getState()).toMatchSnapshot();
            _context12.next = 10;
            return store.dispatch(actions.update({ id: 1, name: 'updated!' }));

          case 10:
            expect(store.getState()).toMatchSnapshot();
            _context12.next = 13;
            return store.dispatch(actions.destroy({ id: 1 }));

          case 13:
            expect(store.getState()).toMatchSnapshot();

          case 14:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, undefined);
  })));
  it('w/redux: all() -> get(): get merges into all', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13() {
    var _createSlimeStore11, store, actions;

    return _regenerator2.default.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            (0, _nock2.default)('http://example.com/').get('/projects').reply(200, [{ id: '1', name: 'foobar' }]);

            // returns "2" on purpose just for this test.
            // not a typo.
            (0, _nock2.default)('http://example.com/').get('/projects/1').reply(200, { id: '2', name: 'baz', foo: 'bar' });

            // now "2" should get updated
            (0, _nock2.default)('http://example.com/').get('/projects/2').reply(200, { id: '2', name: 'bar!' });

            _createSlimeStore11 = createSlimeStore(), store = _createSlimeStore11.store, actions = _createSlimeStore11.actions;
            _context13.next = 6;
            return store.dispatch(actions.all());

          case 6:
            expect(store.getState()).toMatchSnapshot();
            _context13.next = 9;
            return store.dispatch(actions.get({ id: 1 }));

          case 9:
            expect(store.getState()).toMatchSnapshot();
            _context13.next = 12;
            return store.dispatch(actions.get({ id: 2 }));

          case 12:
            expect(store.getState()).toMatchSnapshot();

          case 13:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, undefined);
  })));
});