import wd from 'wd';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import B from 'bluebird';

chai.should();
chai.use(chaiAsPromised);

const desired = {
  "androidInstallTimeout": "90000",
  "deviceName": "Android",
  "platformName": "Android",
  "appPackage": "io.appium.android.apis",
  "appActivity": "io.appium.android.apis.ApiDemos"
};

const isEspresso = process.env.ESPRESSO;
if (isEspresso) {
  desired.automationName = 'Espresso';
  desired.forceEspressoRebuild = true;
} else {
  desired.automationName = 'UIAutomator2';
}

describe("android simple", function () {
  this.timeout(10 * 60 * 1000);
  let driver;

  before(async function () {
    driver = wd.promiseChainRemote({
      host: '127.0.0.1',
      port: 4723,
      //port: 4884,
    });
  });

  it('checks the text contents of a TextView', async function () {
    await driver.init(desired);
    const el = await driver.elementByAccessibilityId('Graphics');
    await el.text().should.eventually.equal('Graphics');
  });

  it("clicking a menu item and checking that new menu item exists", async function () {
    await driver.init(desired);
    await driver.elementByAccessibilityId('Graphics').click();
    await driver.elementByAccessibilityId('Arcs').should.eventually.exist;
  });

  it("find element on a page by it's XPath", async function () {
    await driver.init(desired);
    let el = await driver.elementByXPath('//android.widget.TextView');
    el.text().should.eventually.equal('API Demos');
  });

  it("find multiple elements on a page that match one generic XPath", async function () {
    await driver.init(desired);
    const els = await driver.elementsByXPath('//android.widget.TextView');
    els.length.should.be.above(10);
  });
  
  it("entering text into a search field", async function () {
    await driver.init(desired);
    (await driver.elementByAccessibilityId('App')).click();
    if (!isEspresso) await driver.waitForElementByAccessibilityId('Search');
    (await driver.elementByAccessibilityId('Search')).click();
    if (!isEspresso) await driver.waitForElementByAccessibilityId('Invoke Search');
    (await driver.elementByAccessibilityId('Invoke Search')).click();
    if (!isEspresso) await driver.waitForElementByXPath('//android.widget.EditText');
    await (await driver.elementByXPath('//android.widget.EditText')).sendKeys('Hello World');
  });

  it("click a menu item, go to next page and then go back", async function () {
    await driver.init(desired);
    (await driver.elementByAccessibilityId('App')).click();
    if (!isEspresso) await driver.waitForElementByAccessibilityId('Search');
    await driver.elementByAccessibilityId('Search').should.eventually.exist;
    await driver.back();
    if (!isEspresso) await driver.waitForElementByAccessibilityId('App');
    await driver.elementByAccessibilityId('App').should.eventually.exist;
  });

  it("opens expandable list and then checks item in list", async function () {
    await driver.init(desired);
    (await driver.elementByAccessibilityId('Views')).click();
    if (!isEspresso) await driver.waitForElementByAccessibilityId('Expandable Lists');
    (await driver.elementByAccessibilityId('Expandable Lists')).click();
    if (!isEspresso) await driver.waitForElementByAccessibilityId('1. Custom Adapter');
    (await driver.elementByAccessibilityId('1. Custom Adapter')).click();
    if (!isEspresso) await driver.waitForElementByXPath('//android.widget.ExpandableListView/android.widget.TextView');
    const peopleNames = await driver.elementByXPath('//android.widget.ExpandableListView/android.widget.TextView');
    await peopleNames.click();
    if (!isEspresso) await driver.waitForElementByXPath('//android.widget.ExpandableListView/android.widget.TextView');
    const itemsInList = await driver.elementsByXPath('//android.widget.ExpandableListView/android.widget.TextView');
    itemsInList.length.should.equal(8);
    if (!isEspresso) await driver.waitForElementByXPath('//android.widget.ExpandableListView/android.widget.TextView[2]');
    (await driver.elementByXPath('//android.widget.ExpandableListView/android.widget.TextView[2]')).text().should.eventually.equal('Arnold');
  });

  it("click and then go back 20 times", async function () {
    await driver.init(desired);
    var i = 0;
    while (i++ < 20) {
      (await driver.elementByAccessibilityId('App')).click();
      if (!isEspresso) await driver.waitForElementByAccessibilityId('Search');
      await driver.elementByAccessibilityId('Search').should.eventually.exist;
      await driver.back();
      if (!isEspresso) await driver.waitForElementByAccessibilityId('App');
      await driver.elementByAccessibilityId('App').should.eventually.exist;
    }
  });

  it("clicks button to add to progress bar 20 times", async function () {
    const desiredNew = Object.assign({}, desired);
    desiredNew.appActivity = 'io.appium.android.apis.view.ProgressBar1';
    await driver.init(desiredNew);
    const progressBarEl = await driver.elementByXPath('//android.widget.ProgressBar');
    const plusButtonEl = await driver.elementByXPath('//android.widget.LinearLayout/android.widget.Button[@content-desc="+"]');
    for(let i=0; i<20; i++) {
      await plusButtonEl.click();
    }
  });

  it("takes a screenshot", async function () {
    await driver.init(desired);
    await driver.takeScreenshot();
  });

  it.only("opens and closes a dialog 20 times", async function () {
    await driver.init(desired);
    await (await driver.elementByAccessibilityId('App')).click();
    if (!isEspresso) await driver.waitForElementByAccessibilityId('Alert Dialogs');
    await (await driver.elementByAccessibilityId('Alert Dialogs')).click();
    for (let i=0; i<20; i++) {
      if (!isEspresso) await driver.waitForElementByAccessibilityId('OK Cancel dialog with a message');
      await (await driver.elementByAccessibilityId('OK Cancel dialog with a message')).click();
      if (!isEspresso) await driver.waitForElementById('android:id/button2');
      await (await driver.elementById('android:id/button2')).click();
    }
  });
});