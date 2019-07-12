import { match, queryMatch, queryFilter } from "./object-query"; // matchQueryParams

const mockObj = {
  objs: [{ t: 1 }, { t: 2 }, { t: 3 }],
  strs: ["a", "b", "c"],
  nest1: [
    {
      nest2: {
        nest3: ["x", "y", "z"],
        message: "well done",
        obj: {
          message: "well done2"
        }
      }
    }
  ],

  obj1: {
    obj2: {
      objs: [{ t: 1 }, { t: 2 }],
      message: "sample"
    }
  },

  complexes: [
    { x: { y: [{ z: 1 }, { z: 2 }] } },
    { x: { y: [{ z: 3 }, { z: 4 }] } },
    { x: { y: [{ z: 5 }, { z: 6 }] } },
    { x: { y: [{ z: 7 }, { z: 8 }] } }
  ]
};

const mockArray = [mockObj, { nest1: [{ message: "not nest2" }] }, { nest1: [{ nest2: { message: "not well done" } }] }];

describe("match", () => {
  describe("matching", () => {
    it("should match nested string", () => {
      // for: { "obj1.obj2.message": "sample" }
      expect(match(mockObj, "obj1.obj2.message", "sample")).toBe(true);
      expect(match(mockObj, "obj1.obj2.message", "nope")).toBe(false);
    });

    it("should match array value", () => {
      // for: { "obj1.obj2.message": "sample" }
      expect(match(mockObj, "strs", "b")).toBe(true);
    });

    it("should match nested array values", () => {
      expect(match(mockObj, "nest1.nest2.message", "well done")).toBe(true);

      expect(match(mockObj, "nest1.nest2.obj.message", "well done2")).toBe(true);

      expect(match(mockObj, "nest1.nest2.nest3", "y")).toBe(true);
    });

    it("should match mockArray nested array values", () => {
      expect(match(mockArray, "nest1.nest2.message", "extra well done")).toBe(false);

      const newMockArray = [...mockArray, { nest1: [{ nest2: { message: "extra well done" } }] }];
      expect(match(newMockArray, "nest1.nest2.message", "extra well done")).toBe(true);
    });
  });
});

// future options: __strict=true, __conjugate=or,and,xor
describe("queryMatch", () => {
  const qmMockObj = {
    persons: [
      { name: "mike", id: 5, limbs: ["LH", "LF"] },
      { name: "sash", id: 10, limbs: ["LH", "LF", "RF"] },
      { name: "brit", id: 15, limbs: ["LH", "LF"], pets: [{ type: "dog" }] }
    ]
  };

  describe("matching", () => {
    it("should match total object for RF", () => {
      expect(queryMatch({ "persons.limbs": "RF" })(qmMockObj)).toBe(true);
    });

    it("should match person with RF", () => {
      expect(queryMatch({ limbs: "RF" })(qmMockObj.persons[0])).toBe(false);

      expect(queryMatch({ limbs: "RF" })(qmMockObj.persons[1])).toBe(true);
    });

    it("should match person with RF or a dog", () => {
      expect(qmMockObj.persons.filter(queryMatch({ limbs: "RF", "pets.type": "dog" }))).toEqual([qmMockObj.persons[1], qmMockObj.persons[2]]);
    });
  });

  describe("multiple values in a string", () => {
    it("should match for comma separated values", () => {
      expect(match(mockObj, "strs", "b,c")).toBe(true);

      expect(mockObj.complexes.filter(queryMatch({ "x.y.z": "3,7" }))).toEqual([
        { x: { y: [{ z: 3 }, { z: 4 }] } },
        { x: { y: [{ z: 7 }, { z: 8 }] } }
      ]);
    });
  });
});

describe("queryFilter", function() {
  const qmMockObj = {
    persons: [
      { name: "mike", id: 5, limbs: ["LH", "LF"] },
      { name: "sash", id: 10, limbs: ["LH", "LF", "RF"] },
      { name: "brit", id: 15, limbs: ["LH", "LF"], pets: [{ type: "dog" }] }
    ]
  };

  describe("matching conjunctions", () => {
    it("should match union", () => {
      expect(queryFilter(qmMockObj.persons, {
        _conjunction: "union",
        limbs: "RF",
        id: "5"
      })).toEqual([qmMockObj.persons[0], qmMockObj.persons[1]]);
    });
    it("should match intersection", () => {
      expect(queryFilter(qmMockObj.persons, {
        _conjunction: "intersection",
        limbs: "LH",
        id: "5"
      })).toEqual([qmMockObj.persons[0]]);
    });
  });
});
