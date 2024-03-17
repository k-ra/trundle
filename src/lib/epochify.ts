export function epochify(date_string: string) {
  var now = Date.now();
  let date = new Date(now);
  return Date.parse(date.toDateString() + " " + date_string);
}

export function depochify(date_num: number) {
  let date = new Date(date_num);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}
