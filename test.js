var obj = {};
arr = arr.reduce(function(item, next) {
  obj[next.key] ? '' : obj[next.key] = true && item.push(next);
  return item;
}, []);