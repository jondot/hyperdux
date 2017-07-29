# Hyperduce

<img src="https://travis-ci.org/jondot/hyperduce.svg?branch=master">

A complete and extensible Redux workflow for handling RESTful resources. You get actions, state, and
reducer out of the box for handling backend data.

```javascript
const { actions: projects, reducer } = hyperduce({
  resource: 'projects',
  url: 'http://example.com/projects'
})

const store = createStore(
  combineReducers({ projects: reducer }),
  applyMiddleware(reduxThunk)
)

await projects.all()
await projects.get({ id: 1 })
// etc.
```


## Quick Start

```
$ yarn add hyperduce
```

Set up a resource:

```javascript
// projects/store.js
const { actions, reducer } = hyperduce({
  resource: 'projects',
  url: 'http://example.com/projects'
})

export { actions, reducer }
```

Configure your store. The only requirement is to have a [thunk](https://github.com/gaearon/redux-thunk) middleware.

```javascript
// store.js
import { reducer } from './projects/store'
const store = createStore(
  combineReducers({ projects: reducer }),
  applyMiddleware(reduxThunk)
)
```

Use actions to trigger data workflows (`create`, `update`, `destroy`, `get`, `all`, and `request`). For complete workflows, take a look [here](src/__tests__/index.spec.js).

## Extending the Reducer

After you've grown out of the RESTful CRUD shape, you'll want to make your own requests and extend your reducer.

### Actions from `action.request`

By using `action.request` you can issue any additional network requests you wish. The response is
not handled by the default reducer by design. To handle the response you can react to the following
action types in an augmented reducer (see next topic) to keep the data close to the original RESTful data (projects, in this exapmle) or _any_ reducer really.

1. `<RESOURCES>_REQUEST_PENDING` - your request just started. You'll have request data in `payload`.
2. `<RESOURCES>_REQUEST_FULFILLED` - your request completed successfully. You'll have request data in `causer` and response in `payload`.
3. `<RESOURCES>_REQUEST_REJECTED` - your request failed. You'll have request data in `causer` and response in `payload`.

### Custom Actions with Augmented Reducer

```javascript
import { reducer } from 'projects/store'
const augmentedReducer = (state, action) => {
  if (action.type === 'SOME_OTHER_TYPE') {
    return { ...state, customField: 1 }
  }
  return reducer({ ...state, error: null }, action)
}
```

And obviously you are free to trigger the `SOME_OTHER_TYPE` action type as you wish.


## Data Adapters

Currently we're using [axios](https://github.com/mzabriskie/axios) for data fetching, but it's built in as an adapter, which
means it can be replaced with anything else (say, `fetch`) - PRs welcome.

Three modes for data requests (let's use `create` as an example):

**simple request**

```javascript
// POST http://example.com/projects
actions.create({id: 1, name: 'foobar'})
```

where entity body is handed over as the single parameter, flat onto the action.

**full request**

```javascript
// POST http://example.com/projects?tag=hot
actions.create({id: 1, params: {tag: 'hot'}, data: {id: 1, name: 'foobar'}}, 
               {fullRequest: true})
```

where entity is emplaced in `data` to allow for other request artifacts such
as query params (`params`). The full spec for this request mode relies on
`axios` [here](https://github.com/mzabriskie/axios#request-config)

Note that there's still needs to be an `id` property bare onto the handed object to `create`.

**custom request**

```javascript
// POST http://example.com/projects/toggle-vote
actions.request("toggle-vote", {method: 'post' data: {voter: 1}}, 
               {fullRequest: true})
```

## Identity

You can specify a different identity field, other than `id` (the default).

```javascript
const { actions, reducer } = hyperduce({
  resource: 'projects',
  url: 'http://example.com/projects',
  identity: '_id'
})

// POST http://example.com/projects/1
actions.update({_id: 1, name: 'foobar'})
```

# Contributing

Fork, implement, add tests, pull request, get my everlasting thanks and a respectable place here :).


### Thanks:

To all [Contributors](https://github.com/jondot/hyperduce/graphs/contributors) - you make this happen, thanks!


# Copyright

Copyright (c) 2017 [Dotan Nahum](http://gplus.to/dotan) [@jondot](http://twitter.com/jondot). See [LICENSE](LICENSE.txt) for further details.
