import fetch from 'whatwg-fetch'

const fetchAdapter = (verbOpts, data, requestOpts = { fullRequest: false }) => {
  const url = verbOpts.url
  delete verbOpts.url

  const body = verbOpts.method.toUpperCase() === 'GET' ? {} : { body: data }
  if (requestOpts.fullRequest) {
    return fetch(url, { ...verbOpts, ...data }).then(_ => _.json())
  }
  return fetch(url, { ...verbOpts, ...body }).then(_ => _.json())
}

export default fetchAdapter
