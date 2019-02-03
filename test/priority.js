const Pluggable = require('../').default
function wait (t){
  return new Promise((rs, rj)=>{
    setTimeout(rs, t)
  })
}

describe('priority API e2e test', function() {
  it('chunk task', function(done) {
    let plug = new Pluggable()
    plug.isNodeEnv = false
    var count = 1;
    plug.on('a', function(){block(10); count++ }, {priority: 100})
    plug.on('a', function(){block(5); count++ })
    plug.on('a', function(){block(10); count++ })
    plug.on('a', function(){block(2); count += 2 }, {priority: 100})
    plug.on('a', function(){block(10); count++ })

    //console.log(plug.events.__defer__a)
    count.should.be.eql(1)
    setTimeout(()=>{
      count.should.be.eql(1)
    }, 0)
    plug.emit('a')

    setTimeout(()=>{
      count.should.be.eql(4) // 一帧16ms, 会执行优先级较高的10ms 4ms
    }, 0)

    setTimeout(()=>{
      count.should.be.eql(7)
      done()
    }, 100)
  });

  it('defer task', function(done) {
    let plug = new Pluggable()
    let log = [];
    plug.on('a', function(){log.push('e')}, {priority: 1})
    plug.on('a', function(){log.push('c')}, {priority: 3})
    plug.on('a', function(){log.push('d')}, {priority: 2})
    plug.on('a', function(){log.push('a')}, {priority: 100})
    plug.on('a', function(){log.push('b')}, {priority: 6})
    plug.emit('a')
    setTimeout(()=>{
      log.join('').should.be.eql('abcde')
      done()
    }, 10)
  });

  it('sync task', function() {
    let plug = new Pluggable()
    let log = [];
    plug.onSync('a', function(){log.push('e')}, {priority: -1})
    plug.onSync('a', function(){log.push('c')}, {priority: 10})
    plug.onSync('a', function(){log.push('d')}, {priority: 2})
    plug.onSync('a', function(){log.push('a')}, {priority: 1000})
    plug.onSync('a', function(){log.push('b')}, {priority: 100})
    plug.emit('a')
    log.join('').should.be.eql('abcde')
  });


  it('other task', function(done) {
    let plug = new Pluggable()
    let log = [];
    plug.onSync('a', function(){log.push('d')}, {priority: -1})
    plug.onSync('a', function(){log.push('c')}, {priority: 10})
    plug.on('a', function(){log.push('e')}, {priority: 10000})
    plug.once('a', function(){log.push('f')}, {priority: 1002})
    plug.onAlready('a', function(){log.push('g')}, {priority: 1001})
    plug.onSync('a', function(){log.push('a')}, {priority: 1000})
    plug.onSync('a', function(){log.push('b')}, {priority: 100})
    plug.onceSync('a', function(){log.push('1')}, {priority: 1001})
    plug.emit('a')
    setTimeout(()=>{
      log.join('').should.be.eql('1abcdefg')
      done()
    }, 10)
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