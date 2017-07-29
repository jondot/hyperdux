import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import hyperduce from '../index'
import nock from 'nock'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import MockDate from 'mockdate'

const createSlimeStore = () => {
  const { actions, reducer } = hyperduce({
    resource: 'projects',
    url: 'http://example.com/projects'
  })
  const store = createStore(
    combineReducers({ projects: reducer }),
    applyMiddleware(reduxThunk)
  )
  return { store, actions }
}

axios.defaults.adapter = httpAdapter
describe('hyperduce', () => {
  beforeEach(() => {
    MockDate.set(new Date(1501010107199))
  })
  afterEach(() => {
    const done = nock.isDone()
    nock.cleanAll()
    expect(done).toBe(true)
  })
  it('can build', async () => {
    const projects = hyperduce({
      resource: 'projects',
      url: 'http://example.com/projects'
    })

    expect(projects).toMatchSnapshot()
  })

  it('w/redux: request(): GET', async () => {
    nock('http://example.com/')
      .get('/projects/some/path?filter=hot')
      .reply(200, { id: 1, name: 'filtered hot' })
    const { store, actions } = createSlimeStore()
    await store.dispatch(
      actions.request('some/path', { params: { filter: 'hot' } })
    )
    expect(store.getState()).toMatchSnapshot()
  })

  it('w/redux: request(): POST', async () => {
    nock('http://example.com/')
      .post('/projects/some/path?filter=hot', { hey: 'joe' })
      .reply(200, { id: 1, name: 'filtered hot' })
    const { store, actions } = createSlimeStore()
    await store.dispatch(
      actions.request('some/path', {
        method: 'post',
        data: { hey: 'joe' },
        params: { filter: 'hot' }
      })
    )
    expect(store.getState()).toMatchSnapshot()
  })
  it('w/redux: all(): full request', async () => {
    nock('http://example.com/')
      .get('/projects?filter=hot')
      .reply(200, [{ id: 1, name: 'filtered hot' }])
    const { store, actions } = createSlimeStore()
    await store.dispatch(
      actions.all({ params: { filter: 'hot' } }, { fullRequest: true })
    )
    expect(store.getState()).toMatchSnapshot()
  })
  it('w/redux: get(): full request', async () => {
    nock('http://example.com/')
      .get('/projects/1?filter=hot')
      .reply(200, { id: 1, name: 'filtered hot' })
    const { store, actions } = createSlimeStore()
    await store.dispatch(
      actions.get({ id: 1, params: { filter: 'hot' } }, { fullRequest: true })
    )
    expect(store.getState()).toMatchSnapshot()
  })

  it('w/redux: update(): nonexisting', async () => {
    nock('http://example.com/').put('/projects/1', { id: 1 }).reply(404, {})
    const { store, actions } = createSlimeStore()
    try {
      await store.dispatch(actions.update({ id: 1 }))
      expect(store.getState()).toMatchSnapshot()
    } catch (err) {
      expect(err.toString()).toMatch(/Request failed with status code 404/)
    }
  })

  it('w/redux: all(): nonexisting', async () => {
    nock('http://example.com/').get('/projects').reply(404, {})
    const { store, actions } = createSlimeStore()
    try {
      await store.dispatch(actions.all())
      expect(store.getState()).toMatchSnapshot()
    } catch (err) {
      expect(err.toString()).toMatch(/Request failed with status code 404/)
    }
  })

  it('w/redux: get(): nonexisting', async () => {
    nock('http://example.com/').get('/projects/10').reply(404, {})
    const { store, actions } = createSlimeStore()
    try {
      await store.dispatch(actions.get({ id: 10 }))
      expect(store.getState()).toMatchSnapshot()
    } catch (err) {
      expect(err.toString()).toMatch(/Request failed with status code 404/)
    }
  })

  it('w/redux: destroy(): nonexisting', async () => {
    nock('http://example.com/').delete('/projects/1', { id: 1 }).reply(404, {})
    const { store, actions } = createSlimeStore()
    try {
      await store.dispatch(actions.destroy({ id: 1 }))
      expect(store.getState()).toMatchSnapshot()
    } catch (err) {
      expect(err.toString()).toMatch(/Request failed with status code 404/)
    }
  })

  it('w/redux: update(): updates and places nonexisting', async () => {
    nock('http://example.com/')
      .put('/projects/1', { id: 1, name: 'foobar' })
      .reply(200, { id: '1', name: 'foobar' })
    const { store, actions } = createSlimeStore()
    await store.dispatch(actions.update({ id: 1, name: 'foobar' }))
    expect(store.getState()).toMatchSnapshot()
  })
  it('w/redux: all()', async () => {
    nock('http://example.com/')
      .get('/projects')
      .reply(200, [{ id: '1', name: 'foobar' }, { id: '2', name: 'foobaz' }])
    const { store, actions } = createSlimeStore()
    await store.dispatch(actions.all())
    expect(store.getState()).toMatchSnapshot()
  })
  it('w/redux: get() -> update() -> destroy(): destroys existing item', async () => {
    nock('http://example.com/')
      .get('/projects/1')
      .reply(200, { id: 1, name: 'foobar' })

    nock('http://example.com/')
      .put('/projects/1', { id: 1, name: 'updated!' })
      .reply(200, { id: 1, name: 'updated!' })
    nock('http://example.com/').delete('/projects/1', { id: 1 }).reply(200, {})

    const { actions, reducer } = hyperduce({
      resource: 'projects',
      url: 'http://example.com/projects'
    })

    const store = createStore(
      combineReducers({ projects: reducer }),
      applyMiddleware(reduxThunk)
    )
    await store.dispatch(actions.get({ id: 1 }))
    expect(store.getState()).toMatchSnapshot()
    await store.dispatch(actions.update({ id: 1, name: 'updated!' }))
    expect(store.getState()).toMatchSnapshot()
    await store.dispatch(actions.destroy({ id: 1 }))
    expect(store.getState()).toMatchSnapshot()
  })
  it('w/redux: all() -> get(): get merges into all', async () => {
    nock('http://example.com/')
      .get('/projects')
      .reply(200, [{ id: '1', name: 'foobar' }])

    // returns "2" on purpose just for this test.
    // not a typo.
    nock('http://example.com/')
      .get('/projects/1')
      .reply(200, { id: '2', name: 'baz', foo: 'bar' })

    // now "2" should get updated
    nock('http://example.com/')
      .get('/projects/2')
      .reply(200, { id: '2', name: 'bar!' })

    const { store, actions } = createSlimeStore()
    await store.dispatch(actions.all())
    expect(store.getState()).toMatchSnapshot()
    await store.dispatch(actions.get({ id: 1 }))
    expect(store.getState()).toMatchSnapshot()
    await store.dispatch(actions.get({ id: 2 }))
    expect(store.getState()).toMatchSnapshot()
  })
})
