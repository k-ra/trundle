<script lang="ts">
    interface Suggestion {
        start: any;
        dest: any;
        route_id: number;
        route_name: string;
        live_arrival_time: number;
    }
    export let suggestions: Suggestion[];
    import { epochify } from "$lib/epochify.js";

    var now = Date.now();
    const _ = setInterval(() => {
        now = Date.now();
    }, 200);

    $: etas = calcEta(now, suggestions);

    function calcEta(now: number, suggestions: Suggestion[]): number[] {
        return suggestions.map((suggestion) => {
            if (suggestion.live_arrival_time != 0) {
                console.log((suggestion.live_arrival_time - now) / (1000 * 60));
                return (suggestion.live_arrival_time - now) / (1000 * 60);
            }
            return (
                (epochify(suggestion.start.arrival_time) - now) / (1000 * 60)
            );
        });
    }

    function trainTransform(eta: number) {
        let etaish = 1400 - eta * 63;
        return `transform: translateX(${etaish}px)`;
    }
</script>

<div class="train_container">
    {#each suggestions.slice(0, 3) as trip, i}
        <div class="track">
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
        height: 40%;
    }

    .track {
        width: 100%;
        background-image: url("mudtracks.png");
        background-repeat: no-repeat;
        background-position: center bottom;
        background-size: auto 100%;
    }

    .train {
        width: 350px;
    }
</style>
