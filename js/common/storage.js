export const storage = (name) => {
    let store = {};
    return {
        set: (k,v)=>store[k]=v,
        get: (k)=>store[k],
        has: (k)=>store[k]!==undefined
    };
};