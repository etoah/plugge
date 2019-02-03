
const Pluggable = require('../').default
const PluggableInnerEvent = require('../').PluggableInnerEvent


describe('exception test', function() {
  before(()=>{
    console._error = console.error
    console.error = function(){}
  })
  
  after(()=>{
    console.error = console._error
  })

  it('emitAsyncSeries exception', async ()=>{
    const plugg = new Pluggable()
    plugg.context = {}
    plugg.onSync('a', async function(params){
      if(typeof params === 'number') plugg.context.a = params
      else {
        throw TypeError()
      }
    })

    plugg.onSync('a', async function(params){
      plugg.context.b = params
    })

    plugg.onSync(PluggableInnerEvent.PluggableHookError, async function(params){
      plugg.context.error = params
    })
    await plugg.emitAsyncSeries('a', 1)
    await plugg.emitAsyncSeries('a', '1')
 
    plugg.context.error.from.should.be.eql('a')
    plugg.context.error.error.should.be.ok()
    plugg.context.a.should.be.eql(1)
    plugg.context.b.should.be.eql('1')
    plugg.context.b.should.be.String()
  })

  it('emitAsyncParalle exception', async ()=>{
    const plugg = new Pluggable()
    plugg.context = {}
    plugg.onSync('a', async function(params){
      if(typeof params === 'number') plugg.context.a = params
      else {
        throw TypeError()
      }
    })

    plugg.onSync('a', async function(params){
      plugg.context.b = params
    })

    plugg.onSync(PluggableInnerEvent.PluggableHookError, async function(params){
      plugg.context.error = params
    })
    await plugg.emitAsyncParalle('a', 1)
    await plugg.emitAsyncParalle('a', '1')
 
    plugg.context.error.from.should.be.eql('a')
    plugg.context.error.error.should.be.ok()
    plugg.context.a.should.be.eql(1)
    plugg.context.b.should.be.eql('1')
    plugg.context.b.should.be.String()
    
  })

  it('emit & onSync exception', ()=>{
    const plugg = new Pluggable()
    plugg.context = {}
    plugg.onSync('a', function(params){
      if(typeof params === 'number') plugg.context.a = params
      else {
        throw TypeError()
      }
    })

    plugg.onSync('a', function(params){
      plugg.context.b = params
    })

    plugg.onSync(PluggableInnerEvent.PluggableHookError, function(params){
      plugg.context.error = params
    })
    plugg.emit('a', 1)
    plugg.emit('a', '1')
 
    plugg.context.error.from.should.be.eql('a')
    plugg.context.error.error.should.be.ok()
    plugg.context.a.should.be.eql(1)
    plugg.context.b.should.be.eql('1')
    plugg.context.b.should.be.String()
  })

  it('emit & on exception', (done)=>{
    const plugg = new Pluggable()
    plugg.context = {}
    plugg.on('a', function(params){
      if(typeof params === 'number') plugg.context.a = params
      else {
        throw TypeError()
      }
    })

    plugg.on('a', function(params){
      plugg.context.b = params
    })

    plugg.onSync('a', function(params){
      plugg.context.c = params
    })

    plugg.onSync(PluggableInnerEvent.PluggableHookError, function(params){
      plugg.context.error = params
    })
    plugg.emit('a', 1)
    plugg.emit('a', '1')
 

    setTimeout(()=>{
      plugg.context.error.from.should.be.eql('a')
      plugg.context.error.error.should.be.ok()
      plugg.context.a.should.be.eql(1)
      plugg.context.b.should.be.eql('1')
      plugg.context.b.should.be.String()
      plugg.context.c.should.be.String()
      done()
    }, 10)
  })
});