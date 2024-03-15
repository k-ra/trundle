<script lang="ts">
    import Input from "../lib/stopbuttons.svelte";
    import stops from "../data/processed/stops.json";

    function transform(lat: number, lon: number) {
        return `transform: translate(${lon}px, ${lat}px)`;
    }
</script>

<h1>trundling time</h1>
<Input {stops} />

<img src="thatguy.jpg" alt="little baby squirrel loves to navigate the world" />

<h3>
    (do NOT call me crusty !!! i am textured ) i jus drank milk all over my big
    chinney
</h3>
<div class="map">
    {#each stops as stop}
        <div class="stop" style={transform(stop.stop_lat, stop.stop_lon)}></div>
    {/each}
</div>

<h1 id="this">Everything is softer than mym hat.</h1>

<img src="thatguy.jpg" alt="little baby squirrel loves to navigate the world" />

<h2>do you want to know about what is on my Map!</h2>

<style>
    img {
        width: 900px;
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

    .map {
        width: 1000px;
        height: 1000px;
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        border: 2px solid black;
    }

    .stop {
        position: relative;
        top: 50%;
        left: 50%;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        margin: 10px;
        background-color: red;
    }
</style>
