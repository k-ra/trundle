<script lang="ts">
    import routes from "../data/processed/routes.json";
    import { start, dest } from "../stores/userdata.js";
    let date = new Date();
    $: time = date.toLocaleTimeString();
    // loop through all routes, check trips -> first trip -> stops. if (Include START and DEST) then RUN TRIP FUNCTIOn

    function debuglol() {
        console.log(getSuggestions($start.stop_id, $dest.stop_id));
    }

    //runs once at the start, gets relevant routes between start and dest
    function getRoutes(start_id: number, dest_id: number) {
        let route_ids = [];
        for (let route_key in routes) {
            let route = routes[route_key];
            let trips = route.trips;
            if (!trips) {
                continue;
            }
            for (let trip_key in trips) {
                let trip = trips[trip_key as keyof typeof trips];
                if (!trip) {
                    break;
                }
                let stops = trip.stops;
                var count = 0;
                for (let stop of stops) {
                    if (stop.stop_id === start_id || stop.stop_id === dest_id) {
                        count += 1;
                    }
                }
                if (count === 2) {
                    route_ids.push(route.route_long_name);
                    break;
                }
            }
        }
        return route_ids;
    }

    // gets trips between start and dest from now to 2 hours out
    function getSuggestions(start_id: number, dest_id: number) {
        // convert "18:23:00"-likes to epoch format
        function epochify(date_string: string) {
            return Date.parse(
                new Date(Date.now()).toDateString() + " " + date_string,
            );
        }

        // list of suggestions; to be returned
        let suggestions = [];

        for (let route_key in routes) {
            // initial check
            let route = routes[route_key];
            let trips = route.trips;
            if (!trips) {
                continue;
            }

            // filter out trips not within two hours of now and not today
            let valid_trips = [];
            for (let trip_key in trips) {
                let trip = trips[trip_key as keyof typeof trips];
                if (!trip) {
                    break;
                }

                const number_of_milliseconds_in_two_hours = 7200000;
                const day_names = [
                    "sunday",
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                ];

                const time_to_end_of_trip =
                    epochify(trip.last_arrival_time) - Date.now();
                if (
                    time_to_end_of_trip < number_of_milliseconds_in_two_hours &&
                    time_to_end_of_trip >= 0 &&
                    trip.days.includes(day_names[new Date(Date.now()).getDay()])
                ) {
                    valid_trips.push(trip);
                }
            }

            // filter out stops not at start or dest
            let valid_stops = [];
            for (let trip of valid_trips) {
                let stops = trip.stops;
                for (let stop of stops) {
                    if (stop.stop_id === start_id || stop.stop_id === dest_id) {
                        const stop_with_trip = { ...stop, trip: trip };
                        valid_stops.push(stop_with_trip);
                    }
                }
            }

            valid_stops.sort((a, b) => {
                return epochify(a.arrival_time) - epochify(b.arrival_time);
            });

            var looking_for_start = true;
            var suggestion = { start: {}, dest: {}, route: route };
            for (let stop of valid_stops) {
                if (looking_for_start) {
                    if (stop.stop_id === start_id) {
                        suggestion.start = stop;
                        looking_for_start = false;
                    }
                } else {
                    if (stop.stop_id === dest_id) {
                        suggestion.dest = stop;
                        suggestions.push(suggestion);
                        suggestion = { start: {}, dest: {}, route: route };
                        looking_for_start = true;
                    }
                }
            }
        }
        return suggestions;
    }
</script>

<button on:click={debuglol}>Make it happen.</button>
