import _ from "lodash";

export const queryMatch = (queryParams:object) => (obj:any) =>
  !!_.toPairs(queryParams).map(
    (([key, value]) => match(obj, key, value))
  ).find((r:any) => r===true);


export const match = (obj:any, qk:string, qv:any):boolean => {

  // recurse arrays
  if(_.isArray(obj)) {
    return matchArray(obj, qk, qv);
  }

  // recurse arrays anywhere in qk path
  const qks = qk.split(".");
  for(let i=0; i<qks.length; i++) {
    const subQk = qks.slice(0,i).join(".");
    const subQkObj = _.get(obj, subQk);
    if(_.isArray(subQkObj)) {
      return matchArray(subQkObj, qks.slice(i,qks.length).join("."), qv);
      // const results = subQkObj.map(
      //   (val:any, idx:number) => match(subQkObj[idx], qks.slice(i,qks.length).join("."), qv)
      // );
      // return _.uniq(results).length === 1 && results[0];
    }
  }

  const v = _.get(obj, qk);

  if(_.isArray(v)) {
    // @ts-ignore
    return !!v.find((val:any) => _.toLower(val) == _.toLower(qv));
  }

  if(typeof v === "object") {
    return false;
  }

  return _.toLower(v) == _.toLower(qv);
};

const matchArray = (array:any, qk:string, qv:any) => {
  const results = array.map(
    (val:any, idx:number) => match(array[idx], qk, qv)
  );
  // return _.uniq(results).length === 2 && results[0];
  return results.find((r:any) => r===true)===true;
};