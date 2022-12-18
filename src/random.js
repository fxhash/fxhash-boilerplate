// random number between a and b (b is not included)
const num = (a, b) => {
    return a + (b - a) * fxrand();
}

// random integer between a and b (b is included)// requires a < b
const int = (a, b) => {
  return Math.floor(num(a, b + 1));
}

// random boolean with p as percent likelihood of true
const bool = (p) => {
  return fxrand() < p;
}

// choose a random item in an array of items
const choice = (list) => {
  return list[int(0, list.length - 1)];
}

export { num, int, bool, choice };