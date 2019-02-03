
const Pluggable = require('../').default


describe('plugin test', function() {
  it('plugin ', function(done) {
    class Reader extends Pluggable{
      constructor(){
        super()
        this.init()
      }
      init(){
        this.emit('init')
      }
      
      async next(){
        this.emit('beforeNext', arguments)
        this.context.page += 1
       
      }

      async pre(){
        this.context.page -= 1
        this.emit('afterPre', arguments)
      }
    }

    const reader = new Reader()
    reader.registerPlugin(function(){
      this.onAlreadySync('init', function(){
        //console.log('init')
        this.context = {page: 1}
      })

      this.onSync('beforeNext', function(){
        //console.log('beforeNext')
        this.context.page.should.be.eql(1)
      })

      this.onSync('afterPre', function(){
        //console.log('afterPre')
        this.context.page.should.be.eql(1)
      })

      this.on('afterPre', function(){
        //console.log('afterPre')
        this.context.on = true
      })
    })


    reader.next()
    reader.context.page.should.be.eql(2)
    reader.pre()
    reader.context.page.should.be.eql(1)
    should(reader.context.on).not.ok()

    setTimeout(()=>{
      reader.context.on.should.be.ok()
      done()
    }, 100)
  });

  it('plugin by use ', function(done) {
    class Reader extends Pluggable{
      constructor(){
        super()
        this.init()
      }
      init(){
        this.emit('init')
      }
      
      async next(){
        this.emit('beforeNext', arguments)
        this.context.page += 1
       
      }

      async pre(){
        this.context.page -= 1
        this.emit('afterPre', arguments)
      }
    }

    const reader = new Reader()
    reader.use(function(){
      this.onAlreadySync('init', function(){
        //console.log('init')
        this.context = {page: 1}
      })

      this.onSync('beforeNext', function(){
        //console.log('beforeNext')
        this.context.page.should.be.eql(1)
      })

      this.onSync('afterPre', function(){
        //console.log('afterPre')
        this.context.page.should.be.eql(1)
      })

      this.on('afterPre', function(){
        //console.log('afterPre')
        this.context.on = true
      })
    })


    reader.next()
    reader.context.page.should.be.eql(2)
    reader.pre()
    reader.context.page.should.be.eql(1)
    should(reader.context.on).not.ok()

    setTimeout(()=>{
      reader.context.on.should.be.ok()
      done()
    }, 100)
  });

  it('plugin with context', function(done) {
    class Reader extends Pluggable{
      constructor(){
        super()
        this.init()
      }
      init(){
        this.emit('init')
      }
      
      async next(){
        this.emit('beforeNext', arguments)
        this.context.page += 1
       
      }

      async pre(){
        this.context.page -= 1
        this.emit('afterPre', arguments)
      }
    }

    const reader = new Reader()
    reader.registerPlugin(function(instance, pluginContext){
      this.onAlreadySync('init', function(){
        //console.log('init')
        this.context = {page: 1}
        pluginContext.a.should.be.eql(1)
      })

      this.onSync('beforeNext', function(){
        //console.log('beforeNext')
        this.context.page.should.be.eql(1)
        pluginContext.b.should.be.eql(2)

      })

      this.onSync('afterPre', function(){
        //console.log('afterPre')
        this.context.page.should.be.eql(1)
        pluginContext.a.should.be.eql(1)

      })

      this.on('afterPre', function(){
        //console.log('afterPre')
        pluginContext.b.should.be.eql(2)
        this.context.on = true
      })
    }, {a: 1, b: 2})


    reader.next()
    reader.context.page.should.be.eql(2)
    reader.pre()
    reader.context.page.should.be.eql(1)
    should(reader.context.on).not.ok()

    setTimeout(()=>{
      reader.context.on.should.be.ok()
      done()
    }, 100)
  });

  it('plugin with context by install&use', function(done) {
    class Reader extends Pluggable{
      constructor(){
        super()
        this.init()
      }
      init(){
        this.emit('init')
      }
      
      async next(){
        this.emit('beforeNext', arguments)
        this.context.page += 1
       
      }

      async pre(){
        this.context.page -= 1
        this.emit('afterPre', arguments)
      }
    }

    const reader = new Reader()
    class Plugin{
      install(instance, pluginContext){
          instance.onAlreadySync('init', function(){
            //console.log('init')
            this.context = {page: 1}
            pluginContext.a.should.be.eql(1)
          })
    
          instance.onSync('beforeNext', function(){
            //console.log('beforeNext')
            this.context.page.should.be.eql(1)
            pluginContext.b.should.be.eql(2)
    
          })
    
          instance.onSync('afterPre', function(){
            //console.log('afterPre')
            this.context.page.should.be.eql(1)
            pluginContext.a.should.be.eql(1)
    
          })
    
          instance.on('afterPre', function(){
            //console.log('afterPre')
            pluginContext.b.should.be.eql(2)
            this.context.on = true
          })
      }
    }
    reader.use(new Plugin(), {a: 1, b: 2})
    reader.next()
    reader.context.page.should.be.eql(2)
    reader.pre()
    reader.context.page.should.be.eql(1)
    should(reader.context.on).not.ok()

    setTimeout(()=>{
      reader.context.on.should.be.ok()
      done()
    }, 100)
  });

  it('default register plugin ', function(done) {
    class Reader extends Pluggable{
      constructor(){
        super()
      }
    }
    var count = 0 
    Reader.registerDefaultPlugin(function(){
      count++
    })
    new Reader()

    setTimeout(()=>{
      count.should.be.eql(1)
      done()
    }, 10)

  });

  it('default plugin ', function(done) {
    class Reader extends Pluggable{
      constructor(){
        super()
        this.init()
      }
      init(){
        this.context = {page: 1}
        this.emit('init')
      }
      
      async next(){
        this.emit('beforeNext', arguments)
        this.context.page += 1
       
      }

      async pre(){
        this.context.page -= 1
        this.emit('afterPre', arguments)
      }
    }

    Reader.registerDefaultPlugin(function(){
      this.onSync('beforeNext', function(){
        //console.log('beforeNext')
        this.context.page.should.be.eql(1)
      })

      this.onSync('afterPre', function(){
        //console.log('afterPre')
        this.context.page.should.be.eql(1)
      })

      this.on('afterPre', function(){
        //console.log('afterPre')
        this.context.on = true
      })
    })

    Reader.registerDefaultPlugin([function(){
      this.onAlreadySync('init', function(){
        this.context.list = 3
      })
    }])

    const reader = new Reader()
    reader.next()
    reader.context.page.should.be.eql(2)
    reader.pre()
    reader.context.page.should.be.eql(1)
    should(reader.context.on).not.ok()

    setTimeout(()=>{
      reader.context.on.should.be.ok()
      reader.context.list.should.be.eql(3)
      done()
    }, 100)
  });

  it('event bus ', function(done) {
    class Reader extends Pluggable{
      constructor(){
        super()
        this.init()
      }
      init(){
        this.context = {page: 1}
        this.emit('init')
      }
    }

    var a = 2

    Reader.registerDefaultPlugin(function(){
      var reader = this
      this.on('init', function(){
        reader.eventBus.emit('hello', {a: 1})
      })
    })

    Reader.registerDefaultPlugin(function(){
      var reader = this
      this.on('init', function(){
        reader.eventBus.onAlready('hello', function(params){
          a = params.a
        })
      })
    })

    new Reader()
    
    setTimeout(()=>{
      a.should.be.eql(1)
      done()
    }, 10)
  })
});