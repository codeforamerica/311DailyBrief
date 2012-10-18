describe("datetools", function() {
  describe("#yesterdayFromDate(date)", function() {
    it("should return day prior to passed in date", function() {
      // check month of march (0 indexed month)
      var expectedDate = new Date(2012, 2, 15);
      var date = new Date(2012, 2, 16);
      var yesterday = dateTools.yesterdayFromDate(date);
      expect(yesterday.getFullYear()).toEqual(expectedDate.getFullYear());
      expect(yesterday.getMonth()).toEqual(expectedDate.getMonth(), "month is incorrect");
      expect(yesterday.getDay()).toEqual(expectedDate.getDay(), "day is incorrect");

    // check month of feb (0 indexed month)
      expectedDate = new Date(2012, 1, 1);
      date = new Date(2012, 1, 2);
      yesterday = dateTools.yesterdayFromDate(date);
      expect(yesterday.getFullYear()).toEqual(expectedDate.getFullYear());
      expect(yesterday.getMonth()).toEqual(expectedDate.getMonth(), "month is incorrect");
      expect(yesterday.getDay()).toEqual(expectedDate.getDay(), "day is incorrect");

    // check month of jan (0 indexed month) with rollover to prev year
      expectedDate = new Date(2011, 11, 31);
      date = new Date(2012, 0, 1);
      yesterday = dateTools.yesterdayFromDate(date);
      expect(yesterday.getFullYear()).toEqual(expectedDate.getFullYear());
      expect(yesterday.getMonth()).toEqual(expectedDate.getMonth(), "month is incorrect");
      expect(yesterday.getDay()).toEqual(expectedDate.getDay(), "day is incorrect");
    });
  });
});
