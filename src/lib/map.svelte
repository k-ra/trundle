<script lang="ts">
    import stops from "../data/processed/stops.json";
    import { start, dest } from "../stores/userdata.js";
    import { map } from "../stores/currentpage.js";

    function transform(lat: number, lon: number, name: string) {
        // // convert floats to strings with 9 decimal places (add trailing zeroes if needed)
        // const lat_string = lat.toFixed(9);
        // const lon_string = lon.toFixed(9);

        // // knock off decimals, convert to integers
        // const lat_int = parseInt(lat_string.replace(".", ""));
        // const lon_int = parseInt(lon_string.replace(".", ""));

        // // adjust ints
        // const adj_lat = (lat_int - 42370000000) * -32000;
        // const adj_lon = (lon_int + 71120000000) * 32000;

        let adj_lat = (lat - 42.3712) * -32000;
        let adj_lon = (lon + 71.1195) * 32000;

        if (
            name === "Stadium (Northbound)" ||
            name === "Barry's Corner (Northbound)"
        ) {
            adj_lat -= 14;
            adj_lon += 14;
        }

        return `transform: translate(${adj_lon}px, ${adj_lat}px)`;
    }

    // input stop_id to store
    function handleStopClick(stop: any) {
        if ($start.stop_id === 0) {
            start.set(stop);
        } else {
            dest.set(stop);
            map.set(false);
            console.debug(`setting ${$map} to false, switching to sign page`);
        }
    }
</script>

{#if $map}
    <div class="map_container">
        <div class="map">
            {#each stops as stop}
                <div
                    class="map-contents"
                    style={transform(
                        stop.stop_lat,
                        stop.stop_lon,
                        stop.stop_name,
                    )}
                >
                    <button
                        class={$start.stop_id === 0 ? "start" : "end"}
                        on:click={() => handleStopClick(stop)}
                    >
                        <div class="dot"></div>
                        <div class="label">{stop.stop_name}</div>
                    </button>
                </div>
            {/each}
        </div>
    </div>

    <h1 class="current_route">
        {$start.stop_name} → {$dest.stop_name}
    </h1>
{/if}

<style>
    .map_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: center;
    }

    .map {
        background-image: url("map.jpg");
        background-repeat: no-repeat;
        background-position: center center;
        position: relative;
        width: 100%;
        height: 100%;
    }

    .map-contents {
        position: absolute;
        top: 44.5%;
        left: 53.7%;
    }

    .dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid #ced9d2;
        background-color: transparent;
        white-space: nowrap;
        display: inline-block;
        z-index: 1;
    }

    .dot:hover {
        background-color: black;
        z-index: inherit;
    }

    .dot:hover + .label {
        z-index: inherit;
        display: inline-block;
        background-color: white;
    }

    .label {
        z-index: 2;
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

    .current_route {
        position: fixed;
        width: 100%;
        bottom: 40px;
        font-size: 22pt;
        font-weight: normal;
        text-align: center;
        text-transform: lowercase;
    }
</style>
