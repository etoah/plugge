const Pluggable = require('../').default
function wait (t){
  return new Promise((rs, rj)=>{
    setTimeout(rs, t)
  })
}

describe('pluggable defer API e2e test', function() {
  it('once & emit ', function(done) {
    const plugg = new Pluggable()
    plugg.once('a', function(params){params.b.should.be.eql(1);})
    plugg.emit('a', {b: 1})
    plugg.emit('a', {b: 2})

    setTimeout(()=>done(), 10)
  });

  it('on & emit & off ', function(done) {
    const plug = new Pluggable()
    function f(params){params.b.should.be.eql(1);} 
    plug.on('a', f)
    plug.emit('a', {b: 1})
    plug.off('a', f)
    plug.emit('a', {b: 2})
    setTimeout(()=>done(), 10)
  });

  it('on defer ', function(done) {
    const plug = new Pluggable()
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
    const plug = new Pluggable()
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
    const plug = new Pluggable()
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
    const plug = new Pluggable()
    plug.emit('a', {b: 1})
    plug.onAlready('a', function(params){params.b.should.be.eql(1); done()})
  });

  it('onAlready & once  ', function(done) {
    const plug = new Pluggable()
    plug.onAlready('a', function(params){params.b.should.be.eql(1)})
    plug.emit('a', {b: 1})
    plug.emit('a', {b: 2})
    setTimeout(done, 10)
  });

  it('onAlready emit null params ', function(done) {
    const plug = new Pluggable()
    plug.emit('a')
    plug.onAlready('a', function(){ done()})
  });

});
