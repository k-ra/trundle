export function epochify(date_string: string) {
  var now = Date.now();
  let date = new Date(now);
  return Date.parse(date.toDateString() + " " + date_string);
}
