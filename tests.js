import wd from 'wd';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.should();
chai.use(chaiAsPromised);

describe('suite', function () {
  it('should add two numbers together', function () {
    (2+2).should.equal(4);
  });
});