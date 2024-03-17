// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export function epochify(date_string: string) {
  var now = Date.now();
  // convert "18:23:00"-likes to epoch format
  const number_of_milliseconds_in_one_day = 86400000;

  // test if first two digits are 00-04
  if (parseInt(date_string.slice(0, 2)) < 5) {
    now += number_of_milliseconds_in_one_day;
  }

  let date = new Date(now);
  return Date.parse(date.toDateString() + " " + date_string);
}
