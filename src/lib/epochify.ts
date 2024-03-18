export function epochify(date_string: string) {
  var now = Date.now();
  let date = new Date(now);
  return Date.parse(date.toDateString() + " " + date_string);
}

export function depochify(date_num: number) {
  let date = new Date(date_num);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

interface Suggestion {
  start: any;
  dest: any;
  route_id: number;
  route_name: string;
  live_arrival_time: number;
}

export function isEtaValid(suggestion: Suggestion) {
  const number_of_milliseconds_in_fifteen_minutes = 900000;
  return (
    suggestion.live_arrival_time != 0 &&
    epochify(suggestion.start.arrival_time) - suggestion.live_arrival_time <=
      number_of_milliseconds_in_fifteen_minutes
  );
}
