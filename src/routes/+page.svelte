<script lang="ts">
    // data
    import stops from "../data/processed/stops.json";

    // components
    import Map from "$lib/stopmap.svelte";
    import Quirk from "$lib/quirk.svelte";
    import Sign from "$lib/sign.svelte";
    import Trains from "$lib/trains.svelte";
    // stores
    import { start, dest } from "../stores/userdata.js";
</script>

<Trains />
<Sign />

<h1 id="this" style="font-weight: normal;">trundle time</h1>

<Map />

<h1 id="this">
    {$start.stop_name} --> {$dest.stop_name}
</h1>

<Quirk />
