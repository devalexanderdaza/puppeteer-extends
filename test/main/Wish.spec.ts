import Wish,{IGiftHolder} from '../../src/main/Wish';
import {expect} from 'chai';

describe('Wish Test ', () => {

  let wish: Wish;
  let myObj: IGiftHolder;

  beforeEach(function () {
    myObj = {title: 'hello'};
    wish = new Wish();
  });
  it('Should return the gift title', () => {
    expect(wish.printGiftTitle(myObj)).to.equal('hello');
  });
});
