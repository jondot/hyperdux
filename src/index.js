import U from 'updeep'
import unionBy from 'lodash/unionBy'
import reject from 'lodash/reject'
import castArray from 'lodash/castArray'
import get from 'lodash/get'
import isString from 'lodash/isString'
import axios from 'axios'
import urljoin from 'url-join'

const hyperduce = ({
  resource,
  url,
  identity = 'id',
  adapter = axiosAdapter,
  request = {}
}) => {
  const selectedAdapter = restAdapter(url, identity, adapter, request)
  return {
    actions: createActions(selectedAdapter, resource),
    reducer: createReducer(resource, identity),
    types: createActionTypes(resource)
  }
}
export default hyperduce

const axiosAdapter = (verbOpts, data, requestOpts = { fullRequest: false }) => {
  if (requestOpts.fullRequest) {
    return axios({ ...verbOpts, ...data })
  }
  return axios({ ...verbOpts, data })
}

const restAdapter = (url, identity, adapter, adapterOpts) => {
  // consider returning response.data directly from here
  return {
    create: (data, requestOpts) =>
      adapter({ ...adapterOpts, method: 'post', url }, data, requestOpts),
    all: (data, requestOpts) =>
      adapter({ ...adapterOpts, method: 'get', url }, data, requestOpts),
    destroy: (data, requestOpts) =>
      adapter(
        { ...adapterOpts, method: 'delete', url: `${url}/${data[identity]}` },
        data,
        requestOpts
      ),
    update: (data, requestOpts) =>
      adapter(
        { ...adapterOpts, method: 'put', url: `${url}/${data[identity]}` },
        data,
        requestOpts
      ),
    get: (data, requestOpts) =>
      adapter(
        { ...adapterOpts, method: 'get', url: `${url}/${data[identity]}` },
        data,
        requestOpts
      ),
    request: (path, data, requestOpts) =>
      adapter({ ...adapterOpts, url: urljoin(url, path) }, data, {
        fullRequest: true
      })
  }
}

const actionType = (resource, kind) => {
  const EVENT = `${resource.toUpperCase()}_${kind.toUpperCase()}`
  const PENDING = `${EVENT}_PENDING`
  const FULFILLED = `${EVENT}_FULFILLED`
  const REJECTED = `${EVENT}_REJECTED`
  return { PENDING, FULFILLED, REJECTED }
}

const network = (adapter, resource, kind) => {
  const type = actionType(resource, kind)
  const req = adapter[kind]

  return (...args) => dispatch => {
    // if first argument is a string, skip it and get the
    // next one.
    const data = isString(args[0]) ? args[1] : args[0]
    const payload = data || {}
    dispatch({ type: type.PENDING, payload })
    return req(...args)
      .then(response =>
        dispatch({
          type: type.FULFILLED,
          causer: payload,
          payload: response.data
        })
      )
      .catch(err =>
        dispatch({ type: type.REJECTED, causer: payload, payload: err })
      )
  }
}

const createActionTypes = resource => {
  return {
    create: actionType(resource, 'create'),
    all: actionType(resource, 'all'),
    get: actionType(resource, 'get'),
    update: actionType(resource, 'update'),
    destroy: actionType(resource, 'destroy'),
    request: actionType(resource, 'request')
  }
}
const createActions = (adapter, resource) => {
  return {
    create: network(adapter, resource, 'create'),
    all: network(adapter, resource, 'all'),
    get: network(adapter, resource, 'get'),
    update: network(adapter, resource, 'update'),
    destroy: network(adapter, resource, 'destroy'),
    request: network(adapter, resource, 'request')
  }
}

const initialState = {
  isFetching: false,
  didFetch: false,
  lastUpdated: null,
  error: null,
  flash: null
}
const createReducer = (resource, identity) => {
  const RESOURCE = resource.toUpperCase()
  return (state = initialState, action) => {
    console.log('reducer', action)
    if (action.type.match(`${RESOURCE}_[A-Z]+_PENDING`)) {
      // consider using redux-actions for [create]:{}
      return { ...state, isFetching: true, error: null, flash: null }
    }

    if (action.type.match(`${RESOURCE}_[A-Z]+_REJECTED`)) {
      return {
        ...state,
        isFetching: false,
        error: {
          message: action.payload.toString(),
          code: get(action.payload, 'response.status', null),
          error: action.payload
        },
        flash: null
      }
    }
    const matches = action.type.match(`${RESOURCE}_([A-Z]+)_FULFILLED`)
    if (matches) {
      const fulfilledState = {
        ...state,
        isFetching: false,
        didFetch: true,
        lastUpdated: new Date(),
        error: null,
        flash: null
      }
      const kind = matches[1]
      const payload = action.payload
      switch (kind) {
        case 'CREATE':
        case 'UPDATE':
        case 'GET':
        case 'ALL':
          return U(
            { items: items => unionBy(castArray(payload), items, identity) },
            fulfilledState
          )
        case 'DESTROY':
          return U(
            {
              items: items =>
                reject(items, { [identity]: action.causer[identity] })
            },
            fulfilledState
          )
        case 'REQUEST':
          return fulfilledState
      }
    }

    return state
  }
}
