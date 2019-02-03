
//暂没用到
export  function hook(method:string = 'emit'): any { 
  return function(plug, name: string, descriptor) {
    const suffix = upperFirstByte(name) 
    const fn = descriptor.value
    descriptor.value = async function(...rest) {
      console.log('hook', name, plug[method])
      plug[method]('before' + suffix, rest)
      let result = await fn.apply(this, rest)
      plug[method]('after' + suffix, result, rest)
      return result 
    }
  }
}

export  function hookSync(method:string = 'emitAsyncParalle'): any { 
  return function(plug, name: string, descriptor) {
    const suffix = upperFirstByte(name) 
    const fn = descriptor.value
    descriptor.value = async function(...rest) {
      console.log('hookSync', method, plug)
      await plug[method]('before' + suffix, rest)
      let result = await fn.apply(this, rest)
      await plug[method]('after' + suffix, result, rest)
      return result 
    }
  }
}

function upperFirstByte(str: string){
  return str.charAt(0).toUpperCase() + str.slice(1);
 }