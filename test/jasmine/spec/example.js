describe("datetools", function() {
  describe("#yesterdayFromDate(date)", function() {
    it("should return day prior to passed in date", function() {
      var expectedDate = new Date(2012, 0, 1);
      var date = new Date(2012, 0, 2);
      var yesterday = dateTools.yesterdayFromDate(date);
      expect(yesterday.getFullYear()).toEqual(expectedDate.getFullYear());
      expect(yesterday.getMonth()).toEqual(expectedDate.getMonth());
      expect(yesterday.getDay()).toEqual(expectedDate.getDay());
    });
  });
});
