<script lang="ts">
    export let stops;
    import { start, dest } from "../stores/userdata.js";
    let status = "start";
    let input = true;
    // mapping
    function transform(lat: number, lon: number) {
        const adj_lat = (lat - 42.37) * -32000;
        const adj_lon = (lon + 71.12) * 32000;
        console.log(adj_lat, adj_lon);

        return `transform: translate(${adj_lon}px, ${adj_lat}px)`;
    }

    // input stop_id to store
    function handleStopClick(stop: object) {
        if (status === "start") {
            start.set(stop);
            status = "end";
        } else {
            dest.set(stop);
            status = "";
            input = false;
        }
    }
</script>

{#if input}
    <div class="map_container">
        <div class="map">
            {#each stops as stop}
                <div
                    class="map-contents"
                    style={transform(stop.stop_lat, stop.stop_lon)}
                >
                    <!-- <div class="dot"></div> -->
                    <button
                        class={status}
                        on:click={() => handleStopClick(stop)}
                    >
                        <div class="dot"></div>
                        <div class="label">{stop.stop_name}</div>
                    </button>
                </div>
            {/each}
        </div>
    </div>
{/if}

<style>
    .map_container {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .map {
        position: relative;
        width: 800px;
        height: 800px;
        /* border: 2px solid black; */
    }

    .map-contents {
        position: absolute;
        top: 50%;
        left: 50%;
    }

    .dot {
        /* display: inline; */
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid #ced9d2;
        background-color: transparent;
        white-space: nowrap;
        display: inline-block;
    }
    .dot:hover {
        background-color: black;
    }

    .dot:hover + .label {
        display: inline-block;
    }

    .label {
        display: none;
    }

    .start {
        color: #20af8c;
    }

    .end {
        color: #8422a3;
    }

    button {
        font-size: 20pt;
        text-transform: lowercase;
        font-weight: bolder;
        border: none;
        background-color: transparent;
        transition: all 0.3s ease-out 50ms;
    }

    button:hover {
        font-weight: bolder;
        /* font-size: 20pt; */
    }
</style>
