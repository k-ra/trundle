<script lang="ts">
    import routes from "../data/processed/routes.json";
    import { start, dest } from "../stores/userdata.js";
    import { map } from "../stores/currentpage.js";
    import Trains from "./trains.svelte";
    import { epochify, depochify, isEtaValid } from "$lib/epochify.js";

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
        console.debug(`getting suggestions...`);
        // list of suggestions; to be returned
        let suggestions = [];

        for (let route_key in routes) {
            // initial check
            console.debug(`initial check for route ${route_key}...`);
            let route = routes[route_key];
            let trips = route.trips;
            if (!trips) {
                console.debug(`no trips for route ${route_key}!`);
                continue;
            }
            console.debug(`passed initial check!`);

            // filter out trips not within two hours of now and not today
            let valid_trips = [];
            for (let trip_key in trips) {
                console.debug(`checking trip ${trip_key}...`);
                let trip = trips[trip_key as keyof typeof trips];
                if (!trip) {
                    console.debug(`no trip for trip_key ${trip_key}!`);
                    break;
                }
                console.debug(`passed trip check!`);

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
                console.debug(
                    `checking whether ${time_to_end_of_trip} is within ${number_of_milliseconds_in_one_hour}ms...`,
                );
                console.debug(
                    `checking whether ${trip.days} includes ${day_names[new Date(Date.now()).getDay()]}...`,
                );
                if (
                    time_to_end_of_trip < number_of_milliseconds_in_one_hour &&
                    time_to_end_of_trip >= 0 &&
                    trip.days.includes(day_names[new Date(Date.now()).getDay()])
                ) {
                    console.debug(`checks passed; valid trip found:`);
                    console.debug(trip);
                    valid_trips.push(trip);
                }
            }

            // filter out stops not at start or dest
            let valid_stops = [];
            for (let trip of valid_trips) {
                console.debug(`checking valid trip ${trip.trip_id}...`);
                let stops = trip.stops;
                for (let stop of stops) {
                    console.debug(
                        `checking whether ${stop.stop_id} is equal to ${start_id} or ${dest_id}...`,
                    );
                    if (stop.stop_id === start_id || stop.stop_id === dest_id) {
                        const stop_with_trip = { ...stop, trip: trip };
                        console.debug(`check passed; valid stop found:`);
                        console.debug(stop_with_trip);
                        valid_stops.push(stop_with_trip);
                    }
                }
            }

            console.debug(`sorting valid stops...`);
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
                console.debug(`checking valid stop ${stop.stop_id}...`);
                if (looking_for_start) {
                    console.debug(
                        `start: checking whether ${stop.stop_id} is equal to ${start_id} and ${stop.arrival_time} in the future...`,
                    );
                    if (
                        stop.stop_id === start_id &&
                        epochify(stop.arrival_time) >= Date.now()
                    ) {
                        suggestion.start = stop;
                        looking_for_start = false;
                    }
                } else {
                    console.debug(
                        `dest: checking whether ${stop.stop_id} is equal to ${dest_id}...`,
                    );
                    if (
                        stop.stop_id === dest_id &&
                        epochify(stop.arrival_time) >
                            epochify(suggestion.start.arrival_time) &&
                        stop.trip.trip_id === suggestion.start.trip.trip_id
                    ) {
                        suggestion.dest = stop;
                        console.debug(`check passed; valid suggestion found:`);
                        console.debug(suggestion);
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

        console.debug(`sorting suggestions...`);
        suggestions.sort((a, b) => {
            return (
                epochify(a.start.arrival_time) - epochify(b.start.arrival_time)
            );
        });

        console.debug(`got suggestions:`);
        console.debug(suggestions);

        return suggestions;
    }

    // returns update data on suggestions;
    // updates the live_arrival_time property of each suggestion
    function getSuggestionUpdates(suggestions: Suggestion[]) {
        // make fetch request to get live updates on trips
        console.debug(`getting suggestion updates...`);
        fetch(
            "https://passio3.com/harvard/passioTransit/gtfs/realtime/tripUpdates.json",
        )
            .then((response) => response.json())
            .then((json) => {
                console.debug(`response obtained!`);
                for (let suggestion of suggestions) {
                    console.debug(
                        `updating suggestion ${suggestion.start.arrival_time} -> ${suggestion.dest.arrival_time}...`,
                    );
                    let suggestion_start_trip_id =
                        suggestion.start.trip.trip_id;
                    if (!Object.hasOwn(json, "entity")) {
                        console.debug(
                            `no entities found in response! returning...`,
                        );
                        return;
                    }
                    for (let trip of json.entity) {
                        let trip_update = trip.trip_update;
                        let trip_id = trip_update.trip.trip_id;
                        console.debug(
                            `checking whether trip ${trip_id} is equal to ${suggestion_start_trip_id} or ${suggestion_start_trip_id - 1}...`,
                        );
                        if (
                            trip_id == suggestion_start_trip_id ||
                            trip_id == suggestion_start_trip_id - 1
                        ) {
                            console.debug(`trip equal to ${trip_id}!`);
                            for (let stop of trip_update.stop_time_update) {
                                console.debug(
                                    `checking whether ${stop.stop_id} is equal to ${suggestion.start.stop_id}...`,
                                );
                                if (stop.stop_id == suggestion.start.stop_id) {
                                    console.debug(
                                        `stop equal to ${stop.stop_id}!`,
                                    );
                                    suggestion.live_arrival_time =
                                        stop.arrival.time * 1000; // it's given in seconds, oddly enough
                                    console.debug(
                                        `updated suggestion: ${depochify(suggestion.live_arrival_time)}`,
                                    );
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

    function backButton() {
        start.set({ stop_name: "click start", stop_id: 0 });
        dest.set({ stop_name: "click dest", stop_id: 0 });
        map.set(true);
    }

    var reactivity_hack = Date.now();
    setInterval(() => {
        reactivity_hack = Date.now();
    }, 200);

    $: etas = calcEta(reactivity_hack, suggestions);

    function calcEta(
        reactivity_hack: number,
        suggestions: Suggestion[],
    ): string[] {
        return suggestions.map((suggestion) => {
            if (!isEtaValid(suggestion)) {
                return "";
            }
            return timeSlicken(depochify(suggestion.live_arrival_time));
        });
    }

    var suggestions: Suggestion[] = [];

    var interval = 0;
    // when map is closed, load suggestions
    $: if (!$map) {
        suggestions = getSuggestions($start.stop_id, $dest.stop_id);
        startSuggestionUpdates();
    }

    // runs getSuggestionUpdates every 10 seconds, and once immediately
    function startSuggestionUpdates() {
        suggestions = getSuggestionUpdates(suggestions);
        interval = setInterval(() => {
            suggestions = getSuggestionUpdates(suggestions);
        }, 10000);
    }

    // when map is opened, clear suggestions
    $: if ($map) {
        clearInterval(interval);
        suggestions = [];
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
        if (hours === 0) {
            hours = 12;
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
            <button class="back-button" on:click={backButton}>back</button>

            <table>
                <tr>
                    <th>train</th>
                    <th>board at</th>
                    <th>alight at</th>
                    <th>live eta</th>
                </tr>
                {#each suggestions as suggestion, i}
                    <tr>
                        <td class="rtname">{suggestion.route_name}</td>
                        <td> {timeSlicken(suggestion.start.arrival_time)}</td>
                        <td> {timeSlicken(suggestion.dest.arrival_time)}</td>
                        <td class="eta">
                            {#if isEtaValid(suggestion) && reactivity_hack}
                                ~{etas[i]}{iter_ellipses}
                            {:else}
                                [pending{iter_ellipses}]
                            {/if}</td
                        >
                    </tr>
                {:else}
                    <tr>
                        <td colspan="4">
                            <p>no suggestions for this particular route!</p>
                        </td>
                    </tr>
                {/each}
            </table>

            <img src="stop.png" class="stop" alt="train station stop" />
        </div>

        <Trains {suggestions} />
    </div>

    <h2 class="current_route">{$start.stop_name} → {$dest.stop_name}</h2>
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

    table {
        margin-left: 20%;
        border-spacing: 10px;
        padding-left: 12px;
        padding-right: 12px;
        padding-bottom: 10px;
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
        width: 120px;
    }

    .rtname {
        text-transform: uppercase;
    }

    .stop {
        justify-self: end;
        height: 200px;
        transform: translateY(110px);
    }

    .current_route {
        position: fixed;
        top: 55px;
        right: 50px;
        font-size: 18pt;
        font-weight: normal;
        text-align: center;
        text-transform: lowercase;
    }

    .back-button {
        align-self: start;
        margin-left: 20px;
        margin-top: 20px;
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        font-size: 18pt;
        background-color: #f0f0f0;
        border: 1px solid #000;
        border-radius: 5px;
    }
</style>
