import assert from 'assert'
import {Stream} from 'most'
import hold from '@most/hold'
import Subject from '../src'

describe('Subject', () => {
  it('should return Object with stream and sink', done => {
    const s = Subject()
    assert.strictEqual(typeof s, 'object')
    assert.strictEqual(typeof s.stream, 'object')
    assert.strictEqual(typeof s.sink, 'object')
    done()
  })

  describe('stream', () => {
    it('should be an extension of Stream', done => {
      const {stream} = Subject()
      assert.strictEqual(stream instanceof Stream, true)
      done()
    })

    it('should be hold-able', done => {
      const {sink, stream} = Subject()
      const hstream = hold(stream)

      hstream
        .forEach(x => {
          assert.strictEqual(x, 1)
        })

      setTimeout(() => {
        hstream.forEach(x => {
          assert.strictEqual(x, 1)
          done()
        })
      }, 10)

      sink.next(1)
    })

    it('should inherit Stream combinators', done => {
      const {sink, stream} = Subject()

      stream
        .map(x => x * x)
        .forEach(x => {
          assert.strictEqual(x, 25)
          done()
        })

      sink.next(5)
      sink.complete()
    })
  })

  describe('sink', () => {
    it('should allow nexting events', done => {
      const {sink, stream} = Subject()

      assert.strictEqual(typeof sink.next, 'function')

      stream.forEach(x => {
        assert.strictEqual(x, 1)
        done()
      })

      sink.next(1)
      sink.complete()
    })

    it('should allow sending errors' , done => {
      const {sink, stream} = Subject()

      assert.strictEqual(typeof sink.error, 'function')
      stream
        .drain()
        .then(assert.fail)
        .catch(err => {
          assert.strictEqual(err.message, 'Error Message')
          done()
        })

      sink.next(1)
      sink.next(2)
      sink.error(new Error('Error Message'))
    })

    it('should not allow ending of stream', done => {
      const {sink, stream} = Subject()

      stream
        .forEach(assert.fail)
        .then(done)
        .catch(assert.fail)

      sink.complete()
    })

    it('should not allow events after end', done => {
      const {sink, stream} = Subject()

      const now = () => setTimeout(done, 10)
      stream
        .forEach(assert.fail)
        .then(now)
        .catch(assert.fail)

      sink.complete()
      sink.next(1)
    })
  })
})
