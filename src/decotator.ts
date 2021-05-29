
export  function hook(method:string = 'emit'): any { 
  return function(plug, methodName: string, descriptor) {
    const suffix = upperFirstByte(methodName) 
    const fn = descriptor.value
    descriptor.value = async function(...rest) {
      console.log('hook', methodName, plug[method])
      plug[method]('before' + suffix, rest)
      try {
        let result = await fn.apply(this, rest)
        plug[method](methodName + 'Success', result, rest)
        return result 
      } catch (error) {
        plug[method](methodName + 'Failed', error, rest)
        throw error
      }
    }
  }
}

export  function hookSync(method:string = 'emitAsyncParalle'): any { 
  return function(plug, methodName: string, descriptor) {
    const suffix = upperFirstByte(methodName) 
    const fn = descriptor.value
    descriptor.value = async function(...rest) {
      console.log('hookSync', method, plug)
      await plug[method]('before' + suffix, rest)
      try {
        let result = await fn.apply(this, rest)
        await plug[method](methodName + 'Success', result, rest)
        return result 
      } catch (error) {
        await plug[method](methodName + 'Failed', error, rest)
        throw error
      }
    }
  }
}

function upperFirstByte(str: string){
  return str.charAt(0).toUpperCase() + str.slice(1);
 }