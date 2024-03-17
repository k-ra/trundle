<script lang="ts">
    import routes from "../data/processed/routes.json";
    import { start, dest } from "../stores/userdata.js";
    import { map } from "../stores/currentpage.js";
    import Trains from "./trains.svelte";
    import { epochify, depochify } from "$lib/epochify.js";
    import Layout from "../routes/+layout.svelte";

    interface Suggestion {
        start: any;
        dest: any;
        route_id: number;
        route_name: string;
        live_arrival_time: number;
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

                const number_of_milliseconds_in_one_hour = 3600000;
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
                    time_to_end_of_trip < number_of_milliseconds_in_one_hour &&
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
                    if (
                        stop.stop_id === start_id &&
                        epochify(stop.arrival_time) >= Date.now()
                    ) {
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
                            trip_id == suggestion_start_trip_id ||
                            trip_id == suggestion_dest_trip_id ||
                            trip_id == suggestion_start_trip_id - 1
                        ) {
                            console.log(trip_id);
                            for (let stop of trip_update.stop_time_update) {
                                if (stop.stop_id == suggestion.start.stop_id) {
                                    suggestion.live_arrival_time =
                                        stop.arrival.time * 1000; // it's given in seconds, oddly enough
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
            suggestions = getSuggestionUpdates(suggestions);
            interval = setInterval(() => {
                suggestions = getSuggestionUpdates(suggestions);
            }, 20000);
        }
        suggestions = suggestions;
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

    // convert times from "03:30:00" to "3:30"
    function timeSlicken(time: string) {
        let time_arr = time.split(":");
        let hours = parseInt(time_arr[0]);
        let minutes = time_arr[1];
        let ampm = "am";
        if (hours > 12) {
            hours -= 12;
            ampm = "pm";
        }
        return `${hours}:${minutes} ${ampm}`;
    }

    // animate ellipses for pending
    var iter_ellipses = ".";
    const _ = setInterval(() => {
        if (iter_ellipses.length === 3) {
            iter_ellipses = ".";
        } else {
            iter_ellipses += ".";
        }
    }, 500);
</script>

{#if !$map}
    <div class="list">
        <div class="toprow">
            <table>
                <tr>
                    <th>train</th>
                    <th>board at</th>
                    <th>arrive at</th>
                    <th>live eta</th>
                </tr>
                {#each suggestions as suggestion}
                    <tr class="suggestion"> </tr><tr>
                        <td class="rtname">{suggestion.route_name}</td>
                        <td> {timeSlicken(suggestion.start.arrival_time)}</td>
                        <td> {timeSlicken(suggestion.dest.arrival_time)}</td>
                        <td class="eta">
                            {#if suggestion.live_arrival_time != 0}
                                ~{timeSlicken(
                                    depochify(suggestion.live_arrival_time),
                                )}{iter_ellipses}
                            {:else}
                                [pending{iter_ellipses}]
                            {/if}</td
                        >
                    </tr>
                {:else}
                    <td colspan="4" class="suggestion">
                        <p>no suggestions for this particular route!</p>
                    </td>
                {/each}
            </table>

            <img src="stop.png" class="stop" alt="train station stop" />
        </div>

        <Trains {suggestions} />
    </div>
{/if}

<style>
    .list {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        /* margin: 20px; */
        font-size: 18pt;
    }

    .toprow {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: end;
        width: 100%;
    }

    .suggestion {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        width: 65%;
    }

    table {
        margin-left: 35%;
        border-spacing: 10px;
        padding-left: 12px;
        padding-right: 12px;
        background: url("sign.jpg");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% 100%;
    }

    th {
        /* background: url("signlet.jpg");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% 100%; */
        padding: 10px;
    }

    td {
        text-align: center;
        padding: 5px;
    }

    .eta {
        text-align: left;
        width: 110px;
    }

    .rtname {
        text-transform: uppercase;
    }

    .stop {
        justify-self: end;
        height: 200px;
        transform: translateY(80px);
    }
</style>
