const Pluggable = require('../').default
function wait (t){
  return new Promise((rs, rj)=>{
    setTimeout(rs, t)
  })
}

describe('pluggable Sync API e2e test', function() {
  before(()=>{
    console._error = console.error
    console.error = function(){}
  })
  
  after(()=>{
    console.error = console._error
  })

  it('init ', function(done) {
    const plug = new Pluggable()
    plug.onAlready('PluggableReady', function(){
      plug.destroy()
      done()
    })
  });

  it('onSync & emit ', function(done) {
    const plug = new Pluggable()
    plug.onSync('a', function(params){params.b.should.be.eql(1); done()})
    plug.emit('a', {b: 1})
  });

  it('onSync multi & emit ', function(done) {
    const plug = new Pluggable()
    var count = 0
    plug.onSync('a,b', function(params){count += params.b})
    plug.emit('a', {b: 1})
    plug.emit('b', {b: 2})
    count.should.be.eql(3)
    done()
  });


  it('onSync & emit & remove ', function(done) {
    const plug = new Pluggable()
    function f(params){params.b.should.be.eql(1);} 
    plug.onSync('a', f)
    plug.emit('a', {b: 1})
    plug.off('a', f)
    plug.emit('a', {b: 2})
    setTimeout(()=>done())
  });

  it('onceSync & emit ', function(done) {
    const plug = new Pluggable()
    plug.onceSync('a', function(params){params.b.should.be.eql(1);})
    plug.emit('a', {b: 1})
    plug.emit('a', {b: 2})

    setTimeout(()=>done())
  });

  it('onAlreadySync & emit ', function(done) {
    const plug = new Pluggable()
    plug.emit('a', {b: 1})
    plug.onAlreadySync('a', function(params){params.b.should.be.eql(1); done()})
  });

  it('onAlreadySync & once  ', function(done) {
    const plug = new Pluggable()
    plug.onAlreadySync('a', function(params){params.b.should.be.eql(1)})
    plug.emit('a', {b: 1})
    plug.emit('a', {b: 2})
    setTimeout(done, 10)
  });


  it('onAlreadySync emit null params ', function(done) {
    const plug = new Pluggable()
    plug.emit('a')
    plug.onAlreadySync('a', function(){ done()})
  });

  it('plugin', function(done) {
    const plug = new Pluggable()
    plug.registerPlugin(function(){
      this.onSync('a', function(){
        this.context = {b: 1}
      })

      this.onSync('b', function(){
        this.context.b = this.context.b + 1
      })

      this.onSync('c', function(t){
        this.context.c = t
      })
    })

    plug.emit('a')
    plug.emit('b')
    plug.emit('c', 3)

    setTimeout(()=>{
      plug.context.b.should.be.eql(2)
      plug.context.c.should.be.eql(3)
      done()
    })

  });

  it('emitAsyncSeries', async function() {
    const plug = new Pluggable()
    plug.onSync('a', async function(){
      await wait(10)
      this.context = {b: 1}
    })

    plug.onSync('a', function(){
      this.context.b += 1
      this.context.b.should.be.eql(2)
    })

    plug.onSync('a', function(){
      this.context.b += 1
      this.context.b.should.be.eql(3)
    })

    return await plug.emitAsyncSeries('a')
  })

  it('emitAsyncSeries with error', async function() {
    console._error = console.error
    const plug = new Pluggable()
    plug.onSync('a', async function(){
      await wait(10)
      this.context = {b: 1}
    })

    plug.onSync('a', function(){
      this.context.b += 1
      this.context.b.should.be.eql(2)
      throw new Error('test error')
    })

    plug.onSync('a', function(){
      this.context.b += 1
      this.context.b.should.be.eql(3)
    })
    try {
      await plug.emitAsyncSeries('a')
      plug.context.b.should.be.eql(3)
    } catch (error) {
      console.log('error', error)
      should(null).be.ok() //不能到达
    } 
    
  })

  it('emitAsyncParalle ', async function() {
    const plug = new Pluggable()
    
    plug.onSync('a', async function(){
      await wait(105)
      this.context.b += 1
      this.context.b.should.be.eql(2)
    })

    plug.onSync('a', async function(){
      await wait(100)
      this.context = {b: 1}
    })

    await plug.emitAsyncParalle('a')
    plug.context.b.should.be.eql(2)
  })

  it('emitAsyncParalle with error', async function() {
    const plug = new Pluggable()
    plug.onSync('a', async function(){
      await wait(10)
      this.context = {b: 1}
    })

    plug.onSync('a', function(){
      this.context.b += 1
      this.context.b.should.be.eql(2)
    })
    
    try {
      await plug.emitAsyncParalle('a')
      should(plug.context).be.ok()
      plug.context.b.should.be.eql(1)
    } catch (error) {
      console.log('error', error)
      should(null).be.ok() //不能到达
      
    } 
  })

});
