ThreeOneOneApiTest = TestCase("ExperimentalThreeOneOneApiTest");

ThreeOneOneApiTest.prototype.testFindAgainstRealServer = function() {
  jstestdriver.console.log("JsTestDriver", "running test...");
  results = [];
  api = new ThreeOneOneApi();
  count = api.find('requests', null, results, 0);
  jstestdriver.console.log("JsTestDriver", count);
  //assertEquals(1000, count.length);
}
