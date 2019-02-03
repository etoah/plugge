let Pluggable = require('../').default 
function wait (t){
  return new Promise((rs, rj)=>{
    setTimeout(rs, t)
  })
}

let plug

describe('pluggable chunk API e2e test', function() {
  beforeEach(()=>{
    plug = new Pluggable()
    plug.isNodeEnv = false
  })

  // afterEach(() => {
  //   plug.destroy()
  // });

  it('once & emit ', function(done) {
    plug.once('a', function(params){params.b.should.be.eql(1);})
    plug.emit('a', {b: 1})
    plug.emit('a', {b: 2})

    setTimeout(()=>done(), 10)
  });

  it('on & emit & off ', function(done) {
    function f(params){params.b.should.be.eql(1);} 
    plug.on('a', f)
    plug.emit('a', {b: 1})
    plug.off('a', f)
    plug.emit('a', {b: 2})
    setTimeout(()=>done(), 10)
  });

  it('on defer ', function(done) {
    plug.on('a', function (params){
      params.b.should.be.eql(2);
      //console.log(this)
      this.context = {a: 1}
    } )
    plug.emit('a', {b: 2})
    should(plug.context).not.ok()
    setTimeout(()=>{
      should(plug.context.a).be.eql(1)
      done()
    }, 10)
  });

  it('on multi defer & emit ', function(done) {
    var count = 0
    plug.on('a,b', function(params){count += params.b})
    plug.emit('a', {b: 1})
    plug.emit('b', {b: 2})
    count.should.be.eql(0)
    setTimeout(()=>{
      count.should.be.eql(3)
      done()
    })
  });

  it('on multi defer & emit & off ', function(done) {
    var count = 0
    function f(params){count += params.b}
    plug.on('a,b', f)
    plug.emit('a', {b: 1})
    plug.emit('b', {b: 2})
    count.should.be.eql(0)
    setTimeout(()=>{
      count.should.be.eql(3)
      plug.off('a,b', f)
      plug.emit('a', {b: 1})
      plug.emit('b', {b: 2})
      setTimeout(()=>{
        count.should.be.eql(3)
        done()
      }, 10)
    })
  });


  it('onAlready & emit ', function(done) {
    plug.emit('a', {b: 1})
    plug.onAlready('a', function(params){params.b.should.be.eql(1); done()})
  });

  it('onAlready & once  ', function(done) {
    plug.onAlready('a', function(params){params.b.should.be.eql(1)})
    plug.emit('a', {b: 1})
    plug.emit('a', {b: 2})
    setTimeout(done, 10)
  });

  it('onAlready emit null params ', function(done) {
    plug.emit('a')
    plug.onAlready('a', function(){ done()})
  });

  it('chunk task', function(done) {
    var count = 1;
    plug.on('a', function(){block(10); count++ })
    plug.on('a', function(){block(3); count++ })
    plug.on('a', function(){block(10); count++ })
    plug.on('a', function(){block(6); count++ })
    plug.on('a', function(){block(10); count++ })
    count.should.be.eql(1)
    setTimeout(()=>{
      count.should.be.eql(1)
    }, 0)
    plug.emit('a')

    setTimeout(()=>{
      count.should.be.eql(3) // 一帧16ms, 会执行10ms 3ms
    }, 0)

    setTimeout(()=>{
      count.should.be.eql(6)
      done()
    }, 100)
  });
});

function fibonacci(num) {
  if (num <= 1) return 1;
  return fibonacci(num - 1) + fibonacci(num - 2);
} 


function block(time){
  console.time(time)
  var t = Date.now()
  while(Date.now() - t < time){
    fibonacci(10)
  }
  console.timeEnd(time)
}