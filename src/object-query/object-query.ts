import _ from "lodash";

const toYesOrNo = (tf: any) => (tf === true || "yes" == _.toLower(tf) ? "yes" : "no");

const CONJUNCTION = {
  INTERSECTION: "intersection",
  UNION: "union"
};

export const queryMatch = (queryParams: object) => (obj: any) =>
  !!_.toPairs(queryParams)
    .map(([key, value]) => match(obj, key, value))
    .find((r: any) => r === true);

const queryFilterIntersection = (objects: Array<any>, queryParams: any) => {
  let filtered = objects;
  _.toPairs(queryParams).forEach(([key, value]) => {
    // match(obj, key, value)
    filtered = filtered.filter((obj) => match(obj, key, value));
  });
  return filtered;
};

const queryFilterUnion = (objects: Array<any>, queryParams: any) =>
  objects.filter((obj) =>
    _.toPairs(queryParams).map(
      ([key, value]) => match(obj, key, value)
    ).find(r => r === true)
  );

export const queryFilter = (objects: Array<any>, queryParams: any) => {
  if (_.keys(queryParams).length == 0) {
    return objects;
  }

  const { _conjunction } = queryParams;
  delete queryParams._conjunction;

  if (_conjunction === CONJUNCTION.INTERSECTION) {
    return queryFilterIntersection(objects, queryParams);
  }
  if (_conjunction === CONJUNCTION.UNION) {
    return queryFilterUnion(objects, queryParams);
  }

  // default
  return queryFilterIntersection(objects, queryParams);
};

export const match = (obj: any, qk: string, qv: any): boolean => {
  if (typeof qv === "string") {
    // ignore empty query value
    qv = qv.trim();
    if (qv == "") {
      return false;
    }

    // split-recurse multi-value eg: "1,4,6"
    if (qv.includes(",")) {
      return (
        qv
          .split(",")
          .map((splitQv: string) => match(obj, qk, splitQv))
          .find((r: boolean) => r === true) === true
      );
    }
  }

  // recurse arrays
  if (_.isArray(obj)) {
    return matchArray(obj, qk, qv);
  }

  // recurse arrays anywhere in qk path
  const qks = qk.split(".");
  for (let i = 0; i < qks.length; i++) {
    const subQk = qks.slice(0, i).join(".");
    const subQkObj = _.get(obj, subQk);
    if (_.isArray(subQkObj)) {
      return matchArray(subQkObj, qks.slice(i, qks.length).join("."), qv);
      // const results = subQkObj.map(
      //   (val:any, idx:number) => match(subQkObj[idx], qks.slice(i,qks.length).join("."), qv)
      // );
      // return _.uniq(results).length === 1 && results[0];
    }
  }

  const v = _.get(obj, qk);

  if (_.isArray(v)) {
    // @ts-ignore
    return !!v.find((val: any) => _.toLower(val) == _.toLower(qv));
  }

  if (typeof v === "object") {
    return false;
  }

  const lv = _.toLower(v);
  return lv == _.toLower(qv) || lv == toYesOrNo(qv);
};

const matchArray = (array: any, qk: string, qv: any) => {
  const results = array.map((val: any, idx: number) => match(array[idx], qk, qv));
  // return _.uniq(results).length === 2 && results[0];
  return results.find((r: any) => r === true) === true;
};
