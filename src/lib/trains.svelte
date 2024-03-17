<script lang="ts">
    interface Suggestion {
        start: any;
        dest: any;
        route_id: number;
        route_name: string;
        live_arrival_time: number;
    }
    export let suggestions: Suggestion[];
    import { start } from "../stores/userdata.js";
    import { epochify } from "$lib/epochify.js";

    // let time = Date.now();
    //fake data
    // let trips = [
    //     {
    //         route: { route_id: 2235, route_long_name: "1636'er" },
    //         start: { arrival_time: "02:00:00" },
    //     },
    // ];

    var now = Date.now();
    const _ = setInterval(() => {
        now = Date.now();
    }, 200);

    $: etas = suggestions.map((suggestion) =>
        calcEta(suggestion.start.live_arrival_time, now),
    );

    function calcEta(arrival: string, timenow: number) {
        const eta = (epochify(arrival) - timenow) / (1000 * 60);
        return eta;
    }

    function trainTransform(eta: number) {
        let etaish = 1400 - eta * 63;
        return `transform: translateX(${etaish}px)`;
        // let etaPx = 1200 - eta * 15;
        // return `transform: translateX(${etaPx}px)`;
    }

    function trackTransform(count: number) {
        let reactivesz = 30 / count;
        return `height:${reactivesz}%`;
    }
</script>

<div class="styleheader">
    {$start.stop_name}
    <!-- <img src="stop.png" alt="trainstop" /> -->
</div>
epochify: {epochify("01:34:00")} millis: {now}.

<div class="train_container">
    {#each suggestions as trip, i}
        <div class="track" style={trackTransform(1)}>
            <img
                class="train"
                src="trains/{trip.route_id}.png"
                alt="alt"
                style={trainTransform(etas[i])}
            />
        </div>
    {/each}
</div>

<style>
    .train_container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: auto;
        position: relative;
    }
    .track {
        width: 100%;
        background-image: url("tracks.jpg");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% auto;
    }
    .train {
        width: 350px;
        /* transform: translate(1200px, 0%); */
    }
</style>
