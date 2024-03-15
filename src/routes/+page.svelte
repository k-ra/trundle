<script lang="ts">
    import Input from "../lib/stopbuttons.svelte";
    import stops from "../data/processed/stops.json";

    function transform(lat: number, lon: number) {
        const adj_lat = (lat - 42.37) * -30000;
        const adj_lon = (lon + 71.12) * 30000;
        console.log(adj_lat, adj_lon);

        return `transform: translate(${adj_lon}px, ${adj_lat}px)`;
    }
</script>

<h1>trundling time</h1>
<Input {stops} />

<h3>
    (do NOT call me crusty !!! i am textured ) i jus drank milk all over my big
    chinney
</h3>
<h1 id="this">Everything is softer than mym hat.</h1>

<img src="thatguy.jpg" alt="little baby squirrel loves to navigate the world" />

<h2>do you want to know about what is on my Map!</h2>

<div class="map_container">
    <div class="map">
        {#each stops as stop}
            <div class="stop" style={transform(stop.stop_lat, stop.stop_lon)}>
                {stop.stop_name}
            </div>
        {/each}
    </div>
</div>

<style>
    img {
        width: 200px;
        display: block;
        margin: 0 auto;
    }

    h2 {
        text-align: center;
    }

    #this {
        font-size: 120px;
        text-align: center;
    }

    .map_container {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .map {
        position: relative;
        width: 800px;
        height: 800px;
        border: 2px solid black;
    }

    .stop {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: red;
    }
</style>
