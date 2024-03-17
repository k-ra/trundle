<script lang="ts">
    import routes from "../data/processed/routes.json";
    import { start, dest } from "../stores/userdata.js";
    import { map } from "../stores/currentpage.js";
    import Trains from "./trains.svelte";

    interface Suggestion {
        start: any;
        dest: any;
        route_id: number;
        route_name: string;
        live_arrival_time: number;
    }

    function epochify(date_string: string) {
        var now = Date.now();
        // // convert "18:23:00"-likes to epoch format
        // const number_of_milliseconds_in_one_day = 86400000;

        // // test if first two digits are 00-04
        // if (parseInt(date_string.slice(0, 2)) < 5) {
        //     now += number_of_milliseconds_in_one_day;
        // }

        let date = new Date(now);
        return Date.parse(date.toDateString() + " " + date_string);
    }

    // gets trips between start and dest from now to 2 hours out
    // this returns an array of objects of type Suggestion, seen above;
    // 'start' and 'dest' are objects with full stop data, trips, etc.,
    // while route_id and route_name are just constants
    function getSuggestions(start_id: number, dest_id: number) {
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

            // create suggestions
            var looking_for_start = true;
            var suggestion: Suggestion = {
                start: {},
                dest: {},
                route_id: route.route_id,
                route_name: route.route_long_name,
                live_arrival_time: 0,
            };
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
                        suggestion = {
                            start: {},
                            dest: {},
                            route_id: route.route_id,
                            route_name: route.route_long_name,
                            live_arrival_time: 0,
                        };
                        looking_for_start = true;
                    }
                }
            }
        }
        return suggestions;
    }

    // returns update data on suggestions;
    // updates the live_arrival_time property of each suggestion
    function getSuggestionUpdates(suggestions: Suggestion[]) {
        // make fetch request to get live updates on trips
        fetch(
            "https://passio3.com/harvard/passioTransit/gtfs/realtime/tripUpdates.json",
        )
            .then((response) => response.json())
            .then((json) => {
                console.log("updating with live data...");
                console.debug(json);
                for (let suggestion of suggestions) {
                    let suggestion_start_trip_id =
                        suggestion.start.trip.trip_id;
                    let suggestion_dest_trip_id = suggestion.dest.trip.trip_id;
                    if (!Object.hasOwn(json, "entity")) {
                        return;
                    }
                    for (let trip of json.entity) {
                        let trip_update = trip.trip_update;
                        let trip_id = trip_update.trip.trip_id;
                        if (
                            trip_id === suggestion_start_trip_id ||
                            trip_id === suggestion_dest_trip_id
                        ) {
                            for (let stop of trip_update.stop_time_update) {
                                if (stop.stop_id === suggestion.start.stop_id) {
                                    suggestion.live_arrival_time =
                                        stop.arrival.time;
                                    break;
                                }
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                console.error("update error!:", error);
            });
        return suggestions;
    }

    var suggestions: Suggestion[] = [];

    var interval = 0;
    var need_new_suggestions = true;
    // when map is closed, load suggestions
    $: if (!$map) {
        if (need_new_suggestions) {
            suggestions = getSuggestions($start.stop_id, $dest.stop_id);
            need_new_suggestions = false;
        }
        if (interval === 0) {
            interval = setInterval(() => {
                suggestions = getSuggestionUpdates(suggestions);
            }, 20000);
        }
        console.log(interval);
    }
    // when map is opened, clear suggestions
    $: if ($map) {
        if (interval) {
            clearInterval(interval);
            interval = 0;
        }
        if (!need_new_suggestions) {
            suggestions = [];
            need_new_suggestions = true;
        }
    }
</script>

{#if !$map}
    <div class="list">
        {#each suggestions as suggestion}
            <div class="suggestion">
                <div class="route">
                    <p>
                        {suggestion.route_name}: board at {suggestion.start
                            .arrival_time}, arrive at {suggestion.dest
                            .arrival_time}
                    </p>
                </div>
                <div class="eta">
                    <p>
                        {#if suggestion.live_arrival_time != 0}
                            estimated time of arrival: {suggestion.live_arrival_time}
                        {:else}
                            no live information on this trip... it may not
                            currently be in service!
                        {/if}
                    </p>
                </div>
            </div>
        {:else}
            <div class="suggestion">
                <p>no suggestions for this particular route! :(</p>
            </div>
        {/each}
    </div>

    <Trains {suggestions} />
{/if}

<style>
    .list {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        margin: 20px;
    }

    .suggestion {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        background-color: lightgray;
        width: 65%;
    }

    .route {
        font-size: 20px;
    }

    .eta {
        font-size: 16px;
    }
</style>
