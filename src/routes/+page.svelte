<script lang="ts">
    import stops from "../data/processed/stops.json";
    import Map from "../lib/stopmap.svelte";
    import { start, dest } from "../stores/userdata.js";
    import Quirk from "../lib/quirk.svelte";
</script>

<h1 id="this" style="font-weight: normal;">trundle time</h1>

<Map {stops} />
<h1 id="this">
    {$start.stop_name} --> {$dest.stop_name}
</h1>
<br />
<Quirk />
