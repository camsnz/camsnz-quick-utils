import {match, queryMatch} from "./object-query"; // matchQueryParams

const mockObj = {
  objs: [
    {t: 1},
    {t: 2}
  ],
  strs: [
    "a",
    "b",
    "c",
  ],
  nest1: [
    {
      nest2: {
        nest3: [
          "x",
          "y",
          "z"
        ],
        message: "well done",
        obj: {
          message: "well done2",
        }
      }
    }
  ],

  obj1: {
    obj2: {
      objs: [
        {t: 1},
        {t: 2}
      ],
      message: "sample"
    }
  }
};

const mockArray =[
  mockObj,
  {nest1: [{ message: "not nest2" }]},
  {nest1: [{ nest2: { message: "not well done" }}]},
];


describe("match", () => {
  it("should match nested string", () => {
    // for: { "obj1.obj2.message": "sample" }
    expect(
      match(mockObj, "obj1.obj2.message", "sample")
    ).toBe(true);
    expect(
      match(mockObj, "obj1.obj2.message", "nope")
    ).toBe(false);
  });

  it("should match array value", () => {
    // for: { "obj1.obj2.message": "sample" }
    expect(
      match(mockObj, "strs", "b")
    ).toBe(true);
  });

  it("should match nested array values", () => {
    expect(
      match(mockObj, "nest1.nest2.message", "well done")
    ).toBe(true);

    expect(
      match(mockObj, "nest1.nest2.obj.message", "well done2")
    ).toBe(true);

    expect(
      match(mockObj, "nest1.nest2.nest3", "y")
    ).toBe(true);
  });

  it("should match mockArray nested array values", () => {
    expect(
      match(mockArray, "nest1.nest2.message", "extra well done")
    ).toBe(false);

    const newMockArray = [
      ...mockArray,
      {nest1: [{ nest2: { message: "extra well done" }}]},
    ];
    expect(
      match(newMockArray, "nest1.nest2.message", "extra well done")
    ).toBe(true);

  });
});


// options: __strict=true, __conjugate=or,and,xor
describe("queryMatch", () => {

  const mockObj = {
    persons: [
      { name: "mike", id: 5, limbs: ["LH","LF"] },
      { name: "sash", id: 10, limbs: ["LH","LF","RF"] },
    ],
  };

  it("should match total object for RF", () => {
    expect(
      queryMatch({ "persons.limbs": "RF" })(mockObj)
    ).toBe(true);
  });

  it("should match person with RF", () => {
    expect(
      queryMatch({ "limbs": "RF" })(mockObj.persons[0])
    ).toBe(false);

    expect(
      queryMatch({ "limbs": "RF" })(mockObj.persons[1])
    ).toBe(true);
  });
});
